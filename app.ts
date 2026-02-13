import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './src/auth/auth.routes.ts';
import walletRouter from './src/wallet/wallet.routes.ts';
import transactionRouter from './src/transaction/transaction.routes.ts';
import dotenv from 'dotenv';
import { AppError } from './src/error/error.ts';
import merchant from './src/merchant/merchant.routes.ts';
import payment from './src/payments/payment.route.ts';
dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());

app.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});


app.use('/auth', authRouter);
app.use('/wallet', walletRouter);
app.use('/transaction',transactionRouter);
app.use('/merchant',authRouter, merchant);
app.use('/payment', authRouter, payment);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
