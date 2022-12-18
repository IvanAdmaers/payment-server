import { Response, NextFunction } from 'express';

import {
  IRequestWithTokenData,
  ICreateFreeKassaPaymentParams,
  IFreeKassaHandlerParams,
} from '../types';
import { APIError } from '../exceptions/APIError';
import { FreeKassaService } from '../services/freekassa.service';
import { PaymentService } from '../services/payment.service';
import { FREEKASSA_PAYMENT_SYSTEM } from '../constants';
import { NotificationService } from '../services/notification.service';

const freeKassaShopId = process.env.FREEKASSA_SHOP_ID;
const freeKassaSecretWord1 = process.env.FREEKASSA_SECRET_WORD_1;
const freeKassaSecretWord2 = process.env.FREEKASSA_SECRET_WORD_2;

export const create = async (
  req: IRequestWithTokenData,
  res: Response,
  next: NextFunction
) => {
  if (freeKassaShopId === undefined) {
    throw new Error('freeKassaShopId is undefined');
  }

  if (freeKassaSecretWord1 === undefined) {
    throw new Error('freeKassaSecretWord1 is undefined');
  }

  try {
    const { amount, orderId, currency, email, paymentMethod } =
      req.tokenData as ICreateFreeKassaPaymentParams;

    if (typeof amount !== 'number') {
      return next(APIError.badRequest('Amount is undefined'));
    }

    if (typeof orderId !== 'string') {
      return next(APIError.badRequest('orderId is incorrect'));
    }

    if (typeof currency !== 'string') {
      return next(APIError.badRequest('currency is incorrect'));
    }

    if (paymentMethod !== undefined && typeof paymentMethod !== 'number') {
      return next(APIError.badRequest('paymentMethod is incorrect'));
    }

    const link = FreeKassaService.create({
      shopId: freeKassaShopId,
      amount,
      currency,
      orderId,
      paymentMethod,
      email,
      secretWord1: freeKassaSecretWord1,
    });

    await PaymentService.create({
      amount,
      orderId,
      link,
      currency,
      paymentSystem: FREEKASSA_PAYMENT_SYSTEM,
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
  if (freeKassaShopId === undefined) {
    throw new Error('freeKassaShopId is undefined');
  }

  if (freeKassaSecretWord2 === undefined) {
    throw new Error('freeKassaSecretWord2 is undefined');
  }

  try {
    const {
      MERCHANT_ORDER_ID: orderId,
      SIGN: signature,
      AMOUNT,
    } = req.body as IFreeKassaHandlerParams;

    if (orderId === undefined) {
      return next(APIError.badRequest('MERCHANT_ORDER_ID is undefined'));
    }

    if (signature === undefined) {
      return next(APIError.badRequest('signature is undefined'));
    }

    if (AMOUNT === undefined) {
      return next(APIError.badRequest('AMOUNT is undefined'));
    }

    const amount = parseInt(AMOUNT, 10);

    // Check signature
    const isCorrectSignature = FreeKassaService.checkSignature(
      {
        shopId: freeKassaShopId,
        amount,
        secretWord2: freeKassaSecretWord2,
        orderId,
      },
      signature
    );

    if (isCorrectSignature === false) {
      return next(APIError.badRequest('Signature is not correct'));
    }

    const payment = await PaymentService.findOne(orderId);

    if (payment === null) {
      return next(APIError.badRequest('Payment not found'));
    }

    if (payment.amount !== amount) {
      return next(APIError.badRequest('Amounts do not match'));
    }

    if (payment.paid === true) {
      return next(APIError.badRequest('Order has been paid'));
    }

    // All checks are passed
    await Promise.all([
      PaymentService.setPaidStatus(orderId, true),
      NotificationService.notify(payment.orderId),
    ]);

    return res.status(200).send('YES');
  } catch (error) {
    return next(error);
  }
};
