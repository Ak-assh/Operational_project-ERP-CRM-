// ============================================================================
// Database Seed Script — Roles, Permissions, Demo Users
// ============================================================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ---- Roles ----
  console.log('Creating roles...');
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: { name: 'ADMIN', displayName: 'Administrator', description: 'Full system access' },
    }),
    prisma.role.upsert({
      where: { name: 'SALES' },
      update: {},
      create: { name: 'SALES', displayName: 'Sales Manager', description: 'Customer and challan management' },
    }),
    prisma.role.upsert({
      where: { name: 'WAREHOUSE' },
      update: {},
      create: { name: 'WAREHOUSE', displayName: 'Warehouse Lead', description: 'Product and inventory management' },
    }),
    prisma.role.upsert({
      where: { name: 'ACCOUNTS' },
      update: {},
      create: { name: 'ACCOUNTS', displayName: 'Accounts Officer', description: 'View-only financial access' },
    }),
  ]);
  console.log(`  ✅ ${roles.length} roles created`);

  const [adminRole, salesRole, warehouseRole, accountsRole] = roles;

  // ---- Demo Users ----
  console.log('Creating demo users...');
  const passwordHash = await bcrypt.hash('password123', 12);

  const users = await Promise.all([
    // @portal.com users (matching UI Quick Demo Login buttons & README)
    prisma.user.upsert({
      where: { email: 'admin@portal.com' },
      update: { passwordHash },
      create: {
        email: 'admin@portal.com',
        passwordHash,
        fullName: 'System Administrator',
        roleId: adminRole.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'sales@portal.com' },
      update: { passwordHash },
      create: {
        email: 'sales@portal.com',
        passwordHash,
        fullName: 'Sarah Sales Manager',
        roleId: salesRole.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'warehouse@portal.com' },
      update: { passwordHash },
      create: {
        email: 'warehouse@portal.com',
        passwordHash,
        fullName: 'Wayne Warehouse Lead',
        roleId: warehouseRole.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'accounts@portal.com' },
      update: { passwordHash },
      create: {
        email: 'accounts@portal.com',
        passwordHash,
        fullName: 'Arthur Accounts Officer',
        roleId: accountsRole.id,
      },
    }),
    // @erp.com users fallback
    prisma.user.upsert({
      where: { email: 'admin@erp.com' },
      update: { passwordHash },
      create: {
        email: 'admin@erp.com',
        passwordHash,
        fullName: 'System Administrator',
        roleId: adminRole.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'sales@erp.com' },
      update: { passwordHash },
      create: {
        email: 'sales@erp.com',
        passwordHash,
        fullName: 'Sarah Sales Manager',
        roleId: salesRole.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'warehouse@erp.com' },
      update: { passwordHash },
      create: {
        email: 'warehouse@erp.com',
        passwordHash,
        fullName: 'Wayne Warehouse Lead',
        roleId: warehouseRole.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'accounts@erp.com' },
      update: { passwordHash },
      create: {
        email: 'accounts@erp.com',
        passwordHash,
        fullName: 'Arthur Accounts Officer',
        roleId: accountsRole.id,
      },
    }),
  ]);
  console.log(`  ✅ ${users.length} users created`);

  // ---- Categories ----
  console.log('Creating categories...');
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Industrial Chemicals' },
      update: {},
      create: { name: 'Industrial Chemicals', description: 'Bulk industrial grade solvents and raw materials' },
    }),
    prisma.category.upsert({
      where: { name: 'Packaging Supplies' },
      update: {},
      create: { name: 'Packaging Supplies', description: 'Corrugated boxes, shrink wraps, and strapping' },
    }),
    prisma.category.upsert({
      where: { name: 'Safety Equipment' },
      update: {},
      create: { name: 'Safety Equipment', description: 'PPE gloves, masks, helmets, and hazmat suits' },
    }),
  ]);
  console.log(`  ✅ ${categories.length} categories created`);

  // ---- Products ----
  console.log('Creating products...');
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'SKU-CHEM-001' },
      update: {},
      create: {
        productName: 'Iso-Propyl Alcohol 99.9%',
        sku: 'SKU-CHEM-001',
        categoryId: categories[0].id,
        unitPrice: 120.0,
        currentStock: 50,
        minStockAlert: 20,
        unit: 'LTR',
        location: 'Warehouse A-12',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'SKU-PKG-002' },
      update: {},
      create: {
        productName: 'Heavy Duty 7-Ply Boxes',
        sku: 'SKU-PKG-002',
        categoryId: categories[1].id,
        unitPrice: 45.5,
        currentStock: 3,
        minStockAlert: 15,
        unit: 'PCS',
        location: 'Warehouse B-04',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'SKU-SAF-003' },
      update: {},
      create: {
        productName: 'Nitrile Industrial Gloves (Box of 100)',
        sku: 'SKU-SAF-003',
        categoryId: categories[2].id,
        unitPrice: 350.0,
        currentStock: 120,
        minStockAlert: 25,
        unit: 'BOX',
        location: 'Warehouse C-01',
      },
    }),
  ]);
  console.log(`  ✅ ${products.length} products created`);

  // ---- Customers ----
  console.log('Creating customers...');
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { id: '11111111-1111-4111-a111-111111111111' },
      update: {},
      create: {
        id: '11111111-1111-4111-a111-111111111111',
        customerName: 'Acme Manufacturing Pvt Ltd',
        mobile: '+919876543210',
        email: 'procurement@acme.com',
        businessName: 'Acme Enterprises',
        gstNumber: '27AAAAA0000A1Z5',
        customerType: 'WHOLESALE',
        status: 'ACTIVE',
        address: '101 Industrial Estate, MIDC',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400093',
      },
    }),
    prisma.customer.upsert({
      where: { id: '22222222-2222-4222-a222-222222222222' },
      update: {},
      create: {
        id: '22222222-2222-4222-a222-222222222222',
        customerName: 'Global Logistics Solutions',
        mobile: '+919812345678',
        email: 'info@globallogistics.in',
        businessName: 'Global Logistics Corp',
        gstNumber: '07BBBBB1111B2Z6',
        customerType: 'DISTRIBUTOR',
        status: 'LEAD',
        address: 'Plot 45, Transport Nagar',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110042',
      },
    }),
  ]);
  console.log(`  ✅ ${customers.length} customers created`);

  console.log('\n🚀 Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
