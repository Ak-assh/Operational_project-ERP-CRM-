import { Response, NextFunction } from 'express';
import { ChallanService } from './service.js';
import { AuthRequest } from '../../middleware/auth.js';

export class ChallanController {
  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ChallanService.listChallans(req.query as any);
      return res.json({ success: true, ...result });
    } catch (err: any) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const challan = await ChallanService.getById(req.params.id);
      return res.json({ success: true, data: challan });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: err.message });
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const challan = await ChallanService.createChallan(req.body, req.user!.id);
      return res.status(201).json({ success: true, message: 'Sales challan created', data: challan });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async confirm(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const challan = await ChallanService.confirmChallan(req.params.id, req.user!.id);
      return res.json({ success: true, message: 'Challan confirmed and stock updated', data: challan });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reason = req.body.reason || 'Cancelled by user';
      const challan = await ChallanService.cancelChallan(req.params.id, reason, req.user!.id);
      return res.json({ success: true, message: 'Challan cancelled', data: challan });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
}
