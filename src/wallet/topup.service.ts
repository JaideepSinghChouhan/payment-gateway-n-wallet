import { Prisma } from "@prisma/client";
import { prisma } from "../infra/prisma";
import { lockWallet } from "./wallet.service";
import { createLedgerEntry } from "../ledger/ledger.service";
import { sortWalletsForLocking } from "../utils/wallet.lock";
import { AppError } from "../error/error";

const BANK_WALLET_ID = 'bank-wallet';

export async function topUpWallet(data:{
    userId: string;
    amount: Prisma.Decimal;
    idempotencyKey: string;
}){
    return prisma.$transaction(async (tx)=>{
        // 1 Check for idempotency
        const cached = await tx.idempotencyKey.findUnique({
            where:
            {
                key_userId_endpoint:{
                    key: data.idempotencyKey,
                    userId: data.userId,
                    endpoint: "POST:/wallet/topup"
                }
            }
        })
        if(cached) return cached.response;
        // 2 Fetch bank wallet and user wallet
        const userWallet = await tx.wallet.findUnique({
            where : { userId: data.userId }
        })
        if(!userWallet) throw new AppError("User wallet not found",404);
        const bankWallet = await tx.wallet.findUnique({
            where : { id: BANK_WALLET_ID }
        })
        if(!bankWallet) throw new AppError("Bank wallet not found",500);

        // 3 Create business transaction
        const transaction = await tx.transaction.create({
            data: {
                type: "TOPUP",
                status: "PENDING",
                amount: data.amount,
                currency: userWallet.currency,
                initiatorUserId: data.userId,
            }
        })

        // 4 Lock Wallets
        const [firstWallet, secondWallet] = sortWalletsForLocking(userWallet, bankWallet);
        await lockWallet(tx, firstWallet.id);
        await lockWallet(tx, secondWallet.id);

        // 5 Create ledger entries
        await createLedgerEntry(tx, {
            transactionId: transaction.id,
            walletId: bankWallet.id,
            entryType: "DEBIT",
            amount: data.amount,
            currency: bankWallet.currency,
        })
        await createLedgerEntry(tx, {
            transactionId: transaction.id,
            walletId: userWallet.id,
            entryType: "CREDIT",
            amount: data.amount,
            currency: userWallet.currency,
        })

        //6 update balances
        await tx.wallet.update({
            where: { id: bankWallet.id },
            data:{
                balance: bankWallet.balance.minus(data.amount)
            }
        })
        await tx.wallet.update({
            where: { id: userWallet.id },
            data:{
                balance: userWallet.balance.plus(data.amount)
            }
        })

        //7 Mark Success
        await tx.transaction.update({
            where:{ id: transaction.id },
            data: { status: "SUCCESS" }
        })

        const response ={
            transactionId: transaction.id,
            amount: data.amount,
            currency: userWallet.currency,
            status: "SUCCESS"
         }
        
         //8 Save Idempotency Key
         await tx.idempotencyKey.create({
            data:{
                key: data.idempotencyKey,   
                userId: data.userId,
                endpoint: "POST:/wallet/topup",
                requestHash: "hash_here",
                response: response,
            }
         })
         return response;
    })
}