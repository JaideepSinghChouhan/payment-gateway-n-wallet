import { prisma } from "../infra/prisma";
import { AppError } from "../error/error";
import { Prisma } from "@prisma/client";
import { lockWallet } from "../wallet/wallet.service";
import { createLedgerEntry } from "../ledger/ledger.service";

export async function withdrawToBank(data: {
  userId: string;
  amount: Prisma.Decimal;
}) {
  return prisma.$transaction(async (tx) => {

    // 1️⃣ Find merchant linked to user
    const merchant = await tx.merchant.findUnique({
      where: { userId: data.userId },
    });

    if (!merchant) {
      throw new AppError("User is not a merchant", 403);
    }

    // 2️⃣ Now get merchant wallet
    const merchantWallet = await tx.wallet.findUnique({
      where: { merchantId: merchant.id },
    });
    if (!merchantWallet) {
      throw new AppError("Merchant wallet not found", 404);
    }

    if (merchantWallet.balance.lt(data.amount)) {
      throw new AppError("Insufficient balance", 400);
    }

    const bankWallet = await tx.wallet.findUnique({
      where: { id: "bank-wallet" },
    });

    if (!bankWallet) {
      throw new AppError("Bank wallet missing", 500);
    }

    // Lock wallets
    const wallets = [merchantWallet, bankWallet].sort((a, b) =>
      a.id.localeCompare(b.id)
    );

    for (const wallet of wallets) {
      await lockWallet(tx, wallet.id);
    }

    // Create withdrawal transaction
    const transaction = await tx.transaction.create({
      data: {
        type: "WITHDRAWL",
        status: "SUCCESS",
        amount: data.amount,
        currency: merchantWallet.currency,
        initiatorUserId: null,
      },
    });

    // Ledger
    await createLedgerEntry(tx, {
      transactionId: transaction.id,
      walletId: merchantWallet.id,
      entryType: "DEBIT",
      amount: data.amount,
      currency: merchantWallet.currency,
    });

    await createLedgerEntry(tx, {
      transactionId: transaction.id,
      walletId: bankWallet.id,
      entryType: "CREDIT",
      amount: data.amount,
      currency: merchantWallet.currency,
    });

    // Update balances
    await tx.wallet.update({
      where: { id: merchantWallet.id },
      data: {
        balance: { decrement: data.amount },
      },
    });

    await tx.wallet.update({
      where: { id: bankWallet.id },
      data: {
        balance: { increment: data.amount },
      },
    });

    return {
      status: "SUCCESS",
      withdrawalId: transaction.id,
    };
  });
}
