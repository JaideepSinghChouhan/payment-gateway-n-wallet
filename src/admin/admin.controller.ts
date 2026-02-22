import { settleMerchant } from "./admin.service";

export async function settleMerchantController(req:any, res:any) {
  const { merchantId } = req.params;
  try {
    const result = await settleMerchant(merchantId);
    res.json(result);
  }
  catch (error:any) {
    res.status(error.statusCode || 500).json({ error: error.message || "Internal Server Error" });
  }
}    