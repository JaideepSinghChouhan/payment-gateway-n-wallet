import { prisma } from '../infra/prisma';
import { Decimal } from '@prisma/client/runtime/client';
import { lockWallet } from './wallet.service';
import { createLedgerEntry } from '../ledger/ledger.service';
import { stat } from 'node:fs';
import { AppError } from '../error/error';
import { getIdempotentResponse } from './idempotency.service';
import { sortWalletsForLocking } from '../utils/wallet.lock';


export async function transferMoney(data: {
    fromUserId: string,
    toUserId: string,
    amount: Decimal,
    idempotencyKey: string
    }
){
    if (!data.fromUserId) {
    throw new AppError("Unauthenticated request", 401);
    }
    if (data.fromUserId === data.toUserId) {
    throw new AppError("Cannot transfer to self");
    }

    const transferAmount = data.amount;
    return prisma.$transaction(async (tx) => {
        // 1. Idempotency
        const cached = await getIdempotentResponse(
        tx,
        data.idempotencyKey,
        data.fromUserId,
        "POST:/wallet/transfer"
        );

        if (cached) return cached.response;
        // 2.Fetch Wallets

        const sender = await tx.wallet.findUnique({
        where: { userId : data.fromUserId },
        });

        // Resolve receiver: if they passed an N-Wallet ID, look it up by nWalletId
        let receiverWalletQuery = { userId: data.toUserId };
        if (data.toUserId.includes("@nwallet")) {
            const receiverUser = await tx.user.findUnique({ where: { nWalletId: data.toUserId } });
            if (!receiverUser) throw new AppError("Recipient N-Wallet ID not found");
            receiverWalletQuery = { userId: receiverUser.id };
        }

        const receiver = await tx.wallet.findUnique({
            where: receiverWalletQuery,
        })
        if(!sender) throw new Error('Sender wallet not found');
        if(!receiver) throw new AppError('Receiver wallet not found', 404);

        // 3.Create Business Transaction
        const transaction = await tx.transaction.create({
            data:{
                type: 'P2P',
                status: 'PENDING',
                amount: transferAmount,
                currency: sender!.currency,
                initiatorUserId: sender!.userId,
            }
        })

        // 4.Lock Wallets
        const [first, second] = sortWalletsForLocking(sender, receiver);
        await lockWallet(tx, first.id);
        await lockWallet(tx, second.id);


        // 5. Balance Checks
        if (sender.balance.lt(transferAmount)) {
            throw new AppError("Insufficient balance", 400);
        }
    

        // 6. Create Ledger Entries
        await createLedgerEntry(tx,{
            transactionId: transaction.id,
            walletId: sender!.id,
            entryType: "DEBIT",
            amount: transferAmount,
            currency: sender!.currency,
        });
        await createLedgerEntry(tx,{
            transactionId: transaction.id,
            walletId: receiver.id,
            entryType: "CREDIT",
            amount: transferAmount,
            currency: receiver.currency,
        });
        // 7. Update Balances
        await tx.wallet.update({
            where: { id: sender!.id },
            data: { balance: sender!.balance.minus(transferAmount) },
        });
        await tx.wallet.update({
            where: {id: receiver.id },
            data: {balance: receiver.balance.plus(transferAmount)}
        });
        // 8. Marks Transaction as Complete
        await tx.transaction.update({
            where: { id: transaction.id },
            data: { status: 'SUCCESS' },
    })
    const response = {
        transactionId: transaction.id,
        status: 'SUCCESS',
    }
    // 9. Save Idempotency result

    await tx.idempotencyKey.create({
        data:{
            key: data.idempotencyKey,  
            userId: data.fromUserId,
            endpoint: 'POST:/wallet/transfer',
            requestHash:"hash_here",
            response: response,
        },
    });
    return response;
});
}