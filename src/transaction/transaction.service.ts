import { EntryType } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "../infra/prisma";

export async function getTransactionHistory(
    userId: string,
    page=1,
    limit=10
) {
    const skip = (page -1) * limit;

    const transactions = await prisma.transaction.findMany({
        where: {
            OR: [
                { initiatorUserId : userId },
                { ledgerEntries: { some: { wallet: { userId } } } }
            ],
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
                        },
                    },
                },
            }
        } 
});

return transactions.map(tx => {
    const isSender = tx.initiatorUserId === userId;
    
    return {
        id: tx.id,
        type: tx.type,
        amount: tx.amount,  
        currency: tx.currency,
        createdAt: tx.createdAt,
        direction: isSender ? 'SENT' : 'RECEIVED',
    };
});
};