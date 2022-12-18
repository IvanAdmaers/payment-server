import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { APIError } from '../exceptions/APIError';
import { IRequestWithTokenData } from '../types';

const securityJwtToken = process.env.SECURITY_JWT_TOKEN;

export const decodeJWTMiddleware =
  () => (req: IRequestWithTokenData, res: Response, next: NextFunction) => {
    if (securityJwtToken === undefined) {
      throw new Error('securityJwtToken is undefined');
    }

    const token = req.body.token ?? req.query.token;

    if (token === undefined) {
      return next(APIError.badRequest('Token is undefined'));
    }

    try {
      const decodedData = jwt.verify(token, securityJwtToken);

      if (decodedData === null || typeof decodedData !== 'object') {
        return next(APIError.badRequest('Token is incorrect'));
      }

      req.tokenData = { ...decodedData };

      return next();
    } catch (error) {
      return next(APIError.badRequest('Invalid token'));
    }
  };
