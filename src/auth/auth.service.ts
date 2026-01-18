import { prisma } from "../infra/prisma.ts";
import { hashPassword , comparePassword } from "./password.ts";
import jwt from "jsonwebtoken";

export async function registerUser(
    email : string,
    password: string
){
    return prisma.$transaction(async (tx : any) =>{
        const existingUser = await tx.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error("Email already registered");
        }
        const passwordHash = await hashPassword(password);

        const user = await tx.user.create({
            data:{
                email,
                passwordHash
            },
        });

        const wallet = await tx.wallet.create({
            data:{
                userId : user.id,
                balance : 0,
                currency : "INR",
            }
        })

        return {user,wallet};
    })
}

export async function loginUser(
    email: string,
    password: string
){
    const user = await prisma.user.findUnique({where :{email}});
    if(!user) {
        throw new Error("Invalid email or password");
    }

    const isValid = await comparePassword(password,user.passwordHash);
    if(!isValid){
        throw new Error("Invalid email or password");
    }
    return user;
}

