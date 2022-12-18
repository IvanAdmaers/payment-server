import axios, { AxiosError } from 'axios';
import jwt from 'jsonwebtoken';

import { IPaymentSchema } from '../types';

const paymentNotificationURL = process.env.PAYMENT_NOTIFICATION_URL;
const securityJwtToken = process.env.SECURITY_JWT_TOKEN;

export class NotificationService {
  public static async notify(orderId: IPaymentSchema['orderId']) {
    if (paymentNotificationURL === undefined) {
      throw new Error('paymentNotificationURL is undefined');
    }

    try {
      const token = this.createToken(orderId);

      await axios.post(paymentNotificationURL!, { token });

      return { success: true };
    } catch (error) {
      const thisError = error as Error | AxiosError;

      if (axios.isAxiosError(thisError)) {
        console.error(
          `Error while sending a notification to url ${paymentNotificationURL}`
        );

        return { success: false };
      }

      console.error(thisError);
      return { success: false };
    }
  }

  private static createToken(orderId: IPaymentSchema['orderId']) {
    if (securityJwtToken === undefined) {
      throw new Error('securityJwtToken is undefined');
    }

    const token = jwt.sign({ orderId }, securityJwtToken!, {
      expiresIn: 5 * 60 * 1000,
    });

    return token;
  }
}
