import { Router } from "express";
import { settleMerchantController } from "./admin.controller";
export const adminRouter = Router();

adminRouter.post("/settle/:merchantId", settleMerchantController);

export default adminRouter;