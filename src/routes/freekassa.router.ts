import { Router } from 'express';
import multer from 'multer';

import { decodeJWTMiddleware } from '../middlewares/decodeJWT.middleware';
import { create, handler } from '../controllers/freekassa.controller';

const router = Router();

const multerMiddleware = multer();

router.get('/', decodeJWTMiddleware(), create);
router.post('/', multerMiddleware.none(), handler);

export { router as freekassaRouter };
