import { prisma } from "../infra/prisma";
import { AppError } from "../error/error";
export async function confirmPayment(transactionId : string){
    return prisma.$transaction(async (tx) =>{
        const transaction =await tx.transaction.findUnique({
            where : {id: transactionId},
            include : {
                order: true,
            },
        })
        if(!transaction){
            throw new AppError("Transaction not found", 404);
        }
        if(transaction.status !== "PENDING"){
        throw new AppError("Transaction is not pending", 400);
        }

        await tx.transaction.update({
            where : {id: transactionId},
            data : {
                status : "SUCCESS",
            },
        })

        if(transaction.orderId){
            await tx.paymentOrder.update({
                where : {id: transaction.orderId},
                data : {
                    status : "PAID",
                },
            })
        }
        return {
             message : "Payment confirmed successfully" ,
             status : "CONFIRMED"   
        }
    
})
}