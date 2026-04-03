import { prisma } from "../infra/prisma";
import { createMerchant } from "./merchant.service";

export async function createMerchantController(req:any, res:any){
    const userId = req.userId;
    const {name} = req.body;
    if(!name){
        return res.status(400).json({error : "Name is required"});
    }
    const merchant = await createMerchant(userId, name);
    // Explicitly return the merchant with id, name, apiKey so the frontend can store it
    res.json({ merchant: { id: merchant.id, name: merchant.name, apiKey: merchant.apiKey } });
}


export async function createOrder(req:any, res:any){
    const apiKey = req.headers["x-api-key"];
    if(!apiKey){
        return res.status(401).json({ error: "Unauthorized: Missing API key" });
    }

    const merchant = await prisma.merchant.findUnique({
        where : {apiKey}
    })
    if(!merchant){
        return res.status(401).json({ error: "Unauthorized: Invalid API key"})
    }

    const {amount, currency} = req.body;

    const order = await prisma.paymentOrder.create({
        data :{
            merchantId : merchant.id,
            amount,
            currency,
        }
    })
    res.json(order);
}

