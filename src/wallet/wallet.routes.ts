import { getBalance } from "./wallet.controller";
import {transfer} from "./transfer.controller"
import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { topup } from "./topup.controller";

const router = Router();

router.get('/balance',authMiddleware, getBalance);
router.post('/transfer',authMiddleware,transfer);

router.post("/topup", authMiddleware ,topup);

export default router;