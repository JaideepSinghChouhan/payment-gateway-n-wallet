import { getWalletBalance } from './wallet.service';

export async function getBalance(req:any,res:any){
    const userId = req.user.id;
    try{
        const wallet = await getWalletBalance(userId);
        res.json({ 
            ballance:wallet.balance,
            currency:wallet.currency
        });
    }
    catch(err: any){
        res.status(404).json({ message : err.message });
    }
}

