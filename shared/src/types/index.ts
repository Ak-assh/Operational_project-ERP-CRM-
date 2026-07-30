import { UserRole, CustomerType, CustomerStatus, StockMovementType, ChallanStatus, NoteType } from '../enums/index.js';

export interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseDTO {
  user: UserDTO;
  token: string;
}

export interface CustomerDTO {
  id: string;
  customerName: string;
  mobile: string;
  email?: string | null;
  businessName?: string | null;
  gstNumber?: string | null;
  customerType: CustomerType;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  status: CustomerStatus;
  followUpDate?: string | null;
  createdById?: string | null;
  createdBy?: Partial<UserDTO> | null;
  notesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerNoteDTO {
  id: string;
  customerId: string;
  note: string;
  noteType: NoteType;
  createdById: string;
  createdBy?: Partial<UserDTO> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDTO {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDTO {
  id: string;
  productName: string;
  sku: string;
  categoryId?: string | null;
  category?: CategoryDTO | null;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  unit: string;
  location?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovementDTO {
  id: string;
  productId: string;
  product?: Partial<ProductDTO> | null;
  quantity: number;
  movementType: StockMovementType;
  reason: string;
  referenceType?: string | null;
  referenceId?: string | null;
  previousStock: number;
  newStock: number;
  createdById: string;
  createdBy?: Partial<UserDTO> | null;
  createdAt: string;
}

export interface SalesChallanItemDTO {
  id: string;
  challanId: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  createdAt: string;
}

export interface SalesChallanDTO {
  id: string;
  challanNumber: string;
  customerId: string;
  customer?: CustomerDTO | null;
  status: ChallanStatus;
  totalQuantity: number;
  totalAmount: number;
  notes?: string | null;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdById: string;
  createdBy?: Partial<UserDTO> | null;
  items: SalesChallanItemDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
