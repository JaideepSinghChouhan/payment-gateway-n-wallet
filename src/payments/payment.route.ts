import authMiddleware from "../middlewares/auth.middleware";
import { payment } from "./payment.controller";
import { Router } from 'express';

const router = Router();
router.post('/pay',authMiddleware, payment);

export default router;