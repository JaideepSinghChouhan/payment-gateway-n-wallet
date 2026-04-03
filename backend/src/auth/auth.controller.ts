import { registerUser , loginUser, getUserById } from "./auth.service";
import { generateAccessToken,generateRefreshToken, verifyRefreshToken } from "./jwt";  


export async function register(req:any,res:any){
    const {email,password} = req.body;
    const {user,wallet} = await registerUser(email,password);
    res.status(201).json({ user: { id: user.id, email: user.email, nWalletId: user.nWalletId, merchant: null }, wallet });
}
export async function login(req:any,res:any){
    const {email,password} = req.body;
    const user = await loginUser(email,password);
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    res.cookie("accessToken",accessToken,{
        httpOnly:true,
        sameSite:"lax",
        secure:process.env.NODE_ENV==="production",
        maxAge:15*60*1000,
    });
    res.cookie("refreshToken",refreshToken,{
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        sameSite:"lax",
        maxAge:7*24*60*60*1000,
    });
    
    const { prisma } = await import("../infra/prisma");
    const merchant = await prisma.merchant.findUnique({
        where: { userId: user.id },
        select: { id: true, name: true, apiKey: true }
    });
    
    // Auto-generate if missing (backfill)
    let nWalletId = user.nWalletId;
    if (!nWalletId) {
        nWalletId = user.email.split('@')[0] + Math.floor(Math.random() * 1000) + '@nwallet';
        await prisma.user.update({ where: { id: user.id }, data: { nWalletId } });
    }

    res.json({ message : "Login successful", user: { id: user.id, email: user.email, nWalletId, merchant: merchant || null } });
}

export function refresh(req:any,res:any){
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
        return res.status(401).json({ message : "Unauthorized" });
    }
    try{
        const payload = verifyRefreshToken(refreshToken);
        const newAccessToken = generateAccessToken(payload.id);
        res.cookie("accessToken",newAccessToken,{
            httpOnly:true,
            sameSite:"lax",
            secure:process.env.NODE_ENV==="production",
            maxAge:15*60*1000,
        });
        res.json({ message : "Access token refreshed" });
    }
    catch(err){
        return res.status(401).json({ message : "Invalid refresh token" });
    }
}

export async function logout(req:any,res:any){
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message : "Logged out successfully" });
}

export async function getMe(req:any, res:any) {
    try {
        const user = await getUserById(req.userId);
        const { prisma } = await import("../infra/prisma");
        
        const merchant = await prisma.merchant.findUnique({
            where: { userId: req.userId },
            select: { id: true, name: true, apiKey: true }
        });

        // Auto-generate if missing
        let nWalletId = user.nWalletId;
        if (!nWalletId) {
            nWalletId = user.email.split('@')[0] + Math.floor(Math.random() * 1000) + '@nwallet';
            await prisma.user.update({ where: { id: user.id }, data: { nWalletId } });
        }

        res.json({ user: { id: user.id, email: user.email, nWalletId, merchant: merchant || null } });
    } catch(err) {
        res.status(404).json({ message: "User not found" });
    }
}

