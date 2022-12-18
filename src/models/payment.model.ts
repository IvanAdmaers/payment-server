import { Schema, model } from 'mongoose';

import { IPaymentSchema } from '../types';

const paymentSchema = new Schema<IPaymentSchema>(
  {
    orderId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    paymentSystem: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default model<IPaymentSchema>('Payment', paymentSchema);
