import express from 'express';
import { register,login, refresh, logout } from './auth.controller.ts';
import authMiddleware from '../middlewares/auth.middleware.ts';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', authMiddleware, logout);

export default authRouter;