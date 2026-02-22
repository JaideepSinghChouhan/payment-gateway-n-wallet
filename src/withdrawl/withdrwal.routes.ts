import { Router } from "express";
import { withdraw } from "./withdrawl.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.post("/withdraw",authMiddleware, withdraw);

export default router;