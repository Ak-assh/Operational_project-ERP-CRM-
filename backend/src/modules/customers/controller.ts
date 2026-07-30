import { Response, NextFunction } from 'express';
import { CustomerService } from './service.js';
import { AuthRequest } from '../../middleware/auth.js';

export class CustomerController {
  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await CustomerService.listCustomers(req.query as any);
      return res.json({ success: true, ...result });
    } catch (err: any) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.getById(req.params.id);
      return res.json({ success: true, data: customer });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: err.message });
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.createCustomer(req.body, req.user!.id);
      return res.status(201).json({ success: true, message: 'Customer created successfully', data: customer });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.updateCustomer(req.params.id, req.body);
      return res.json({ success: true, message: 'Customer updated successfully', data: customer });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async addNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const note = await CustomerService.addNote(req.params.id, req.body, req.user!.id);
      return res.status(201).json({ success: true, message: 'Follow-up note added', data: note });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
}
