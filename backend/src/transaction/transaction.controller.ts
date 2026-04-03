import { AppError } from "../error/error";
import { prisma } from "../infra/prisma";
import { getTransactionHistory } from "../transaction/transaction.service";
import { Prisma } from "@prisma/client";

export async function getTransactions(req:any,res:any){
    const userId = req.userId;
    const page = Number(req.query.page) || 1;
    const limit =Number(req.query.limit) || 10;

    const history = await getTransactionHistory(userId,page,limit);
    res.json({
        page,
        limit,
        data: history
    }
);  
}

export async function getTransactionbyId(req: any, res: any){
    const userId = req.userId;
    const txId = req.params.id; 

    const merchant = await prisma.merchant.findUnique({
        where: { userId },
        select: { id: true }
    });

    const conditions: Prisma.TransactionWhereInput[] = [
        { initiatorUserId : userId },
        { ledgerEntries :{ some: { wallet: { userId } } } }
    ];

    if (merchant) {
        conditions.push({ ledgerEntries: { some: { wallet: { merchantId: merchant.id } } } });
    }

    const transaction = await prisma.transaction.findFirst({
        where:{
            id : txId,
            OR: conditions
        },
        include:{
            ledgerEntries: true,
        },
    })

    if(!transaction){
        throw new AppError("Transaction not found",404);
    }
    res.json(transaction);
}