import {Prisma} from "@prisma/client";

export async function createLedgerEntry(
    tx : Prisma.TransactionClient,
    data:{
        transactionId : string,
        walletId : string,
        entryType : "DEBIT" | "CREDIT",
        amount: Prisma.Decimal,
        currency : string
    }
){
    return tx.ledgerEntry.create({
        data,
    });
}