import { prisma } from '../../prisma/client.js';
import { ProductInput, StockMovementInput, StockMovementType } from '@op/shared';

export class ProductService {
  static async listProducts(query: {
    page?: number;
    limit?: number;
    search?: string;
    lowStock?: string;
    categoryId?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null, isActive: true };

    if (query.search) {
      const q = query.search.trim();
      where.OR = [
        { productName: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.lowStock === 'true') {
      where.currentStock = { lte: 5 };
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { productName: 'asc' },
        include: { category: { select: { id: true, name: true } } },
      }),
    ]);

    return {
      data: products.map((p) => ({
        ...p,
        unitPrice: Number(p.unitPrice),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
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
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        stockMovements: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { createdBy: { select: { id: true, fullName: true } } },
        },
      },
    });

    if (!product || product.deletedAt) {
      throw new Error('Product not found');
    }

    return {
      ...product,
      unitPrice: Number(product.unitPrice),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      stockMovements: product.stockMovements.map((sm) => ({
        ...sm,
        createdAt: sm.createdAt.toISOString(),
      })),
    };
  }

  static async createProduct(input: ProductInput) {
    const existingSku = await prisma.product.findUnique({
      where: { sku: input.sku.trim().toUpperCase() },
    });

    if (existingSku) {
      throw new Error(`Product with SKU '${input.sku}' already exists`);
    }

    const product = await prisma.product.create({
      data: {
        productName: input.productName.trim(),
        sku: input.sku.trim().toUpperCase(),
        categoryId: input.categoryId || null,
        unitPrice: input.unitPrice,
        currentStock: input.currentStock,
        minStockAlert: input.minStockAlert,
        unit: input.unit || 'pcs',
        location: input.location || null,
        description: input.description || null,
        imageUrl: input.imageUrl || null,
      },
    });

    return {
      ...product,
      unitPrice: Number(product.unitPrice),
    };
  }

  static async updateProduct(id: string, input: Partial<ProductInput>) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new Error('Product not found');
    }

    if (input.sku && input.sku.trim().toUpperCase() !== existing.sku) {
      const skuCheck = await prisma.product.findUnique({
        where: { sku: input.sku.trim().toUpperCase() },
      });
      if (skuCheck) {
        throw new Error(`Product with SKU '${input.sku}' already exists`);
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(input.productName && { productName: input.productName.trim() }),
        ...(input.sku && { sku: input.sku.trim().toUpperCase() }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId || null }),
        ...(input.unitPrice !== undefined && { unitPrice: input.unitPrice }),
        ...(input.currentStock !== undefined && { currentStock: input.currentStock }),
        ...(input.minStockAlert !== undefined && { minStockAlert: input.minStockAlert }),
        ...(input.unit && { unit: input.unit }),
        ...(input.location !== undefined && { location: input.location || null }),
        ...(input.description !== undefined && { description: input.description || null }),
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl || null }),
      },
    });

    return {
      ...updated,
      unitPrice: Number(updated.unitPrice),
    };
  }

  static async logStockMovement(input: StockMovementInput, userId: string) {
    const product = await prisma.product.findUnique({ where: { id: input.productId } });
    if (!product || product.deletedAt) {
      throw new Error('Product not found');
    }

    const previousStock = product.currentStock;
    let newStock = previousStock;

    if (input.movementType === StockMovementType.IN) {
      newStock = previousStock + input.quantity;
    } else {
      if (previousStock < input.quantity) {
        throw new Error(`Insufficient stock. Current stock: ${previousStock}, requested reduction: ${input.quantity}`);
      }
      newStock = previousStock - input.quantity;
    }

    const [updatedProduct, movement] = await prisma.$transaction([
      prisma.product.update({
        where: { id: input.productId },
        data: { currentStock: newStock },
      }),
      prisma.stockMovement.create({
        data: {
          productId: input.productId,
          quantity: input.quantity,
          movementType: input.movementType,
          reason: input.reason.trim(),
          previousStock,
          newStock,
          createdById: userId,
        },
        include: {
          createdBy: { select: { id: true, fullName: true } },
          product: { select: { productName: true, sku: true } },
        },
      }),
    ]);

    return {
      movement: {
        ...movement,
        createdAt: movement.createdAt.toISOString(),
      },
      currentStock: updatedProduct.currentStock,
    };
  }

  static async listCategories() {
    const categories = await prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return categories;
  }
}
