# Transportation Management System - Server

ระบบจัดการขนส่งแบบครบวงจร - Backend API

## Features

- ✅ Customer Management API
- ✅ Vehicle Management API
- ✅ Transportation Plan API
- ✅ AI-Powered Route Optimization
- ✅ Report Generation (PDF/Excel)
- ✅ Support for both SQLite (local) and Vercel Postgres (production)

## Tech Stack

- **Runtime**: Node.js 20.x
- **Framework**: Express.js
- **Database**: 
  - SQLite (local development)
  - Vercel Postgres (production)
- **Language**: TypeScript

## Local Development

### Prerequisites

- Node.js 20.x หรือสูงกว่า
- npm หรือ yarn

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Server จะรันที่ `http://localhost:5000`

### Build

```bash
npm run build
```

## API Endpoints

### Health Check
- `GET /api/health` - ตรวจสอบสถานะ API

### Customers
- `GET /api/customers` - ดึงรายการลูกค้าทั้งหมด
- `GET /api/customers/:id` - ดึงข้อมูลลูกค้า
- `POST /api/customers` - สร้างลูกค้าใหม่
- `PUT /api/customers/:id` - แก้ไขข้อมูลลูกค้า
- `DELETE /api/customers/:id` - ลบลูกค้า
- `GET /api/customers/search/:query` - ค้นหาลูกค้า

### Vehicles
- `GET /api/vehicles` - ดึงรายการรถทั้งหมด
- `GET /api/vehicles/:id` - ดึงข้อมูลรถ
- `POST /api/vehicles` - สร้างรถใหม่
- `PUT /api/vehicles/:id` - แก้ไขข้อมูลรถ
- `DELETE /api/vehicles/:id` - ลบรถ
- `GET /api/vehicles/available/list` - ดึงรถที่พร้อมใช้งาน

### Plans
- `GET /api/plans` - ดึงรายการแผนทั้งหมด
- `GET /api/plans/:id` - ดึงข้อมูลแผน
- `POST /api/plans` - สร้างแผนใหม่
- `PUT /api/plans/:id` - แก้ไขแผน
- `DELETE /api/plans/:id` - ลบแผน

### Routes
- `POST /api/routes/optimize/:planId` - วิเคราะห์และสร้างเส้นทาง
- `GET /api/routes/plan/:planId` - ดึงเส้นทางของแผน

### Reports
- `GET /api/reports/plan-summary/:planId/pdf` - สรุปแผนการขนส่ง (PDF)
- `GET /api/reports/driver-order/:routeId/pdf` - คำสั่งงานคนขับ (PDF)
- `GET /api/reports/cost-report/:planId/excel` - รายงานต้นทุน (Excel)
- `GET /api/reports/performance/:planId/:format` - รายงานประสิทธิภาพ (Excel/PDF)
- `GET /api/reports/export/:planId/:format` - ส่งออกข้อมูลดิบ (CSV/Excel)
- `GET /api/reports/history` - ประวัติรายงาน

## Database

### Local Development (SQLite)

ใช้ SQLite โดยอัตโนมัติเมื่อไม่มี `POSTGRES_URL`

Database file: `transportation.db` (ใน project root)

### Production (Vercel Postgres)

ใช้ Vercel Postgres เมื่อมี `POSTGRES_URL` environment variable

ดูรายละเอียดเพิ่มเติมใน [VERCEL_SETUP.md](./VERCEL_SETUP.md)

## Environment Variables

### Local Development
ไม่จำเป็นต้องตั้งค่า (ใช้ SQLite)

### Production (Vercel)
- `POSTGRES_URL` - Vercel Postgres connection string
- `POSTGRES_PRISMA_URL` - Prisma connection string (optional)

## Project Structure

```
server/
├── api/
│   └── index.ts          # Vercel serverless entry point
├── src/
│   ├── database.ts       # Database adapter (SQLite/Postgres)
│   ├── index.ts          # Express app (local dev)
│   └── routes/
│       ├── customers.ts
│       ├── vehicles.ts
│       ├── plans.ts
│       ├── routes.ts
│       └── reports.ts
├── package.json
├── tsconfig.json
└── vercel.json           # Vercel configuration
```

## License

MIT
