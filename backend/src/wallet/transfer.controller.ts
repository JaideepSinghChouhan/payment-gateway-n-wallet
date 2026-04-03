
import { transferMoney } from "./transfer.service";

export async function transfer(req:any,res:any){
    const fromUserId = req.userId;
    const {toUserId , amount } =req.body;
    const idempotencyKey=req.headers["idempotency-key"];

    if(!idempotencyKey){
        return res.status(400).json({error:"Idempotency key required"})
    }
    
    const result = await transferMoney({
        fromUserId: fromUserId,
        toUserId: toUserId,
        amount,
        idempotencyKey
    })

    res.json(result);
}