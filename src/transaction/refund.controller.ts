import { refundTransaction } from "./refund.service";

export async function getRefund(req: any, res: any) {
    const userId = req.userId;
    const { id: transactionId } = req.params;
    const idempotencyKey = req.headers['idempotency-key'];
    if (!idempotencyKey) {
        return res.status(400).json({ error: "Idempotency key is required" });
    }

    const result = await refundTransaction({
        userId,
        transactionId,
        idempotencyKey
    });

    res.json(result);
}
