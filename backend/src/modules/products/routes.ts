import { Router } from 'express';
import { ProductController } from './controller.js';
import { authenticateJWT, requireRoles } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { productSchema, stockMovementSchema, UserRole } from '@op/shared';

const router: Router = Router();

router.use(authenticateJWT);

router.get('/categories', ProductController.listCategories);
router.get('/', ProductController.list);
router.get('/:id', ProductController.getById);

router.post(
  '/',
  requireRoles(UserRole.ADMIN, UserRole.WAREHOUSE),
  validateRequest(productSchema),
  ProductController.create
);
router.put(
  '/:id',
  requireRoles(UserRole.ADMIN, UserRole.WAREHOUSE),
  validateRequest(productSchema.partial()),
  ProductController.update
);
router.post(
  '/stock-movement',
  requireRoles(UserRole.ADMIN, UserRole.WAREHOUSE),
  validateRequest(stockMovementSchema),
  ProductController.logStockMovement
);

export default router;
