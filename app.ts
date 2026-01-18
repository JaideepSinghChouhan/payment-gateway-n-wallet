import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './src/auth/auth.routes.ts';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());

app.use('/auth', authRouter);


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
