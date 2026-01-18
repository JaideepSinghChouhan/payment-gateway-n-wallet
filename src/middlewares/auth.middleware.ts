import { verifyAccessToken } from "../auth/jwt";

export default function authMiddleware(req:any,res:any,next:any){
  const token =req.cookies.accessToken;
    if(!token){
        return res.status(401).json({ message : "Unauthorized" });
    }

    try{
        const payload = verifyAccessToken(token);
        req.userId = payload.id;
        next();
    }
    catch(err){
        return  res.status(401).json({ message : "Access token expired" });
    }
}