import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './src/auth/auth.routes';
import walletRouter from './src/wallet/wallet.routes';
import transactionRouter from './src/transaction/transaction.routes';
import dotenv from 'dotenv';
import { AppError } from './src/error/error';
import merchant from './src/merchant/merchant.routes';
import payment from './src/payments/payment.route';
import adminRouter from './src/admin/admin.routes';
import webhookRouter from './src/webhooks/webhook.route';
import cors from 'cors';

import { startSettlementJob } from './src/scheduler/settlement.scheduler';
import { rateLimit } from 'express-rate-limit';
dotenv.config();


const app = express();

app.use(cors({ 
  origin: "http://localhost:5173", //frontend url
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  skip: (req) => req.path === '/auth/me' || req.path === '/auth/refresh'
});

app.use(limiter);
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "Server Running 🚀" });
});


app.use('/auth', authRouter);
app.use('/webhooks', webhookRouter);
app.use('/admin',adminRouter);
app.use('/wallet', walletRouter);
app.use('/transaction',transactionRouter);
app.use('/merchant',authRouter, merchant);
app.use('/payment', authRouter, payment);

startSettlementJob();

// Seed required system wallets on startup (idempotent)
async function seedSystemWallets() {
  const { prisma } = await import('./src/infra/prisma');
  const { Prisma } = await import('@prisma/client');
  
  await prisma.wallet.upsert({
    where: { id: 'bank-wallet' },
    update: {},
    create: { id: 'bank-wallet', balance: new Prisma.Decimal(1_000_000), pendingBalance: new Prisma.Decimal(0), currency: 'INR' }
  });
  
  await prisma.wallet.upsert({
    where: { id: 'platform-wallet' },
    update: {},
    create: { id: 'platform-wallet', balance: new Prisma.Decimal(0), pendingBalance: new Prisma.Decimal(0), currency: 'INR' }
  });
  
  console.log('✅ System wallets ready');
}

seedSystemWallets().catch(console.error);

app.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
