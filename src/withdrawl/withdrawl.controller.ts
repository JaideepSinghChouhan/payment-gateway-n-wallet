import { AppError } from '../error/error';
import { withdrawToBank } from './withdrawl.service';
import { Prisma } from '@prisma/client';

export async function withdraw(req: any, res: any) {
  const userId = req.userId;
  const { amount } = req.body;
  

  if (!amount) {
    return res.status(400).json({ error: "Amount is required" });
  }

  const result = await withdrawToBank({
    userId,
    amount: new Prisma.Decimal(amount),
  });

  res.json(result);
}
