# Mini ERP + CRM Operations Portal

> **Enterprise Operations Management Platform** for Wholesale & Distribution Enterprises.  
> Streamlining Customer Relationship Management (CRM), Catalog & Inventory Stock Control, Sales Challans, and Granular Role-Based Access Control (RBAC).

---

## 🌐 Live Production Links & Resources

| Service / Resource | Production URL | Description | Status |
|---|---|---|---|
| 🚀 **Live Frontend** | [https://operational-project-erp-crm-fronten.vercel.app/login](https://operational-project-erp-crm-fronten.vercel.app/login) | Vercel SPA Client | `Active` |
| ⚡ **Live Backend API** | [https://operational-project-erp-crm.onrender.com](https://operational-project-erp-crm.onrender.com) | Render Express REST API | `Active` |
| 🗄️ **Production Database** | [Supabase PostgreSQL Dashboard](https://supabase.com/dashboard/project/kquffpqwvxltywxdmjhc) | Cloud PostgreSQL Instance | `Active` |
| 📦 **GitHub Repository** | [https://github.com/Ak-assh/Operational_project-ERP-CRM-](https://github.com/Ak-assh/Operational_project-ERP-CRM-) | Source Code & Commit History | `Public` |
| 📄 **Case Study Doc** | [`ASSIGNMENT_DOCUMENTATION.md`](file:///c:/Users/KIIT/Desktop/Operational_Portal/ASSIGNMENT_DOCUMENTATION.md) | Technical & Case Study Specs | `Complete` |
| 🧪 **Postman Collection** | [`postman_collection.json`](file:///c:/Users/KIIT/Desktop/Operational_Portal/postman_collection.json) | API Contract Testing Specs | `Included` |

---

## 🔑 Demo Access Credentials

To test role-based permissions and interface features, use the pre-seeded credentials below (Password for all accounts: `password123`):

| Role | User Email | Password | Access Privileges & Functional Scope |
|---|---|---|---|
| 👑 **Admin** | `admin@portal.com` | `password123` | Unrestricted administrative access across CRM, Inventory, Stock Movements, Challans, and Users |
| 💼 **Sales** | `sales@portal.com` | `password123` | Customer lead/active management, follow-up notes, sales challan creation and confirmation |
| 📦 **Warehouse** | `warehouse@portal.com` | `password123` | Product catalog maintenance, stock allocation, stock IN/OUT audit logging, low stock alerts |
| 💳 **Accounts** | `accounts@portal.com` | `password123` | View-only CRM & Inventory audit, sales order verification, invoice PDF dispatch export |

> 💡 **Self-Registration**: New users can also register dynamically via the **"New User? Signup"** feature on the login screen (`POST /api/auth/signup`).

---

## 🏗️ Monorepo Architecture

The project is engineered as a clean, decoupled monorepo using `pnpm` workspaces:

```
Operational_Portal/
├── frontend/                   # React 18 + Vite + Tailwind CSS + TanStack Query + Zustand
│   ├── src/
│   │   ├── components/         # Shared UI components (Data Tables, Modals, Badges, Layouts)
│   │   ├── features/           # Domain feature modules (auth, customers, products, challans, dashboard)
│   │   ├── services/           # Axios HTTP client with interceptors
│   │   └── store/              # Zustand global authentication & UI state
│   ├── vercel.json             # Vercel SPA client rewrite configuration
│   └── vite.config.ts
│
├── backend/                    # Express REST API + Prisma ORM + PostgreSQL
│   ├── prisma/
│   │   ├── schema.prisma       # Relational database schema with indexes & foreign keys
│   │   └── seed.ts             # Database seeding script for roles & test accounts
│   ├── src/
│   │   ├── controllers/        # HTTP Request handlers
│   │   ├── middlewares/        # JWT Auth, Role Enforcement (RBAC), Zod Validation, Central Error Handler
│   │   ├── services/           # Business logic & atomic database transactions
│   │   ├── app.ts              # Express application configuration
│   │   └── server.ts           # Server entry point
│   ├── Dockerfile              # Production Dockerfile
│   └── .env.example
│
├── shared/                     # Shared TypeScript contracts & schemas (@op/shared)
│   └── src/
│       ├── enums/              # UserRole, CustomerType, CustomerStatus, ChallanStatus
│       ├── types/              # DTO Interfaces
│       └── validators/         # Zod schemas (Login, Signup, Customer, Product, Challan)
│
├── docker-compose.yml          # Multi-container local orchestration
├── render.yaml                 # Infrastructure-as-Code blueprint for Render
├── postman_collection.json     # Ready-to-import Postman API collection
└── package.json                # Root workspace configuration
```

---

## 🌟 Key Features & Core Business Logic

### 1. Role-Based Access Control (RBAC) & Authentication
- **Secure Authentication**: JWT-based session tokens with 24-hour expiration.
- **Granular Permissions**: Middleware protection enforcing role restrictions (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).
- **Password Security**: Salted hashing via `bcryptjs` (10 rounds).

### 2. Customer CRM Management
- **Lifecycle Tracking**: Standardized customer states (`Lead` $\rightarrow$ `Active` $\rightarrow$ `Inactive`).
- **Customer Classification**: Categorized as `Retail`, `Wholesale`, or `Distributor`.
- **CRM Timeline & Notes**: Interactive history logging notes by category (`General`, `Call`, `Meeting`, `Proposal`).
- **Complete Profile Fields**: Customer name, mobile, email, business name, GST number (optional), address, city, state, pincode, status, follow-up date, and notes.

### 3. Product & Inventory Stock Module
- **Catalog Management**: Unique SKU code enforcement, category tagging, unit pricing, unit of measure (`pcs`, `kg`, `box`), and warehouse location.
- **Low Stock Threshold Alerts**: Configurable `minStockAlert` per product with automated visual warning indicators.
- **Immutable Stock Movement Audit Trail**: Comprehensive audit log recording every `IN` / `OUT` movement with quantity, previous stock level, updated stock level, reason, reference ID, timestamp, and user attribution.

### 4. Sales Challan Module & Stock Transaction Integrity
- **Sequential Auto-Numbering**: Automatic generation of challan numbers in format `CH-YYYY-XXXX`.
- **Lifecycle State Machine**: `Draft` $\rightarrow$ `Confirmed` $\rightarrow$ `Cancelled`.
- **Strict Business Logic & Atomic Constraints**:
  - **Product Snapshot Storage**: Challan line items store immutable snapshot data (`productName`, `sku`, `unitPrice`) at order creation time, shielding historical invoices from master catalog price alterations.
  - **Atomic Stock Reduction**: Stock levels are reduced atomically upon confirmation via database transactions (`prisma.$transaction`).
  - **Negative Stock Prevention**: Stock **cannot go negative**. Insufficient stock requests trigger an explicit HTTP 400 Bad Request error detailing the failing SKU.
  - **Invoice Export**: Native browser-optimized print view for immediate dispatch invoice printing and PDF generation (`window.print()`).

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js**: `>= 18.0.0`
- **pnpm**: `>= 8.0.0`
- **PostgreSQL**: Local database or Supabase instance

### Quick Start Instructions

1. **Clone Repository & Install Dependencies**:
   ```bash
   git clone https://github.com/Ak-assh/Operational_project-ERP-CRM-.git
   cd Operational_project-ERP-CRM-
   pnpm install
   ```

2. **Configure Environment Variables**:
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Database Migration & Seeding**:
   ```bash
   pnpm --filter @op/backend db:push
   pnpm --filter @op/backend db:seed
   ```

4. **Build Shared Package & Start Development Servers**:
   ```bash
   pnpm build:shared
   pnpm dev
   ```

   - **Frontend UI**: `http://localhost:5173`
   - **Backend API**: `http://localhost:5000/api`

---

## 🧪 Postman API Testing

Import [`postman_collection.json`](file:///c:/Users/KIIT/Desktop/Operational_Portal/postman_collection.json) into Postman to test all endpoints:

- `POST /api/auth/login` — Authenticate and receive JWT
- `POST /api/auth/signup` — Register new user
- `GET /api/customers` — List customers with search/filter/pagination
- `POST /api/customers` — Create customer profile
- `POST /api/customers/:id/notes` — Append CRM follow-up note
- `GET /api/products` — List catalog products with stock alerts
- `POST /api/products/stock-movement` — Log stock `IN` or `OUT`
- `GET /api/challans` — Retrieve sales challans
- `POST /api/challans` — Create new sales challan (Draft)
- `POST /api/challans/:id/confirm` — Confirm sales challan & reduce stock atomically

---

## 🛠️ Tech Stack Matrix

- **Frontend**: React 18, Vite, Tailwind CSS, TanStack Query v5, Zustand, Lucide Icons
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, Zod, JWT, bcryptjs
- **Database**: Supabase PostgreSQL
- **Hosting & Infrastructure**: Vercel (Frontend), Render (Backend), Docker & Docker Compose
