import { Router } from "express";
import { getTransactionbyId, getTransactions } from "./transaction.controller";
import authMiddleware from "../middlewares/auth.middleware";
import { getRefund } from "./refund.controller";
import { refundTransaction } from "./refund.service";

const router = Router();    
router.get("/transactions", authMiddleware, getTransactions);
router.get("/transactions/:id", authMiddleware, getTransactionbyId);
router.post("/transactions/:id/refund", authMiddleware, getRefund);

export default router;