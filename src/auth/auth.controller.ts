import { registerUser , loginUser } from "./auth.service.ts";
import { generateAccessToken,generateRefreshToken, verifyRefreshToken } from "./jwt.ts";  


export async function register(req:any,res:any){
    const {email,password} = req.body;
    const {user,wallet} = await registerUser(email,password);
    res.status(201).json({ user, wallet });
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
    
    res.json({ message : "Login successful" });
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


