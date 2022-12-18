import axios, { AxiosError } from 'axios';

import { md5 } from '../utills';

import {
  ICheckPaypalychSignature,
  IPaypalychError,
  IPaypalychRequest,
  IPaypalychSuccess,
} from '../types';

export class PaypalychService {
  public static async create(params: IPaypalychRequest, apiToken: string) {
    try {
      const { data } = await axios.post(
        'https://paypalych.com/api/v1/bill/create',
        params,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );

      const { link_page_url: linkPageUrl } = data as IPaypalychSuccess;

      return { error: null, link: linkPageUrl };
    } catch (error) {
      const thisError = error as Error | AxiosError;

      if (axios.isAxiosError(thisError)) {
        console.error(
          `Error while creating Paypalych payment:`,
          thisError.response?.data
        );

        return { error: (thisError.response?.data as IPaypalychError).message };
      }

      console.error(thisError);
      return { error: 'Что-то пошло не так' };
    }
  }

  public static checkSignature(
    { outputSum, invoiceId, signature }: ICheckPaypalychSignature,
    apiToken: string
  ) {
    const mySign = md5(`${outputSum}:${invoiceId}:${apiToken}`).toUpperCase();

    return mySign === signature;
  }
}
