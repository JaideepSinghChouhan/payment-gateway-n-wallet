import crypto from "crypto";
import { prisma } from "../infra/prisma";
import { Prisma } from "@prisma/client";

export async function createMerchant(name: string) {
  const apiKey = crypto.randomUUID();

  return prisma.merchant.create({
    data: {
      name,
      apiKey,
      wallet: {
        create: {
          balance: new Prisma.Decimal(0),
          currency: "INR",
          type: "USER", // You can later add MERCHANT enum if you want
        },
      },
    },
  });
}


