import { Request, Response, NextFunction } from 'express';

import { APIError } from '../exceptions/APIError';

export const notFoundHandlerMiddleware =
  () => (req: Request, res: Response, next: NextFunction) =>
    next(APIError.notFound());
