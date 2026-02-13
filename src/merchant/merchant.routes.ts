import { Router } from 'express';
import { createMerchantController, createOrder } from './merchant.controller';

const router = Router();

router.post('/merchants',  createMerchantController);
router.post('/orders', createOrder);

export default router;