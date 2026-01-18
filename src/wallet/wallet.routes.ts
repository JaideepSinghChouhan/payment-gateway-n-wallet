import { getBalance } from "./wallet.controller";
import { Router } from "express";

const router = Router();

router.get('/balance', getBalance);


export default router;