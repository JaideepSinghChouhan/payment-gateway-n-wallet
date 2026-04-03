import { EntryType } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "../infra/prisma";

export async function getTransactionHistory(
    userId: string,
    page=1,
    limit=10
) {
    const skip = (page -1) * limit;

    // Fetch the merchant ID if the user is a merchant
    const merchant = await prisma.merchant.findUnique({
        where: { userId },
        select: { id: true }
    });

    const conditions: Prisma.TransactionWhereInput[] = [
        { initiatorUserId : userId },
        { ledgerEntries: { some: { wallet: { userId } } } }
    ];

    if (merchant) {
        conditions.push({ ledgerEntries: { some: { wallet: { merchantId: merchant.id } } } });
    }

    const transactions = await prisma.transaction.findMany({
        where: {
            OR: conditions,
        },
        orderBy : {createdAt : 'desc'},
        skip,
        take: limit,
        include:{
            ledgerEntries:{
                select:{
                    entryType: true,
                    amount: true,
                    wallet:{
                        select:{
                            userId: true,
                            merchantId: true
                        },
                    },
                },
            }
        } 
});

return transactions.map(tx => {
    // Determine if the user was the sender or receiver
    const isSender = tx.initiatorUserId === userId;
    let direction = isSender ? 'SENT' : 'RECEIVED';
    let displayAmount = tx.amount;

    // Find the specific ledger entry for this user to get the actual amount they received/sent
    // (Crucial for merchants, as their received amount subtracts the platform fee)
    const myLedger = tx.ledgerEntries?.find(entry => 
        entry.wallet?.userId === userId || 
        (merchant && entry.wallet?.merchantId === merchant.id)
    );

    if (myLedger) {
        displayAmount = myLedger.amount;
        direction = myLedger.entryType === 'CREDIT' ? 'RECEIVED' : 'SENT';
    } else if (tx.type === 'TOPUP') {
        direction = 'RECEIVED';
    }

    return {
        id: tx.id,
        type: tx.type,
        amount: displayAmount,  
        currency: tx.currency,
        createdAt: tx.createdAt,
        direction: direction,
    };
});
};