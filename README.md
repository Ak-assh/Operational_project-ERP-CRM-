# Mini ERP + CRM Operations Portal

> Enterprise-grade operational portal for wholesale & distribution companies managing Customer CRM, Product & Inventory Stock, Sales Challans, and Role-Based Access Control.

[![Documentation](https://img.shields.io/badge/Documentation-Case%20Study%20Doc-blue?style=flat-square)](file:///c:/Users/KIIT/Desktop/Operational_Portal/ASSIGNMENT_DOCUMENTATION.md)
[![Frontend: Vercel](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![Backend: Render](https://img.shields.io/badge/Backend-Render-informational?style=flat-square&logo=render)](https://render.com)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-emerald?style=flat-square&logo=supabase)](https://supabase.com)
[![Monorepo: pnpm](https://img.shields.io/badge/Monorepo-pnpm%20workspaces-amber?style=flat-square&logo=pnpm)](https://pnpm.io)

> 📄 **Complete Case Study Submission & Architecture Guide**: See [`ASSIGNMENT_DOCUMENTATION.md`](file:///c:/Users/KIIT/Desktop/Operational_Portal/ASSIGNMENT_DOCUMENTATION.md) for full assignment details, server setup, credentials, and business logic explanation.


---

## 🏗️ Repository Architecture

The project is structured as a clean, highly readable monorepo with top-level `frontend`, `backend`, and `shared` directories:

```
Operational_Portal/
├── frontend/                   # React + Vite + Tailwind CSS + TanStack Query + Zustand (Vercel Ready)
│   ├── src/
│   │   ├── components/         # Shared UI components (Data Tables, Badges, Modals, Layouts)
│   │   ├── features/           # Feature modules (auth, customers, products, challans, dashboard)
│   │   ├── services/           # Axios API client
│   │   └── store/              # Zustand global state store
│   ├── vercel.json             # Vercel SPA deployment config
│   └── vite.config.ts
│
├── backend/                    # Express REST API Server + Prisma ORM (Render Ready)
│   ├── prisma/
│   │   ├── schema.prisma       # PostgreSQL schema with Supabase pooling & direct migration URLs
│   │   └── seed.ts             # Demo data & role seeding script
│   ├── src/
│   │   ├── controllers/        # Express HTTP handlers
│   │   ├── middlewares/        # JWT Authentication, RBAC, Zod Validation, Error Handler
│   │   ├── modules/            # Feature modules (auth, customers, products, challans)
│   │   ├── services/           # Business logic & transaction handlers
│   │   ├── app.ts              # Express App setup
│   │   └── server.ts           # HTTP Server entry point
│   ├── Dockerfile              # Multi-stage Docker build for Render
│   └── .env.example
│
├── shared/                     # Shared TypeScript contracts & schemas
│   └── src/
│       ├── enums/              # UserRole, CustomerType, CustomerStatus, ChallanStatus
│       ├── types/              # DTO Interfaces
│       └── validators/         # Zod schemas (including Login & Signup validators)
│
├── render.yaml                 # Render Blueprint specification
├── postman_collection.json     # Postman API Collection
└── package.json                # Root package.json managing workspace scripts
```

---

## 🔐 Key Features & Business Logic

### 1. Authentication & Role-Based Access Control (RBAC)
- **Role Hierarchy**: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`.
- **User Registration / Signup**: Supports quick registration with simple Email & Password under Login (`POST /api/auth/signup`).
- **JWT Protection**: Secure HTTP headers with token verification & role enforcement.

### 2. Customer CRM Module
- Complete client lifecycle management (`Lead` $\rightarrow$ `Active` $\rightarrow$ `Inactive`).
- Categorization (`Retail`, `Wholesale`, `Distributor`).
- Follow-up date scheduling and interactive CRM notes timeline (`General`, `Call`, `Meeting`, `Proposal`).

### 3. Product & Inventory Module
- Catalog management with SKU uniqueness enforcement.
- Low stock threshold tracking (`minStockAlert`).
- **Immutable Stock Movement Audit Trail**: Logs every `IN` / `OUT` movement with quantity, reason, timestamp, and user attribution.

### 4. Sales Challan Module & Stock Logic
- Customer selection & multi-product order assembly.
- Automatic sequential challan number generation (e.g., `CH-2026-0001`).
- Status lifecycle: `Draft` $\rightarrow$ `Confirmed` $\rightarrow$ `Cancelled`.
- **Strict Business Logic**:
  - Stock is atomically reduced upon confirmation (`ChallanStatus.CONFIRMED`).
  - Stock **cannot go negative**. Insufficient stock returns HTTP 400 Bad Request error.
  - Price & product snapshot data stored on each line item (immune to future catalog price changes).
- **Invoice Export**: Printable PDF dispatch challan view (`window.print()`).

---

## 🚀 Cloud Deployment Guide

### 1. Database Setup on **Supabase**
1. Create a free PostgreSQL project on [Supabase](https://supabase.com).
2. Go to **Project Settings** $\rightarrow$ **Database** and copy your connection strings:
   - **Transaction Pooler URL** (port 6543): Copy to `DATABASE_URL`
   - **Direct Connection URL** (port 5432): Copy to `DIRECT_URL`
3. Run Prisma migration and database seed:
   ```bash
   pnpm db:push
   pnpm db:seed
   ```

### 2. Backend Deployment on **Render**
1. Connect your GitHub repository to [Render](https://render.com).
2. Create a new **Web Service** using the included `render.yaml` or set:
   - **Root Directory**: `.`
   - **Build Command**: `pnpm install && pnpm --filter @op/shared run build && pnpm --filter @op/backend run build`
   - **Start Command**: `node backend/dist/server.js`
3. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `your-secure-random-secret`
   - `DATABASE_URL` = `your-supabase-pooled-db-url`
   - `DIRECT_URL` = `your-supabase-direct-db-url`
   - `CORS_ORIGIN` = `https://your-frontend.vercel.app`

### 3. Frontend Deployment on **Vercel**
1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Set **Root Directory**: `frontend`
3. Vercel automatically detects Vite. Set Environment Variables:
   - `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`
4. Deploy! The included `frontend/vercel.json` ensures single-page application route rewrites work flawlessly.

---

## 💻 Local Development Setup

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Step-by-Step Instructions
1. Clone the repository and install dependencies:
   ```bash
   git clone <repo-url>
   cd Operational_Portal
   pnpm install
   ```

2. Configure environment variables in `backend/.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   JWT_SECRET=super-secret-jwt-key-2026
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/operational_portal"
   ```

3. Compile shared dependencies and run dev servers:
   ```bash
   pnpm build:shared
   pnpm dev
   ```
   - Frontend will run on `http://localhost:5173`
   - Backend API will run on `http://localhost:5000`

---

## 🔑 Demo Login Credentials

For local testing or evaluation, use the following pre-seeded credentials (Password: `password123`):

| Role | Email | Capabilities |
|---|---|---|
| **Admin** | `admin@portal.com` | Full administrative access across all modules |
| **Sales** | `sales@portal.com` | Customer CRM, Follow-ups, Create Sales Challans |
| **Warehouse** | `warehouse@portal.com` | Product catalog, Stock movement logs IN/OUT |
| **Accounts** | `accounts@portal.com` | View financial records, sales challans, invoice printing |

Or click **"New User? Signup"** on the Login page to register a new user instantly.

---

## 🧪 Testing with Postman

Import `postman_collection.json` into Postman to test all REST API endpoints:
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `GET /api/customers`
- `POST /api/customers`
- `POST /api/customers/:id/notes`
- `GET /api/products`
- `POST /api/products/stock-movement`
- `GET /api/challans`
- `POST /api/challans`
- `POST /api/challans/:id/confirm`
