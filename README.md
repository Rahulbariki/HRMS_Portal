# IntelliAttend - Enterprise Multi-Tenant HRMS & Attendance SaaS Portal

[![Vite](https://img.shields.io/badge/Vite-8.3.4-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.3.1-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.3.3-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Currency](https://img.shields.io/badge/Currency-INR%20(₹)-teal?style=flat)](#)

IntelliAttend is a production-grade, multi-tenant Human Resource Management System (HRMS) and automated attendance intelligence platform designed for modern enterprises. It provides end-to-end management of organizational hierarchies, tenant isolation, biometric/geolocation clock-in, leave regularizations, automated payroll slips, and subscription billing.

---

## 📋 Technology Stack & Architecture

| Layer | Technology | Version / Details | Status |
|---|---|---|---|
| **Frontend** | React.js, Vite, React Router DOM | React 19.3.1, Vite 8.3.4, React Router 7 | ✅ Fully Implemented |
| **Styling** | Tailwind CSS v4, Lucide React Icons | `@tailwindcss/vite` 4.3.3, `@theme` Slate & Teal | ✅ Fully Implemented |
| **Backend** | Node.js, Express.js | Express 5, JWT Auth, CORS, Multer | ✅ Fully Implemented |
| **Database** | Neon PostgreSQL | Serverless Lakebase Postgres 18 via `@neondatabase/serverless` | ✅ Connected & Seeded |
| **Object Storage**| Cloudinary | Cloudinary v2 SDK for avatars & policy document storage | ✅ Fully Implemented |
| **Currency** | Indian Rupee (`₹`) | Standardized across all payroll, plans, and ledgers | ✅ Fully Implemented |

---

## 🔐 Production Demonstration Accounts

All roles are provisioned with standardized credentials and official company domain accounts:

| Portal Role | Official Email Address | Password | Permissions & Scope |
|---|---|---|---|
| **Super Admin** | `rahulbariki.intelliattend@gmail.com` | `password123` | Platform oversight, company tenants, subscription plans, global transactions ledger, audit logs |
| **Client Admin** | `clientadmin.intelliattend@gmail.com` | `password123` | Company manager administration, company-wide policies, corporate billing & seat licenses |
| **Manager** | `manager.intelliattend@gmail.com` | `password123` | Team attendance verifications, leave approvals, task delegation, team expense reviews |
| **Employee** | `employee.intelliattend@gmail.com` | `password123` | Daily clock-in/out, leave requests, payslip download (₹), document locker, internal mail |

---

## ✨ Core Feature Highlights

### 1. Super Admin Command Center
- **Tenant Management**: Provision and oversee client corporations, custom subdomains (`*.hrms.portal`), and employee quota allocations.
- **Subscription & Plan Engine**: Configure Starter, Professional, and Enterprise tiers with monthly and annual billing cycles in Indian Rupees (`₹`).
- **Financial Transactions & Ledger**: Real-time multi-tenant transaction tracking, gateway settlement audit logs (Razorpay UPI, Stripe, HDFC RTGS Wire), 18% GST tax breakdown, and instant CSV export.
- **Root Authority Identity**: Digitally verifiable ID card and cryptographic credentials.

### 2. Client Corporate Administration
- **Manager Delegation**: Allocate managers across departments (Engineering, Operations, Product, HR).
- **Corporate Policies & Compliance**: Manage conduct, security, reimbursement thresholds, and operational rules.
- **Billing & Licenses**: Invoice histories, seat usage tracking, and plan renewals in `₹`.

### 3. Manager Workspace
- **Live Team Roster**: Real-time present, late, WFH, and absent tracking.
- **One-Click Verifications**: Verify and regularize shift punches.
- **Leave Decisioning**: Approve or reject team leave requests with status logs.
- **Organization Hierarchy**: Dynamic org chart visualizer.

### 4. Employee Self-Service
- **Biometric / Web Check-In**: Punch in/out with working duration computation.
- **Salary & Payslips**: Detailed breakdown of Basic, HRA, Special Allowances, PF, and TDS with net pay in `₹`.
- **Leave Balance Engine**: Real-time tracking of Annual, Sick, and Casual allowances.
- **Digital Employee ID Card**: Official corporate ID card format with department branding.

---

## 🚀 Quickstart & Setup

### Prerequisites
- Node.js `v18.0.0` or higher
- npm `v9.0.0` or higher
- PostgreSQL `v14+` (or Neon Cloud PostgreSQL)

### 1. Clone & Install Dependencies
```bash
git clone <your-github-repo-url>
cd HRMS_Portal

# Install frontend dependencies
npm --prefix intelliattend install
```

### 2. Run the Development Server
```bash
npm run dev
# Or directly from frontend directory:
# cd intelliattend && npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 📡 Backend & API Architecture (Node.js & Express)

### Core API Endpoints

#### Authentication (`/api/auth`)
- `POST /api/auth/login` - Authenticate role user (SuperAdmin, Client Admin, Manager, Employee)
- `POST /api/auth/register` - Tenant registration
- `GET /api/auth/me` - Retrieve current session and cryptographic claims

#### SuperAdmin (`/api/superadmin`)
- `GET /api/superadmin/dashboard/stats` - Total companies, active users, monthly revenue (`₹`), and requests
- `GET /api/superadmin/companies` - List all corporate tenants
- `POST /api/superadmin/companies` - Onboard new corporate tenant
- `GET /api/superadmin/transactions` - Fetch complete ledger with GST details
- `POST /api/superadmin/plans` - Create or update subscription plan

#### Employee & Manager Workflows (`/api/employee`, `/api/manager`)
- `GET /api/employee/attendance/summary` - Today's check-in/out and monthly metrics
- `POST /api/employee/attendance/check-in` - Log clock-in punch
- `POST /api/employee/attendance/check-out` - Log clock-out punch
- `GET /api/employee/leaves/balance` - Current leave allowances
- `POST /api/employee/leaves/apply` - Submit leave application
- `PATCH /api/manager/leaves/:id/approve` - Approve employee leave request
- `PATCH /api/manager/leaves/:id/reject` - Reject employee leave request

---

## 🗄️ PostgreSQL Database Schema

```sql
-- Corporate Tenants
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'Professional',
    status VARCHAR(20) DEFAULT 'active',
    admin_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users & Credentials
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('superadmin', 'client', 'manager', 'employee')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    designation VARCHAR(150),
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Logs
CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    punch_date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'late', 'wfh', 'absent')),
    total_hours VARCHAR(20)
);

