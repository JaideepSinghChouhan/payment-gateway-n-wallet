import { Prisma } from '@prisma/client';
import {prisma} from '../infra/prisma';
import { Decimal } from '@prisma/client/runtime/client';
import { createLedgerEntry } from '../ledger/ledger.service';


export async function getWalletBalance(userId: string){
    const wallet = await prisma.wallet.findUnique({
        where: { userId },
        select:{
            id: true,
            balance: true,
            currency: true
        }
    })
    if(!wallet){
        throw new Error('Wallet not found');
    }
    return wallet;
}

export function ensureSufficientBalance(
    balance: Decimal,
    amount: Decimal,
){
    if(balance.lt(amount)){
        throw new Error('Insufficient balance');
    }
}

export async function lockWallet(
    tx: Prisma.TransactionClient,
    walletId: string
){
    await tx.$queryRaw`
    SELECT * FROM "Wallet"
    WHERE id = ${walletId}
    FOR UPDATE
    `;
}

// export async function debitWallet(
//     tx: Prisma.TransactionClient,
//     walletId: string,
//     amount: Decimal
// ){
//     const wallet = await tx.wallet.findUnique({
//         where: { id: walletId },
//     });

//     await lockWallet(tx, walletId);

//     ensureSufficientBalance(wallet!.balance, amount);

//     await createLedgerEntry(tx,{
//         transactionId: crypto.randomUUID(),
//         walletId,
//         entryType: "DEBIT",
//         amount,
//         currency: wallet!.currency,
//     });

//     await tx.wallet.update({
//         where: { id: walletId },
//         data: {
//             balance: wallet!.balance.minus(amount),
//         },
//     });
// }

// export async function creditWallet(
//     tx: Prisma.TransactionClient,
//     walletId : string,
//     amount: Decimal
// ){
//     await prisma.$transaction(async (tx)=>{
//         const wallet=await tx.wallet.findUnique({
//             where :{ id :walletId}
//         })

//         await lockWallet(tx,walletId);
        
//         await createLedgerEntry(tx,{
//         transactionId: crypto.randomUUID(),
//         walletId,
//         entryType: "CREDIT",
//         amount,
//         currency: wallet!.currency,
//     });

//     await tx.wallet.update({
//         where: { id: walletId },
//         data: {
//             balance: wallet!.balance.plus(amount),
//         },
//     });
//     })
// }