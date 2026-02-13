import { topUpWallet } from "./topup.service";

export async function topup(req:any , res:any) {
    const userId = req.userId;
    const { amount } = req.body;
    const idempotencyKey = req.headers['idempotency-key'];
    console.log("Top-up request received with data:", { req });
    if(!idempotencyKey){
        return res.status(400).json({error: "Idempotency key is required"})
    }
    const result =await topUpWallet({
        userId,
        amount,
        idempotencyKey
    });

    res.json(result);
}