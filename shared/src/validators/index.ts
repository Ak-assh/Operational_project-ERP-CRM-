import { z } from 'zod';
import { UserRole, CustomerType, CustomerStatus, StockMovementType, ChallanStatus, NoteType } from '../enums/index.js';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole).default(UserRole.SALES),
});

export const customerSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  mobile: z.string().min(10, 'Valid mobile number is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  businessName: z.string().optional().or(z.literal('')),
  gstNumber: z.string().max(15, 'GST number cannot exceed 15 characters').optional().or(z.literal('')),
  customerType: z.nativeEnum(CustomerType).default(CustomerType.RETAIL),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  pincode: z.string().optional().or(z.literal('')),
  status: z.nativeEnum(CustomerStatus).default(CustomerStatus.LEAD),
  followUpDate: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export const customerNoteSchema = z.object({
  note: z.string().min(1, 'Note content cannot be empty'),
  noteType: z.nativeEnum(NoteType).default(NoteType.GENERAL),
});

export const productSchema = z.object({
  productName: z.string().min(2, 'Product name is required'),
  sku: z.string().min(2, 'SKU code is required'),
  categoryId: z.string().optional().or(z.literal('')),
  unitPrice: z.number().positive('Unit price must be greater than 0'),
  currentStock: z.number().int().min(0, 'Stock cannot be negative').default(0),
  minStockAlert: z.number().int().min(0, 'Min stock alert must be 0 or greater').default(5),
  unit: z.string().default('pcs'),
  location: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  imageUrl: z.string().optional().or(z.literal('')),
});

export const stockMovementSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  movementType: z.nativeEnum(StockMovementType),
  reason: z.string().min(3, 'Reason for movement is required'),
});

export const challanItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
});

export const salesChallanSchema = z.object({
  customerId: z.string().uuid('Select a valid customer'),
  status: z.nativeEnum(ChallanStatus).default(ChallanStatus.DRAFT),
  notes: z.string().optional().or(z.literal('')),
  items: z.array(challanItemSchema).min(1, 'At least one product item is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type CustomerNoteInput = z.infer<typeof customerNoteSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type StockMovementInput = z.infer<typeof stockMovementSchema>;
export type SalesChallanInput = z.infer<typeof salesChallanSchema>;
