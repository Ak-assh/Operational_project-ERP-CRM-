import { Response, NextFunction } from 'express';
import { ProductService } from './service.js';
import { AuthRequest } from '../../middleware/auth.js';

export class ProductController {
  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.listProducts(req.query as any);
      return res.json({ success: true, ...result });
    } catch (err: any) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getById(req.params.id);
      return res.json({ success: true, data: product });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: err.message });
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.createProduct(req.body);
      return res.status(201).json({ success: true, message: 'Product created successfully', data: product });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body);
      return res.json({ success: true, message: 'Product updated successfully', data: product });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async logStockMovement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.logStockMovement(req.body, req.user!.id);
      return res.status(201).json({ success: true, message: 'Stock movement logged', data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async listCategories(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const categories = await ProductService.listCategories();
      return res.json({ success: true, data: categories });
    } catch (err: any) {
      next(err);
    }
  }
}
