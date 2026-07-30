import { Router } from 'express';
import { CustomerController } from './controller.js';
import { authenticateJWT, requireRoles } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { customerSchema, customerNoteSchema, UserRole } from '@op/shared';

const router: Router = Router();

router.use(authenticateJWT);

router.get('/', CustomerController.list);
router.get('/:id', CustomerController.getById);
router.post(
  '/',
  requireRoles(UserRole.ADMIN, UserRole.SALES),
  validateRequest(customerSchema),
  CustomerController.create
);
router.put(
  '/:id',
  requireRoles(UserRole.ADMIN, UserRole.SALES),
  validateRequest(customerSchema.partial()),
  CustomerController.update
);
router.post(
  '/:id/notes',
  requireRoles(UserRole.ADMIN, UserRole.SALES),
  validateRequest(customerNoteSchema),
  CustomerController.addNote
);

export default router;