-- Financial Transactions
CREATE TABLE transactions (
    id VARCHAR(50) PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    amount_inr NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    gst_18 NUMERIC(12, 2) NOT NULL,
    gateway VARCHAR(50) NOT NULL,
    gateway_reference VARCHAR(100),
    status VARCHAR(20) NOT NULL CHECK (status IN ('completed', 'pending', 'failed', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🛡️ Code Quality & Reliability
- **Component Error Boundaries**: High-availability crash recovery with fallback restart handlers.
- **Form Validation**: Strict client-side email format regex, password rules, and currency bounds.
- **Responsive Design**: Tested across mobile (375px), tablet (768px), and high-resolution desktop viewports.
- **Build Verification**: Clean production bundles with Rollup/Vite tree-shaking and zero unhandled lint issues.

---

## 📦 Deployment Guide

### Frontend Deployment (Vercel / Netlify / Cloudflare Pages)
1. Push your repository to GitHub.
2. Link your repository in [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
3. Set **Root Directory**: `intelliattend`
4. Set **Build Command**: `npm run build`
5. Set **Output Directory**: `dist`
6. Add environment variable:
   ```env
   VITE_API_URL=https://your-backend-service.onrender.com/api
   ```

### Backend & Database Deployment (Render / Railway / Neon)
1. Deploy PostgreSQL database on [Neon.tech](https://neon.tech) or Railway.
2. Deploy the Express service with `DATABASE_URL` and `JWT_SECRET` configured.
