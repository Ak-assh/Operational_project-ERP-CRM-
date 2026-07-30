import { prisma } from '../../prisma/client.js';
import { CustomerInput, CustomerNoteInput } from '@op/shared';

export class CustomerService {
  static async listCustomers(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customerType?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (query.search) {
      const q = query.search.trim();
      where.OR = [
        { customerName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { mobile: { contains: q, mode: 'insensitive' } },
        { businessName: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.customerType) {
      where.customerType = query.customerType;
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, fullName: true, email: true } },
          _count: { select: { notes: true } },
        },
      }),
    ]);

    return {
      data: customers.map((c) => ({
        ...c,
        followUpDate: c.followUpDate?.toISOString() || null,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        notesCount: c._count.notes,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, fullName: true, email: true } },
        notes: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          include: { createdBy: { select: { id: true, fullName: true } } },
        },
        salesChallans: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!customer || customer.deletedAt) {
      throw new Error('Customer not found');
    }

    return {
      ...customer,
      followUpDate: customer.followUpDate?.toISOString() || null,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
      notes: customer.notes.map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
      })),
      salesChallans: customer.salesChallans.map((sc) => ({
        ...sc,
        totalAmount: Number(sc.totalAmount),
        createdAt: sc.createdAt.toISOString(),
      })),
    };
  }

  static async createCustomer(input: CustomerInput, userId: string) {
    const customer = await prisma.customer.create({
      data: {
        customerName: input.customerName.trim(),
        mobile: input.mobile.trim(),
        email: input.email ? input.email.trim() : null,
        businessName: input.businessName ? input.businessName.trim() : null,
        gstNumber: input.gstNumber ? input.gstNumber.trim().toUpperCase() : null,
        customerType: input.customerType,
        address: input.address || null,
        city: input.city || null,
        state: input.state || null,
        pincode: input.pincode || null,
        status: input.status,
        followUpDate: input.followUpDate ? new Date(input.followUpDate) : null,
        createdById: userId,
        notes: input.notes
          ? {
              create: {
                note: input.notes.trim(),
                createdById: userId,
              },
            }
          : undefined,
      },
    });

    return customer;
  }

  static async updateCustomer(id: string, input: Partial<CustomerInput>) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new Error('Customer not found');
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...(input.customerName && { customerName: input.customerName.trim() }),
        ...(input.mobile && { mobile: input.mobile.trim() }),
        ...(input.email !== undefined && { email: input.email || null }),
        ...(input.businessName !== undefined && { businessName: input.businessName || null }),
        ...(input.gstNumber !== undefined && { gstNumber: input.gstNumber ? input.gstNumber.toUpperCase() : null }),
        ...(input.customerType && { customerType: input.customerType }),
        ...(input.address !== undefined && { address: input.address || null }),
        ...(input.city !== undefined && { city: input.city || null }),
        ...(input.state !== undefined && { state: input.state || null }),
        ...(input.pincode !== undefined && { pincode: input.pincode || null }),
        ...(input.status && { status: input.status }),
        ...(input.followUpDate !== undefined && {
          followUpDate: input.followUpDate ? new Date(input.followUpDate) : null,
        }),
      },
    });

    return updated;
  }

  static async addNote(customerId: string, input: CustomerNoteInput, userId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer || customer.deletedAt) {
      throw new Error('Customer not found');
    }

    const note = await prisma.customerNote.create({
      data: {
        customerId,
        note: input.note.trim(),
        noteType: input.noteType,
        createdById: userId,
      },
      include: {
        createdBy: { select: { id: true, fullName: true } },
      },
    });

    return {
      ...note,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };
  }
}
