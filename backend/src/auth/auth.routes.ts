import express from 'express';
import { register,login, refresh, logout, getMe } from './auth.controller';
import authMiddleware from '../middlewares/auth.middleware';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', authMiddleware, logout);
authRouter.get('/me', authMiddleware, getMe);


export default authRouter;