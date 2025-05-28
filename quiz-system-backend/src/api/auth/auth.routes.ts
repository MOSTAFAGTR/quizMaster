import * as express from 'express';
import { AuthController } from './auth.controller';
import { protect } from '../../middleware/auth.middleware';

const authRouterV1 = express.Router();
authRouterV1.post('/register', AuthController.register);
authRouterV1.post('/login', AuthController.login);
authRouterV1.put('/change-password', protect, AuthController.changePassword);
export default authRouterV1;