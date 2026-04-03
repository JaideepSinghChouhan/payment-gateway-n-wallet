import { prisma } from "../infra/prisma";
import { AppError } from "../error/error";
import { sortWalletsForLocking } from "../utils/wallet.lock";
import { lockWallet } from "../wallet/wallet.service";
import { createLedgerEntry } from "../ledger/ledger.service";
import { Prisma } from "@prisma/client";


export async function payOrder(
    data:{
        userId : string,
        orderId : string,
        idempotencyKey : string
    })
{

    const result = await prisma.$transaction(async (tx) =>{
        // 1 Check for idempotency
        const cached = await tx.idempotencyKey.findUnique({
            where:
            {
                key_userId_endpoint:{
                    key: data.idempotencyKey,
                    userId: data.userId,
                    endpoint: "POST:/payment/pay"
                }
            }
        })
        if(cached) return cached.response;

        
        const order = await tx.paymentOrder.findUnique({
            where : {id : data.orderId}
        });
        if(!order){
            throw new AppError("Order not found", 404);
        }
        if(order.status !== "CREATED")
            throw new AppError("Order already processed", 400);

        const merchant = await tx.merchant.findUnique({
            where : {id : order.merchantId}
        })
        if(!merchant){
            throw new AppError("Merchant not found", 404);
        }
        
        const PLATFORM_FLAT_FEE = merchant.flatFee;

        const totalAmount = order.amount;
        const amountToMerchant = totalAmount.minus(PLATFORM_FLAT_FEE);

        if(totalAmount.lessThanOrEqualTo(PLATFORM_FLAT_FEE)){
            throw new AppError("Total amount must be greater than platform fee", 400);
        }

        const userWallet = await tx.wallet.findUnique({
            where : {userId : data.userId}
        })

        const merchantWallet = await tx.wallet.findUnique({
            where : {merchantId : order.merchantId}
        })

        const platformWallet = await tx.wallet.findFirst({
        where: { 
            id : "platform-wallet"
            }
        });

        if (!platformWallet) throw new Error("Platform wallet missing");

        if(!userWallet || !merchantWallet){
            throw new AppError("Wallet not found", 404);
        }

        if(userWallet.balance.lessThan(order.amount)){
            throw new AppError("Insufficient balance", 400);
        }

        //Lock the wallets for update

        const wallets = [userWallet, merchantWallet, platformWallet]
        .sort((a, b) => a.id.localeCompare(b.id));

        for (const wallet of wallets) {
        await lockWallet(tx, wallet.id);
        }


        // create transaction record
        const transaction = await tx.transaction.create({
            data : {
                type : "PAYMENT",
                status : "PENDING",
                amount : order.amount,
                currency : order.currency,
                initiatorUserId : data.userId,
                orderId : order.id,
            }
        })

        // Ledger entries
        await createLedgerEntry(tx,{
            transactionId : transaction.id,
            walletId : userWallet.id,
            amount : totalAmount,
            currency : order.currency,
            entryType : "DEBIT",
        })

        await createLedgerEntry(tx,{
            transactionId : transaction.id,
            walletId : merchantWallet.id,
            amount : amountToMerchant,
            currency : order.currency,
            entryType : "CREDIT",
        })

        await createLedgerEntry(tx,{
            transactionId : transaction.id,
            walletId : platformWallet.id,
            amount : PLATFORM_FLAT_FEE,
            currency : order.currency,
            entryType : "CREDIT",
        })

        // Update wallets
        await tx.wallet.update({
            where : {id : userWallet.id},
            data : {
                balance : {
                    decrement: totalAmount
                }
            }
        })

        await tx.wallet.update({
            where : {id : merchantWallet.id},
            data : {
                pendingBalance: {
                increment: amountToMerchant
                }
            }
        })

        await tx.wallet.update({
            where : {id : platformWallet.id},
            data : {
                balance : {
                    increment: PLATFORM_FLAT_FEE
                }
            }
        })

        // Update transaction and order status
        await tx.transaction.update({
            where : {id : transaction.id},
            data : {
                status : "SUCCESS"
            }
        })
        await tx.paymentOrder.update({
            where : {id : order.id},
            data : {
                status : "PAID"
            }
        })

        // Cache idempotency response
        await tx.idempotencyKey.create({
            data : {
                key: data.idempotencyKey,
                userId: data.userId,
                endpoint: "POST:/payment/pay",
                requestHash: "hash_here",
                response: { status :"SUCCESS" , transactionId : transaction.id }
            }
        })

        return { status :"SUCCESS" , transactionId : transaction.id };

    });
    return result;
    
}