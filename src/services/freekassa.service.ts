import { URL } from 'url';

import {
  ICheckFreeKassaSignature,
  IFreeKassaRequest,
  IFreeKassaRequestParams,
} from '../types';
import { md5 } from '../utills';

export class FreeKassaService {
  public static create({
    shopId,
    amount,
    currency,
    orderId,
    paymentMethod,
    email,
    secretWord1,
  }: IFreeKassaRequest) {
    const url = new URL('https://pay.freekassa.ru/');

    const signature = md5(
      `${shopId}:${amount}:${secretWord1}:${currency}:${orderId}`
    );

    const params: IFreeKassaRequestParams = {
      m: shopId,
      oa: amount,
      currency,
      o: orderId,
      s: signature,
    };

    if (paymentMethod !== undefined) {
      params.i = paymentMethod;
    }

    if (email !== undefined) {
      params.em = email;
    }

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, `${value}`);
    });

    return url.toString();
  }

  public static checkSignature(
    { shopId, amount, secretWord2, orderId }: ICheckFreeKassaSignature,
    signature: string
  ) {
    const mySign = md5(`${shopId}:${amount}:${secretWord2}:${orderId}`);

    return mySign === signature;
  }
}
