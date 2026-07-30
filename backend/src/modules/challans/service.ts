import { prisma } from '../../prisma/client.js';
import { SalesChallanInput, ChallanStatus, StockMovementType } from '@op/shared';

export class ChallanService {
  private static async generateChallanNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CH-${year}-`;

    const seq = await prisma.sequence.upsert({
      where: { id: 'sales_challan' },
      update: { currentVal: { increment: 1 } },
      create: { id: 'sales_challan', prefix, currentVal: 1 },
    });

    const numStr = String(seq.currentVal).padStart(4, '0');
    return `${prefix}${numStr}`;
  }

  static async listChallans(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customerId?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (query.search) {
      const q = query.search.trim();
      where.OR = [
        { challanNumber: { contains: q, mode: 'insensitive' } },
        { customer: { customerName: { contains: q, mode: 'insensitive' } } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    const [total, challans] = await Promise.all([
      prisma.salesChallan.count({ where }),
      prisma.salesChallan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, customerName: true, mobile: true, businessName: true } },
          createdBy: { select: { id: true, fullName: true } },
          _count: { select: { items: true } },
        },
      }),
    ]);

    return {
      data: challans.map((sc) => ({
        ...sc,
        totalAmount: Number(sc.totalAmount),
        confirmedAt: sc.confirmedAt?.toISOString() || null,
        cancelledAt: sc.cancelledAt?.toISOString() || null,
        createdAt: sc.createdAt.toISOString(),
        updatedAt: sc.updatedAt.toISOString(),
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
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: { select: { id: true, fullName: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, productName: true, sku: true, unit: true, location: true } },
          },
        },
      },
    });

    if (!challan || challan.deletedAt) {
      throw new Error('Sales Challan not found');
    }

    return {
      ...challan,
      totalAmount: Number(challan.totalAmount),
      confirmedAt: challan.confirmedAt?.toISOString() || null,
      cancelledAt: challan.cancelledAt?.toISOString() || null,
      createdAt: challan.createdAt.toISOString(),
      updatedAt: challan.updatedAt.toISOString(),
      items: challan.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
        createdAt: item.createdAt.toISOString(),
      })),
    };
  }

  static async createChallan(input: SalesChallanInput, userId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: input.customerId } });
    if (!customer || customer.deletedAt) {
      throw new Error('Selected customer does not exist');
    }

    const productIds = input.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, deletedAt: null, isActive: true },
    });

    if (products.length !== productIds.length) {
      throw new Error('One or more selected products are invalid or inactive');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalQuantity = 0;
    let totalAmount = 0;

    const itemsData = input.items.map((item) => {
      const p = productMap.get(item.productId)!;
      const unitPrice = Number(p.unitPrice);
      const lineTotal = unitPrice * item.quantity;
      totalQuantity += item.quantity;
      totalAmount += lineTotal;

      return {
        productId: p.id,
        productName: p.productName,
        sku: p.sku,
        unitPrice: p.unitPrice,
        quantity: item.quantity,
        lineTotal,
      };
    });

    if (input.status === ChallanStatus.CONFIRMED) {
      for (const item of input.items) {
        const p = productMap.get(item.productId)!;
        if (p.currentStock < item.quantity) {
          throw new Error(
            `Insufficient stock for '${p.productName}' (SKU: ${p.sku}). Available: ${p.currentStock}, Requested: ${item.quantity}`
          );
        }
      }
    }

    const challanNumber = await this.generateChallanNumber();

    return await prisma.$transaction(async (tx) => {
      const challan = await tx.salesChallan.create({
        data: {
          challanNumber,
          customerId: input.customerId,
          status: input.status,
          totalQuantity,
          totalAmount,
          notes: input.notes || null,
          createdById: userId,
          confirmedAt: input.status === ChallanStatus.CONFIRMED ? new Date() : null,
          items: {
            create: itemsData,
          },
        },
        include: {
          items: true,
          customer: { select: { customerName: true, businessName: true } },
        },
      });

      if (input.status === ChallanStatus.CONFIRMED) {
        for (const item of input.items) {
          const p = productMap.get(item.productId)!;
          const previousStock = p.currentStock;
          const newStock = previousStock - item.quantity;

          await tx.product.update({
            where: { id: p.id },
            data: { currentStock: newStock },
          });

          await tx.stockMovement.create({
            data: {
              productId: p.id,
              quantity: item.quantity,
              movementType: StockMovementType.OUT,
              reason: `Sales Challan #${challanNumber} Confirmed`,
              referenceType: 'CHALLAN',
              referenceId: challan.id,
              previousStock,
              newStock,
              createdById: userId,
            },
          });
        }
      }

      return {
        ...challan,
        totalAmount: Number(challan.totalAmount),
        createdAt: challan.createdAt.toISOString(),
      };
    });
  }

  static async confirmChallan(id: string, userId: string) {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!challan || challan.deletedAt) {
      throw new Error('Sales Challan not found');
    }

    if (challan.status !== ChallanStatus.DRAFT) {
      throw new Error(`Only Draft challans can be confirmed. Current status: ${challan.status}`);
    }

    const productIds = challan.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of challan.items) {
      const p = productMap.get(item.productId);
      if (!p || p.currentStock < item.quantity) {
        const avail = p ? p.currentStock : 0;
        throw new Error(
          `Cannot confirm challan: Insufficient stock for '${item.productName}' (SKU: ${item.sku}). Available: ${avail}, Requested: ${item.quantity}`
        );
      }
    }

    return await prisma.$transaction(async (tx) => {
      const updatedChallan = await tx.salesChallan.update({
        where: { id },
        data: {
          status: ChallanStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
      });

      for (const item of challan.items) {
        const p = productMap.get(item.productId)!;
        const previousStock = p.currentStock;
        const newStock = previousStock - item.quantity;

        await tx.product.update({
          where: { id: p.id },
          data: { currentStock: newStock },
        });

        await tx.stockMovement.create({
          data: {
            productId: p.id,
            quantity: item.quantity,
            movementType: StockMovementType.OUT,
            reason: `Sales Challan #${challan.challanNumber} Confirmed`,
            referenceType: 'CHALLAN',
            referenceId: challan.id,
            previousStock,
            newStock,
            createdById: userId,
          },
        });
      }

      return {
        ...updatedChallan,
        totalAmount: Number(updatedChallan.totalAmount),
        confirmedAt: updatedChallan.confirmedAt?.toISOString(),
      };
    });
  }

  static async cancelChallan(id: string, reason: string, userId: string) {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!challan || challan.deletedAt) {
      throw new Error('Sales Challan not found');
    }

    if (challan.status === ChallanStatus.CANCELLED) {
      throw new Error('Sales Challan is already cancelled');
    }

    return await prisma.$transaction(async (tx) => {
      if (challan.status === ChallanStatus.CONFIRMED) {
        for (const item of challan.items) {
          const p = await tx.product.findUnique({ where: { id: item.productId } });
          if (p) {
            const previousStock = p.currentStock;
            const newStock = previousStock + item.quantity;

            await tx.product.update({
              where: { id: p.id },
              data: { currentStock: newStock },
            });

            await tx.stockMovement.create({
              data: {
                productId: p.id,
                quantity: item.quantity,
                movementType: StockMovementType.IN,
                reason: `Sales Challan #${challan.challanNumber} Cancelled: ${reason}`,
                referenceType: 'CHALLAN',
                referenceId: challan.id,
                previousStock,
                newStock,
                createdById: userId,
              },
            });
          }
        }
      }

      const cancelled = await tx.salesChallan.update({
        where: { id },
        data: {
          status: ChallanStatus.CANCELLED,
          cancelledAt: new Date(),
          cancellationReason: reason,
        },
      });

      return {
        ...cancelled,
        totalAmount: Number(cancelled.totalAmount),
      };
    });
  }
}
