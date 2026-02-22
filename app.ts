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
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);
app.use(cookieParser());
app.use(express.json());

app.use(cors()); //for now will allow all origins, in production specify the frontend url

// app.use(cors({ 
//   origin: "*", //frontend url
//   credentials: true
// }));


app.use('/auth', authRouter);
app.use('/webhooks', webhookRouter);
app.use('/admin',adminRouter);
app.use('/wallet', walletRouter);
app.use('/transaction',transactionRouter);
app.use('/merchant',authRouter, merchant);
app.use('/payment', authRouter, payment);

startSettlementJob();

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
