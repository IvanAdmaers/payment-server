import { Router } from 'express';

import { decodeJWTMiddleware } from '../middlewares/decodeJWT.middleware';
import { create, handler } from '../controllers/paypalych.controller';

const router = Router();

router.post('/create', decodeJWTMiddleware(), create);
router.post('/handler', handler);

export { router as paypalychRouter };
