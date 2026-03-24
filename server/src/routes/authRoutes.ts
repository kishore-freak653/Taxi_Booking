import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
  registerSchema,
  loginSchema,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, getCurrentUser);

export default router;
