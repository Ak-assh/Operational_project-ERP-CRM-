import { Request, Response, NextFunction } from 'express';
import { AuthService } from './service.js';
import { AuthRequest } from '../../middleware/auth.js';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      return res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: err.message || 'Login failed',
      });
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: err.message || 'Registration failed',
      });
    }
  }

  static async getMe(req: AuthRequest, res: Response) {
    return res.json({
      success: true,
      data: req.user,
    });
  }
}
