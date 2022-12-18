/* eslint-disable import/first */
import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connect } from 'mongoose';

dotenv.config();

import { paypalychRouter } from './routes/paypalych.router';
import { freekassaRouter } from './routes/freekassa.router';

import { errorHandlerMiddleware } from './middlewares/errorHandler.middleware';
import { notFoundHandlerMiddleware } from './middlewares/notFoundHandler.middleware';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/paypalych', paypalychRouter);
app.use('/freekassa', freekassaRouter);

// 404
app.use(notFoundHandlerMiddleware());

// Errors
app.use(errorHandlerMiddleware());

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const start = async () => {
  const URI = process.env.MONGODB_URI;

  if (URI === undefined) {
    throw new Error('MongoDB URI is not defined');
  }

  await connect(URI);

  app.listen(PORT, () => {
    console.log(`🚀 The server is running on PORT http://localhost:${PORT} 🚀`);
  });
};

start().catch(console.error);
