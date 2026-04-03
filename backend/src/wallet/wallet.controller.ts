import { getWalletBalance } from './wallet.service';

export async function getBalance(req:any,res:any){
    const userId = req.userId;
    try{
        const { prisma } = await import("../infra/prisma");
        const userWallet = await prisma.wallet.findUnique({ where: { userId } });
        const merchant = await prisma.merchant.findUnique({ where: { userId } });
        
        let totalBalance = Number(userWallet?.balance || 0);
        let pending = Number(userWallet?.pendingBalance || 0);

        if (merchant) {
            const merchantWallet = await prisma.wallet.findUnique({ where: { merchantId: merchant.id } });
            totalBalance += Number(merchantWallet?.balance || 0);
            pending = Number(merchantWallet?.pendingBalance || 0);
        }

        res.json({ 
            balance: totalBalance,
            currency: userWallet?.currency || "INR",
            pendingBalance: pending
        });
    }
    catch(err: any){
        res.status(404).json({ message : err.message });
    }
}

