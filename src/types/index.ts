import { Request } from 'express';

import {
  PAYPALYCH_NOTIFICATION_SUCCESS_STATUS,
  PAYPALYCH_NOTIFICATION_FAIL_STATUS,
} from '../constants';

export interface IPaypalychRequest {
  amount: number;
  order_id: string;
  description?: string;
  type?: string;
  shop_id: string;
  currency_in: string;
  name?: string;
}

export interface IPaypalychSuccess {
  success: boolean;
  link_url: string;
  link_page_url: string;
  bill_id: string;
}

export interface IPaypalychError {
  message: string;
}

export interface IRequestWithTokenData extends Request {
  tokenData?: object;
}

export interface ICreatePaymentData {
  amount: number;
  orderId: string;
}

export interface ICreatePaypalychPaymentParams {
  amount?: number;
  orderId?: string;
  currency?: string;
}

export interface ICreateFreeKassaPaymentParams {
  amount?: ICreatePaypalychPaymentParams['amount'];
  orderId?: ICreatePaypalychPaymentParams['orderId'];
  currency?: ICreatePaypalychPaymentParams['currency'];
  email?: string;
  paymentMethod: number;
}

export interface IPaymentSchema {
  orderId: string;
  amount: number;
  currency: string;
  paid: boolean;
  link: string;
  paidAt?: Date;
  paymentSystem: string;
}

export interface IPaymentDocument {
  amount: IPaymentSchema['amount'];
  orderId: IPaymentSchema['orderId'];
  currency: IPaymentSchema['currency'];
  link: IPaymentSchema['link'];
  paymentSystem: IPaymentSchema['paymentSystem'];
}

export interface IPaypalychPaymentNotification {
  InvId: string;
  OutSum: number;
  Commission: number;
  Currency: string;
  TrsId: string;
  Status:
    | typeof PAYPALYCH_NOTIFICATION_SUCCESS_STATUS
    | typeof PAYPALYCH_NOTIFICATION_FAIL_STATUS;
  CurrencyIn: string;
  custom?: string;
  SignatureValue: string;
}

export interface ICheckPaypalychSignature {
  outputSum: IPaypalychPaymentNotification['OutSum'];
  invoiceId: IPaypalychPaymentNotification['InvId'];
  signature: IPaypalychPaymentNotification['SignatureValue'];
}

export interface IFreeKassaRequest {
  shopId: string;
  amount: number;
  currency: string;
  orderId: string;
  paymentMethod?: number;
  email?: string;
  secretWord1: string;
}

export interface IFreeKassaRequestParams {
  m: string;
  oa: number;
  currency: string;
  o: string;
  i?: number;
  em?: string;
  s: string;
}

export interface IFreeKassaHandlerParams {
  MERCHANT_ID?: string;
  AMOUNT?: string;
  intid?: string;
  MERCHANT_ORDER_ID?: string;
  P_EMAIL?: string;
  SIGN?: string;
  CUR_ID?: string;
}

export interface ICheckFreeKassaSignature {
  shopId: string;
  amount: number;
  secretWord2: string;
  orderId: string;
}
