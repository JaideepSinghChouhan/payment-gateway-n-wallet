import crypto from "crypto";
import { prisma } from "../infra/prisma";
import { Prisma } from "@prisma/client";
import { AppError } from "../error/error";

export async function createMerchant(userId: string, name: string) {
  return prisma.$transaction(async (tx) => {

    // 1️⃣ Check if user already merchant
    const existing = await tx.merchant.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new AppError("User is already a merchant", 400);
    }

    const apiKey = crypto.randomUUID();

    // 2️⃣ Create merchant linked to user
    const merchant = await tx.merchant.create({
      data: {
        name,
        apiKey,
        userId, // 🔥 CRITICAL LINK
        wallet: {
          create: {
            balance: new Prisma.Decimal(0),
            pendingBalance: new Prisma.Decimal(0),
            currency: "INR",
            type: "MERCHANT", // Better enum
          },
        },
      },
      include: {
        wallet: true,
      },
    });

    return merchant;
  });
}
