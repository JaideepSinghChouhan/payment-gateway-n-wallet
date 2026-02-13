import { prisma } from "../infra/prisma";
import { createLedgerEntry } from "../ledger/ledger.service";
import { lockWallet } from "../wallet/wallet.service";


export async function refundTransaction(data: {
  userId: string;
  transactionId: string;
  idempotencyKey: string;
}) {

  return prisma.$transaction(async (tx) => {
    // 1️⃣ Idempotency
    const cached = await tx.idempotencyKey.findUnique({
      where: {
        key_userId_endpoint: {
          key: data.idempotencyKey,
          userId: data.userId,
          endpoint: "POST:/transactions/refund",
        },
      },
    });

    if (cached) return cached.response;

    // 2️⃣ Find original transaction
    const original = await tx.transaction.findUnique({
      where: { id: data.transactionId },
      include: { ledgerEntries: true },
    });

    if (!original) throw new Error("Transaction not found");
    if (original.status !== "SUCCESS")
      throw new Error("Transaction not refundable");

    // 3️⃣ Prevent double refund
    const alreadyRefunded = await tx.transaction.findFirst({
      where: { refundedTransactionId: original.id },
    });

    if (alreadyRefunded)
      throw new Error("Transaction already refunded");

    // 4️⃣ Identify wallets
    const debitEntry = original.ledgerEntries.find(
      (e) => e.entryType === "DEBIT"
    );
    const creditEntry = original.ledgerEntries.find(
      (e) => e.entryType === "CREDIT"
    );

    if (!debitEntry || !creditEntry)
      throw new Error("Invalid ledger state");

    const senderWallet = await tx.wallet.findUnique({
      where: { id: debitEntry.walletId },
    });

    const receiverWallet = await tx.wallet.findUnique({
      where: { id: creditEntry.walletId },
    });

    if (!senderWallet || !receiverWallet)
      throw new Error("Wallet missing");

    // 5️⃣ Lock wallets (ordered)
    const [first, second] =
      senderWallet.id < receiverWallet.id
        ? [senderWallet, receiverWallet]
        : [receiverWallet, senderWallet];

    await lockWallet(tx, first.id);
    await lockWallet(tx, second.id);

    // 6️⃣ Ensure receiver still has funds
    if (receiverWallet.balance.lt(original.amount))
      throw new Error("Insufficient balance to refund");

    // 7️⃣ Create refund transaction
    const refundTx = await tx.transaction.create({
      data: {
        type: "REFUND",
        status: "PENDING",
        amount: original.amount,
        currency: original.currency,
        initiatorUserId: data.userId,
        refundedTransactionId: original.id,
      },
    });

    // 8️⃣ Reverse ledger entries
    await createLedgerEntry(tx, {
      transactionId: refundTx.id,
      walletId: receiverWallet.id,
      entryType: "DEBIT",
      amount: original.amount,
      currency: original.currency,
    });

    await createLedgerEntry(tx, {
      transactionId: refundTx.id,
      walletId: senderWallet.id,
      entryType: "CREDIT",
      amount: original.amount,
      currency: original.currency,
    });

    // 9️⃣ Update balances
    await tx.wallet.update({
      where: { id: receiverWallet.id },
      data: { balance: receiverWallet.balance.minus(original.amount) },
    });

    await tx.wallet.update({
      where: { id: senderWallet.id },
      data: { balance: senderWallet.balance.plus(original.amount) },
    });

    // 🔟 Mark success
    await tx.transaction.update({
      where: { id: refundTx.id },
      data: { status: "SUCCESS" },
    });

    const response = {
      refundTransactionId: refundTx.id,
      status: "SUCCESS",
    };

    // 1️⃣1️⃣ Save idempotency
    await tx.idempotencyKey.create({
      data: {
        key: data.idempotencyKey,
        userId: data.userId,
        endpoint: "POST:/transactions/refund",
        requestHash: "hash_here",
        response,
      },
    });

    return response;
  });
}
