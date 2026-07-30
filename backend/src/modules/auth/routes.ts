import { Router } from 'express';
import { AuthController } from './controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { loginSchema, registerSchema } from '@op/shared';
import { authenticateJWT } from '../../middleware/auth.js';

const router: Router = Router();

router.post('/login', validateRequest(loginSchema), AuthController.login);
router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/signup', validateRequest(registerSchema), AuthController.register);
router.get('/me', authenticateJWT, AuthController.getMe);

export default router;
