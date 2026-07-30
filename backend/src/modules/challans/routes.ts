import { Router } from 'express';
import { ChallanController } from './controller.js';
import { authenticateJWT, requireRoles } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { salesChallanSchema, UserRole } from '@op/shared';

const router: Router = Router();

router.use(authenticateJWT);

router.get('/', ChallanController.list);
router.get('/:id', ChallanController.getById);
router.post(
  '/',
  requireRoles(UserRole.ADMIN, UserRole.SALES),
  validateRequest(salesChallanSchema),
  ChallanController.create
);
router.post(
  '/:id/confirm',
  requireRoles(UserRole.ADMIN, UserRole.SALES, UserRole.WAREHOUSE),
  ChallanController.confirm
);
router.post(
  '/:id/cancel',
  requireRoles(UserRole.ADMIN, UserRole.ACCOUNTS),
  ChallanController.cancel
);

export default router;
