# 🚀 Quick Start: Deploy บน Vercel

## ✅ สิ่งที่ทำเสร็จแล้ว

1. ✅ Database adapter รองรับทั้ง SQLite (local) และ Vercel Postgres (production)
2. ✅ Vercel configuration files
3. ✅ API routes พร้อม async/await support
4. ✅ Helper functions สำหรับ database operations

## 📋 ขั้นตอนการ Deploy

### 1. สร้าง Vercel Postgres Database

1. ไปที่ https://vercel.com/dashboard
2. เลือก Project: `transportation-system` หรือสร้างใหม่
3. ไปที่ **Storage** tab
4. คลิก **Create Database** > เลือก **Postgres**
5. ตั้งชื่อ: `transportation-db`
6. เลือก Region
7. คลิก **Create**

### 2. Deploy Server

#### วิธีที่ 1: ใช้ Vercel CLI

```bash
cd C:\server
npm install -g vercel
vercel login
vercel --prod
```

#### วิธีที่ 2: ใช้ Vercel Dashboard

1. ไปที่ https://vercel.com/new
2. Import project `server` folder
3. ตั้งค่า:
   - **Root Directory**: `server`
   - **Framework**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: (เว้นว่าง)
4. Environment Variables (จะถูกสร้างอัตโนมัติเมื่อสร้าง Postgres):
   - `POSTGRES_URL` ✅
   - `POSTGRES_PRISMA_URL` ✅
5. คลิก **Deploy**

### 3. Deploy Client

1. Import project `client` folder
2. ตั้งค่า:
   - **Framework**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Environment Variables:
   - `VITE_API_URL` = URL ของ Server (เช่น `https://your-server.vercel.app`)
4. คลิก **Deploy**

## 🔧 การแก้ไข Routes อื่นๆ

Routes อื่นๆ (vehicles, plans, routes, reports) ยังต้องแปลงเป็น async/await

**ตัวอย่างการแก้ไข**:

```typescript
// เดิม
router.get('/', (req, res) => {
  const data = db.prepare('SELECT * FROM table').all();
  res.json(data);
});

// แก้เป็น
router.get('/', async (req, res) => {
  const data = await dbAll('SELECT * FROM table');
  res.json(data);
});
```

**Import helper functions**:
```typescript
import { dbAll, dbGet, dbRun, dbExec } from '../utils/db-helpers.js';
```

## 📝 Checklist

- [ ] สร้าง Vercel Postgres database
- [ ] Deploy server บน Vercel
- [ ] ตั้งค่า Environment Variables
- [ ] Deploy client บน Vercel
- [ ] ทดสอบ API: `https://your-server.vercel.app/api/health`
- [ ] แก้ไข routes อื่นๆ ให้เป็น async (vehicles, plans, routes, reports)

## 🐛 Troubleshooting

### Database connection failed
- ตรวจสอบว่า `POSTGRES_URL` ถูกตั้งค่าใน Environment Variables
- ตรวจสอบว่า Postgres database ถูกสร้างแล้ว

### Routes ยังไม่ทำงาน
- แก้ไข routes ให้ใช้ `dbAll`, `dbGet`, `dbRun` จาก `db-helpers.ts`
- เปลี่ยน route handlers เป็น `async`

## 📚 เอกสารเพิ่มเติม

ดูรายละเอียดเพิ่มเติมใน:
- `VERCEL_SETUP.md` - คู่มือการตั้งค่าแบบละเอียด
- `README.md` - ข้อมูลโปรเจกต์

