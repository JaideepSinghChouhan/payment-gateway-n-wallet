import { Router } from 'express';
import { createMerchantController, createOrder } from './merchant.controller';
import  authMiddleware  from '../middlewares/auth.middleware';
import { withdraw } from '../withdrawl/withdrawl.controller';
const router = Router();

router.post('/merchants', authMiddleware, createMerchantController);
router.post('/orders', createOrder);
router.post('/withdraw',authMiddleware, withdraw);

export default router;