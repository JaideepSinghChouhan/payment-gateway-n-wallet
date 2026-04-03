import { confirmPayment } from "./webhook.service";

export async function paymentWebhook(req: any, res: any){
    const { transactionId,status } = req.body;
    if(!transactionId || !status){
        return res.status(400).json({message : "Missing transactionId or status"});
    }
    const result = await confirmPayment(transactionId);
    res.json(result);
}