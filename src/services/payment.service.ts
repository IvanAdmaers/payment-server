import PaymentModel from '../models/payment.model';

import { IPaymentDocument, IPaymentSchema } from '../types';

export class PaymentService {
  public static async create(data: IPaymentDocument) {
    const newPayment = new PaymentModel(data);

    await newPayment.save();
  }

  public static async findOne(orderId: string) {
    const payment = await PaymentModel.findOne({ orderId })
      .select('amount orderId currency paid')
      .lean();

    return payment;
  }

  public static async setPaidStatus(
    orderId: string,
    status: IPaymentSchema['paid']
  ) {
    await PaymentModel.findOneAndUpdate(
      { orderId },
      { $set: { paid: status, paidAt: Date.now() } }
    );
  }
}
