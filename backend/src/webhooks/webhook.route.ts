import { paymentWebhook } from "./webhook.controller";
import { Router } from "express";

const router = Router();

router.post("/payment", paymentWebhook);

export default router;