import { Response, NextFunction } from 'express';

import { PaypalychService } from '../services/paypalych.service';
import { APIError } from '../exceptions/APIError';
import {
  ICreatePaypalychPaymentParams,
  IPaypalychRequest,
  IRequestWithTokenData,
} from '../types';
import { PaymentService } from '../services/payment.service';
import {
  PAYPALYCH_NOTIFICATION_FAIL_STATUS,
  PAYPALYCH_PAYMENT_SYSTEM,
} from '../constants';
import { NotificationService } from '../services/notification.service';

const paypalychShopId = process.env.PAYPALYCH_SHOP_ID;
const paypalychApiToken = process.env.PAYPALYCH_API_TOKEN;
const paymentNotificationURL = process.env.PAYMENT_NOTIFICATION_URL;

export const create = async (
  req: IRequestWithTokenData,
  res: Response,
  next: NextFunction
) => {
  if (paypalychApiToken === undefined) {
    throw new Error('paypalychApiToken is undefined');
  }

  if (paypalychShopId === undefined) {
    throw new Error('paypalychShopId is undefined');
  }

  try {
    const { amount, orderId, currency } =
      req.tokenData as ICreatePaypalychPaymentParams;

    if (typeof amount !== 'number') {
      return next(APIError.badRequest('Amount is undefined'));
    }

    if (typeof orderId !== 'string') {
      return next(APIError.badRequest('orderId is undefined'));
    }

    if (typeof currency !== 'string') {
      return next(APIError.badRequest('currency is undefined'));
    }

    const paymentDescription = `Оплата заказа ${orderId}`;

    const paypalychRequest: IPaypalychRequest = {
      amount,
      order_id: orderId,
      description: paymentDescription,
      type: 'normal',
      shop_id: paypalychShopId,
      currency_in: currency,
      name: paymentDescription,
    };

    const { error, link } = await PaypalychService.create(
      paypalychRequest,
      paypalychApiToken
    );

    if (error !== null) {
      return next(APIError.badRequest(error));
    }

    await PaymentService.create({
      amount,
      orderId,
      link: link!,
      currency,
      paymentSystem: PAYPALYCH_PAYMENT_SYSTEM,
    });

    return res.status(201).json({ link });
  } catch (error) {
    return next(error);
  }
};

export const handler = async (
  req: IRequestWithTokenData,
  res: Response,
  next: NextFunction
) => {
  if (paypalychApiToken === undefined) {
    throw new Error('paypalychApiToken is undefined');
  }

  if (paymentNotificationURL === undefined) {
    throw new Error('paymentNotificationURL is undefined');
  }

  try {
    const {
      InvId: invId,
      Status: status,
      SignatureValue: signatureValue,
      OutSum: outSum,
      CurrencyIn: currencyIn,
    } = req.body;

    if (
      invId === undefined ||
      signatureValue === undefined ||
      outSum === undefined ||
      currencyIn === undefined
    ) {
      return next(APIError.badRequest('Some params are empty'));
    }

    // Check signature
    const isCorrectSignature = PaypalychService.checkSignature(
      {
        outputSum: outSum,
        invoiceId: invId,
        signature: signatureValue,
      },
      paypalychApiToken
    );

    if (isCorrectSignature === false) {
      return next(APIError.badRequest('Signature is incorrect'));
    }

    if (status === PAYPALYCH_NOTIFICATION_FAIL_STATUS) {
      return next(APIError.badRequest('Payment failed'));
    }

    const payment = await PaymentService.findOne(invId);

    if (payment === null) {
      return next(APIError.badRequest('Payment not found'));
    }

    if (payment.amount !== parseInt(outSum, 10)) {
      return next(APIError.badRequest('Amounts do not match'));
    }

    if (payment.currency.toUpperCase() !== currencyIn.toUpperCase()) {
      return next(APIError.badRequest('Currency changed'));
    }

    if (payment.paid === true) {
      return next(APIError.badRequest('Order has been paid'));
    }

    // All checks are passed
    await Promise.all([
      PaymentService.setPaidStatus(invId, true),
      NotificationService.notify(payment.orderId),
    ]);

    return res.status(200).send('OK');
  } catch (error) {
    return next(error);
  }
};
