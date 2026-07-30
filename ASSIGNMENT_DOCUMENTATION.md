# Mini ERP + CRM Operations Portal — Assignment & Technical Documentation

> **Case Study Submission**: Full Stack Developer Case Study — Mini ERP + CRM Operations Portal  
> **Repository**: [https://github.com/Ak-assh/Operational_project-ERP-CRM-](https://github.com/Ak-assh/Operational_project-ERP-CRM-)

---

## 📋 Executive Summary & Submission Details

This document provides a comprehensive technical overview and operational guide for the **Mini ERP + CRM Operations Portal**, built for wholesale and distribution businesses. The solution is designed as an enterprise-grade monorepo featuring a TypeScript backend REST API, a modern React single-page application frontend, shared contract validation using Zod, and full database persistence with PostgreSQL & Prisma ORM.

### 🌐 Submission Links & Artifacts

| Resource | Link / Artifact Path | Description |
|---|---|---|
| **GitHub Repository** | [github.com/Ak-assh/Operational_project-ERP-CRM-](https://github.com/Ak-assh/Operational_project-ERP-CRM-) | Source code repository with commit history |
| **Live Frontend URL** | [https://operational-project-erp-crm-fronten.vercel.app/login](https://operational-project-erp-crm-fronten.vercel.app/login) | Production React SPA hosted on Vercel |
| **Live Backend API URL** | [https://operational-project-erp-crm.onrender.com/api](https://operational-project-erp-crm.onrender.com) | Production Express REST API hosted on Render |
| **Production Database** | [Supabase Project Dashboard](https://supabase.com/dashboard/project/kquffpqwvxltywxdmjhc) | Cloud PostgreSQL Instance on Supabase |
| **Postman Collection** | [`postman_collection.json`](file:///c:/Users/KIIT/Desktop/Operational_Portal/postman_collection.json) | Importable API testing collection |
| **Render Deployment Blueprint** | [`render.yaml`](file:///c:/Users/KIIT/Desktop/Operational_Portal/render.yaml) | Infrastructure as Code configuration for Render |
| **Vercel SPA Config** | [`vercel.json`](file:///c:/Users/KIIT/Desktop/Operational_Portal/vercel.json) | Route rewrites configuration for SPA client routing |

---

## 🔐 Test Login Credentials

The database comes pre-seeded with four test accounts representing each required role (Password for all pre-seeded accounts: `password123`). Alternatively, new accounts can be registered instantly via the Login/Signup screen (`POST /api/auth/signup`).

| Role | Email | Password | Allowed Capabilities & Scope |
|---|---|---|---|
| 👑 **Admin** | `admin@portal.com` | `password123` | Full access to CRM, Product catalog, Stock log, Sales Challans, System metrics, and User roles |
| 💼 **Sales** | `sales@portal.com` | `password123` | Customer CRM management, Follow-up notes, Creating and Confirming Sales Challans |
| 📦 **Warehouse** | `warehouse@portal.com` | `password123` | Product catalog management, Stock IN/OUT movements logging, Low-stock alerts |
| 💳 **Accounts** | `accounts@portal.com` | `password123` | View-only CRM & Inventory access, Sales Challan review, PDF/Print Invoice export |

---

## 🏗️ Architecture & Technology Stack

### Tech Stack Overview

- **Backend**: Node.js, TypeScript, Express.js, Prisma ORM, PostgreSQL (Supabase)
- **Frontend**: React 18, Vite, Tailwind CSS, TanStack Query (React Query v5), Zustand, Lucide Icons
- **Shared Contracts**: Monorepo package (`@op/shared`) containing shared Enums, DTO Interfaces, and Zod Validation Schemas used by both client and server
- **DevOps & Cloud**: Docker, Docker Compose, Vercel (Frontend), Render (Backend), Supabase (PostgreSQL Database)

### Monorepo Structure

```
Operational_Portal/
├── frontend/                   # React + Vite + Tailwind CSS + TanStack Query + Zustand
│   ├── src/
│   │   ├── components/         # Reusable UI components (Tables, Modals, Badges, Layouts)
│   │   ├── features/           # Domain feature modules (auth, crm, inventory, challans)
│   │   ├── services/           # Axios API Client with interceptors
│   │   └── store/              # Zustand global state management
│   ├── vercel.json             # Vercel SPA deployment rules
│   └── vite.config.ts
│
├── backend/                    # Express REST API Server + Prisma ORM
│   ├── prisma/
│   │   ├── schema.prisma       # PostgreSQL schema definition with indexes
│   │   └── seed.ts             # Role & demo data seeding script
│   ├── src/
│   │   ├── controllers/        # HTTP Request & Response handlers
│   │   ├── middlewares/        # JWT Auth, Role Enforcement, Zod Validation, Error Middleware
│   │   ├── services/           # Core Business Logic & Database Transactions
│   │   ├── app.ts              # Express App setup & middleware wiring
│   │   └── server.ts           # Server bootstrap & process handlers
│   └── Dockerfile              # Production Dockerfile
│
├── shared/                     # Shared TypeScript contracts & schemas
│   └── src/
│       ├── enums/              # UserRole, CustomerType, CustomerStatus, ChallanStatus
│       ├── types/              # DTO Interfaces
│       └── validators/         # Zod validation schemas
│
├── docker-compose.yml          # Local multi-container development environment
├── render.yaml                 # Render web service blueprint definition
├── postman_collection.json     # Ready-to-use Postman collection
└── package.json                # Workspace package manager script aggregator
```

---

## ⚙️ Core Modules & Business Logic Implementation

### 1. Authentication & Role-Based Access Control (RBAC)
- **Authentication**: JWT (JSON Web Tokens) with 24-hour expiration.
- **Authorization**: Middleware verification checking user permissions for endpoints.
- **Security**: Password hashing via `bcryptjs` with salt rounds = 10. Sanitized payload output (passwords excluded).

### 2. Customer CRM Module
- **Lifecycle Tracking**: Customers transition across `Lead` $\rightarrow$ `Active` $\rightarrow$ `Inactive`.
- **Classification**: Categorized into `Retail`, `Wholesale`, and `Distributor`.
- **CRM Timeline & Notes**: Supports adding timestamped notes categorized by type (`General`, `Call`, `Meeting`, `Proposal`), linked to the user who logged them.
- **Fields Supported**: Name, Mobile, Email, Business Name, GST Number (Optional), Address, City, State, Pincode, Status, Follow-up Date, and Notes.

### 3. Product & Inventory Module
- **Catalog Management**: SKU uniqueness enforcement, Category assignment, Unit price, Unit of Measure (`pcs`, `kg`, `box`), and Warehouse Location.
- **Low Stock Alerts**: Configurable `minStockAlert` per product. Visual warning badges when `currentStock <= minStockAlert`.
- **Immutable Stock Movement Audit Trail**: Every stock change creates a `StockMovement` entry capturing:
  - Movement type (`IN` / `OUT`)
  - Quantity changed
  - Previous stock & New stock levels
  - Reason & Reference ID (e.g., linked Challan number or Purchase Order)
  - User ID and Timestamp

### 4. Sales Challan Module & Atomic Stock Transactions
- **Sequential Auto-Numbering**: Automatic generation of challan numbers in format `CH-YYYY-XXXX` using database atomic sequences.
- **Status Flow**: `Draft` $\rightarrow$ `Confirmed` $\rightarrow$ `Cancelled`.
- **Strict Business Logic & Atomic Constraints**:
  - **Snapshot Storage**: Challan items store a immutable copy of product details (`productName`, `sku`, `unitPrice`) at the time of order creation. Future catalog price updates do NOT affect past orders.
  - **Stock Deduction**: Upon confirmation (`POST /api/challans/:id/confirm`), stock is atomically reduced using database transactions (`prisma.$transaction`).
  - **Negative Stock Prevention**: Stock **cannot go negative**. If any item's quantity exceeds current stock, the system rolls back the transaction and responds with HTTP 400 Bad Request error specifying the exact insufficient product.
  - **Printable Invoice Export**: Embedded dispatch challan print view supporting invoice printing and PDF export via `window.print()`.

---

## 🛠️ Server Setup & Environment Variable Management

### Backend Server Setup

The backend server is built with Express.js and Node.js. It features:
1. **Layered Architecture**: Route definitions $\rightarrow$ Middleware pipeline $\rightarrow$ Controller logic $\rightarrow$ Service database layer.
2. **Security & Middleware**:
   - `helmet` for HTTP security header hardening.
   - `cors` configured to allow client requests from configured origin.
   - Centralized `errorHandler` catching operational errors, Zod validation failures, and Prisma database exceptions.

### Environment Variable Management

Environment variables are isolated cleanly across environments using `.env` files locally and secure secret providers in production (Render & Vercel).

#### Backend Environment Variables (`backend/.env`)

```env
# Node Environment
NODE_ENV="development"
PORT=5000

# Authentication
JWT_SECRET="super-secret-jwt-key-for-local-development-2026"
JWT_EXPIRES_IN="24h"

# Database Connection (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/operational_portal?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/operational_portal?schema=public"

# CORS Security
CORS_ORIGIN="http://localhost:5173"
```

> **Note on Database Connection**: Supabase uses connection pooling. Prisma migrations require `DIRECT_URL` (port 5432) while runtime database queries utilize `DATABASE_URL` (port 6543 pooler).

#### Frontend Environment Variables (`frontend/.env`)

```env
VITE_API_BASE_URL="http://localhost:5000/api"
```

---

## 🚀 How to Run the Project Locally

### Prerequisites

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **PostgreSQL**: Local instance or free Supabase cloud instance

### Step-by-Step Local Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Ak-assh/Operational_project-ERP-CRM-.git
   cd Operational_project-ERP-CRM-
   ```

2. **Install Workspace Dependencies**:
   ```bash
   pnpm install
   ```

3. **Set Up Environment Variables**:
   Copy `backend/.env.example` to `backend/.env` and update the database connection string.
   ```bash
   cp backend/.env.example backend/.env
   ```

4. **Run Database Migrations & Seed Data**:
   ```bash
   pnpm --filter @op/backend db:push
   pnpm --filter @op/backend db:seed
   ```

5. **Build Shared Packages & Start Development Servers**:
   ```bash
   pnpm build:shared
   pnpm dev
   ```

6. **Access the Applications**:
   - **Frontend UI**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
   - **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Running with Docker Compose

Alternatively, launch the full multi-container stack (Backend + PostgreSQL) using Docker:

```bash
docker-compose up --build
```

---

## ☁️ Deployment Guide

### 1. Database (Supabase PostgreSQL)
1. Provision a PostgreSQL project on [Supabase](https://supabase.com).
2. Retrieve the **Pooled Connection URL** (`DATABASE_URL`) and **Direct Connection URL** (`DIRECT_URL`).
3. Run `pnpm db:push` to apply schema definitions and `pnpm db:seed` to seed roles and demo accounts.

### 2. Backend Web Service (Render)
1. Create a new Web Service on [Render](https://render.com) connected to the GitHub repository.
2. Select **Docker Runtime** or **Node.js Environment**:
   - Root Directory: `.`
   - Build Command: `pnpm install && pnpm build:shared && pnpm --filter @op/backend build`
   - Start Command: `node backend/dist/server.js`
3. Environment variables configured in Render dashboard: `NODE_ENV`, `PORT`, `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `CORS_ORIGIN`.

### 3. Frontend Static Hosting (Vercel)
1. Import repository into [Vercel](https://vercel.com).
2. Framework Preset: **Vite**. Root Directory: `frontend`.
3. Set Environment Variable: `VITE_API_BASE_URL` = `https://operational-project-erp-crm.onrender.com/api`.
4. Deploy! Rewrites in `vercel.json` forward all non-asset paths to `index.html` for client routing.

---

## 📌 Assumptions Made & Known Limitations

### Assumptions
1. **Currency**: System operates in local currency standard (INR / ₹).
2. **Sequential Numbering**: Challan numbers are auto-generated based on sequential counters with year prefixes (`CH-2026-XXXX`).
3. **Product Price Snapshots**: Line items lock in product pricing at order creation time so historic sales orders remain accurate even if master catalog prices change later.

### Known Limitations
1. **AWS S3 File Storage**: Production deployment uses simulated image URLs for product images; S3 direct upload can be enabled via AWS SDK credentials in backend.
2. **Email Notifications**: CRM follow-up reminders are displayed in the dashboard; automated email dispatch triggers (SendGrid/SES) can be added as a background job.

---

## 🎁 Bonus Features Included

- ✅ **Monorepo Architecture**: Monorepo using `pnpm` workspaces with a shared contract package (`@op/shared`).
- ✅ **Docker Support**: Containerized build setup using `Dockerfile` and `docker-compose.yml`.
- ✅ **Infrastructure as Code**: Render blueprint specification (`render.yaml`) for zero-friction service reproduction.
- ✅ **PDF Invoice Export**: Native browser-optimized print template for Sales Challan invoice generation.
- ✅ **Complete Postman API Collection**: Full REST API contract collection (`postman_collection.json`) with pre-configured requests and headers.
