import { prisma } from "../infra/prisma";
import { AppError } from "../error/error";
import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/client";

export async function settleMerchant(merchantId: string) {
  return prisma.$transaction(async (tx)=>{
    const wallet = await tx.wallet.findUnique({
      where : {merchantId},
    })
    if(!wallet){
      throw new AppError("Merchant wallet not found",404);
    }
    if(wallet.pendingBalance.lte(0)){
      return { status: "NO_SETTLEMENT_NEEDED" };
    }
    const settlementAmount = wallet.pendingBalance;

    await tx.wallet.update({
      where : {id : wallet.id},
      data:{
        balance: {
          increment: settlementAmount
        },
        pendingBalance: {
          decrement: settlementAmount
        }
      }
    })

    return {
      settledAmount : settlementAmount,
      status : "SETTLED",
    }

  })
}
