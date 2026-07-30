export enum UserRole {
  ADMIN = 'ADMIN',
  SALES = 'SALES',
  WAREHOUSE = 'WAREHOUSE',
  ACCOUNTS = 'ACCOUNTS',
}

export enum CustomerType {
  RETAIL = 'Retail',
  WHOLESALE = 'Wholesale',
  DISTRIBUTOR = 'Distributor',
}

export enum CustomerStatus {
  LEAD = 'lead',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum StockMovementType {
  IN = 'IN',
  OUT = 'OUT',
}

export enum ChallanStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export enum NoteType {
  GENERAL = 'general',
  CALL = 'call',
  MEETING = 'meeting',
  PROPOSAL = 'proposal',
}
