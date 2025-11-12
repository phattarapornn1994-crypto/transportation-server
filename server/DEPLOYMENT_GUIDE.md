# 🚀 คู่มือการ Deploy ระบบจัดการขนส่งบน Vercel

## 📦 โครงสร้างโปรเจกต์

```
transportation-system/
├── server/          # Backend API (Express + TypeScript)
│   ├── api/        # Vercel serverless entry point
│   ├── src/        # Source code
│   └── vercel.json # Vercel configuration
└── client/         # Frontend (React + Vite)
    ├── src/        # Source code
    └── vercel.json # Vercel configuration
```

## 🎯 ขั้นตอนการ Deploy

### Step 1: สร้าง Vercel Postgres Database

1. ไปที่ **Vercel Dashboard**: https://vercel.com/dashboard
2. เลือกหรือสร้าง Project: `transportation-system`
3. ไปที่ **Storage** tab
4. คลิก **Create Database** > เลือก **Postgres**
5. ตั้งค่า:
   - **Name**: `transportation-db`
   - **Region**: เลือกที่ใกล้ที่สุด (เช่น `sin1` สำหรับ Singapore)
6. คลิก **Create**

**หมายเหตุ**: Vercel จะสร้าง Environment Variables อัตโนมัติ:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`

### Step 2: Deploy Server (Backend)

#### วิธีที่ 1: ใช้ Vercel CLI

```bash
# ติดตั้ง Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd C:\server
vercel --prod
```

#### วิธีที่ 2: ใช้ Vercel Dashboard

1. ไปที่ https://vercel.com/new
2. **Import Git Repository** หรือ **Upload** folder `server`
3. ตั้งค่า Project:
   - **Project Name**: `transportation-server`
   - **Root Directory**: `server`
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: (เว้นว่าง - เป็น serverless)
   - **Install Command**: `npm install`
4. **Environment Variables** (ตรวจสอบว่ามี):
   - `POSTGRES_URL` ✅ (อัตโนมัติจาก Postgres)
   - `POSTGRES_PRISMA_URL` ✅ (อัตโนมัติจาก Postgres)
5. คลิก **Deploy**

**หลัง Deploy**: บันทึก URL ที่ได้ เช่น `https://transportation-server.vercel.app`

### Step 3: Deploy Client (Frontend)

1. ไปที่ https://vercel.com/new
2. **Import Git Repository** หรือ **Upload** folder `client`
3. ตั้งค่า Project:
   - **Project Name**: `transportation-client`
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. **Environment Variables**:
   - `VITE_API_URL` = `https://transportation-server.vercel.app` (URL จาก Step 2)
5. คลิก **Deploy**

## ✅ การทดสอบ

### 1. ทดสอบ API Server

```bash
curl https://your-server.vercel.app/api/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "message": "Transportation Management API is running",
  "database": "Postgres"
}
```

### 2. ทดสอบ Database

1. ไปที่ Vercel Dashboard > Storage > Postgres
2. เปิด **Table Editor**
3. ตรวจสอบว่ามี tables:
   - ✅ customers
   - ✅ vehicles
   - ✅ transportation_plans
   - ✅ plan_items
   - ✅ routes
   - ✅ route_stops
   - ✅ reports

**หมายเหตุ**: Tables จะถูกสร้างอัตโนมัติเมื่อเรียก API ครั้งแรก

## 🔧 การแก้ไข Routes ให้รองรับ Async

Routes บางไฟล์ยังต้องแปลงเป็น async/await:

### ไฟล์ที่ต้องแก้ไข:
- `src/routes/vehicles.ts`
- `src/routes/plans.ts`
- `src/routes/routes.ts`
- `src/routes/reports.ts`

### ตัวอย่างการแก้ไข:

**ก่อน**:
```typescript
router.get('/', (req, res) => {
  const data = db.prepare('SELECT * FROM table').all();
  res.json(data);
});
```

**หลัง**:
```typescript
import { dbAll } from '../utils/db-helpers.js';

router.get('/', async (req, res) => {
  const data = await dbAll('SELECT * FROM table');
  res.json(data);
});
```

## 🎉 เสร็จสิ้น!

เมื่อ deploy เสร็จแล้ว คุณจะได้:
- ✅ Backend API: `https://your-server.vercel.app`
- ✅ Frontend App: `https://your-client.vercel.app`
- ✅ Postgres Database: จัดการผ่าน Vercel Dashboard

**ระบบพร้อมใช้งานแล้ว!** 🚀

