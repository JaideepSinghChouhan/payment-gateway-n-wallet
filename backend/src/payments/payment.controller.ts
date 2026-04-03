import { payOrder } from "./payment.service";

export async function payment(req:any, res:any){
    const userId = req.userId;
    const {orderId} = req.body;
    const idempotencyKey = req.headers["idempotency-key"];
    if(!idempotencyKey){
        return res.status(400).json({error:"Idempotency key required"})
    }
    const result = await payOrder({
        userId,
        orderId,
        idempotencyKey
    })
    res.json(result);
}