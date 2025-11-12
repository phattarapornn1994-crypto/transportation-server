# คู่มือการ Deploy บน Vercel พร้อม Postgres Database

## ขั้นตอนการ Setup

### 1. สร้าง Vercel Postgres Database

1. ไปที่ [Vercel Dashboard](https://vercel.com/dashboard)
2. เลือก Project: `transportation-system`
3. ไปที่ **Storage** tab
4. คลิก **Create Database** > เลือก **Postgres**
5. ตั้งชื่อ database: `transportation-db`
6. เลือก Region ที่ใกล้ที่สุด
7. คลิก **Create**

### 2. ตั้งค่า Environment Variables

**Environment Variables จะถูกสร้างอัตโนมัติเมื่อสร้าง Postgres database**

#### วิธีดู Environment Variables:

1. **ไปที่ Vercel Dashboard** > เลือก Project ของคุณ
2. **คลิก Settings** > **Environment Variables**
3. **คุณจะเห็น Environment Variables ที่ถูกสร้างอัตโนมัติ**:
   - `POSTGRES_URL` - Connection string สำหรับ Postgres
   - `POSTGRES_PRISMA_URL` - Prisma connection string
   - `POSTGRES_URL_NON_POOLING` - Non-pooling connection string
   - และอื่นๆ

**หมายเหตุ**: 
- ✅ Environment Variables จะถูกสร้างและเชื่อมโยงกับ Project อัตโนมัติ
- ✅ คุณไม่จำเป็นต้องสร้างเอง
- ✅ ค่าจะถูกซ่อนด้วย `***` เพื่อความปลอดภัย
- ✅ ดูรายละเอียดเพิ่มเติมใน `HOW_TO_VIEW_ENV_VARS.md`

### 3. Deploy Server

#### วิธีที่ 1: ใช้ Vercel CLI

```bash
cd C:\server
npm install -g vercel
vercel login
vercel --prod
```

#### วิธีที่ 2: ใช้ Vercel Dashboard

1. ไปที่ [vercel.com](https://vercel.com)
2. Import project จาก GitHub หรือ Upload folder `server`
3. ตั้งค่า:
   - **Root Directory**: `server`
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: (เว้นว่าง)
   - **Install Command**: `npm install`
4. ใน **Environment Variables** ตรวจสอบว่า `POSTGRES_URL` และ `POSTGRES_PRISMA_URL` ถูกตั้งค่าแล้ว
5. คลิก **Deploy**

### 4. Deploy Client

1. Import project `client` ใน Vercel
2. ตั้งค่า:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. ใน **Environment Variables** เพิ่ม:
   - `VITE_API_URL` = URL ของ Server API (เช่น `https://your-server.vercel.app`)
4. คลิก **Deploy**

## การทดสอบ

### ทดสอบ API Server

```bash
curl https://your-server.vercel.app/api/health
```

ควรได้ response:
```json
{
  "status": "ok",
  "message": "Transportation Management API is running",
  "database": "Postgres"
}
```

### ทดสอบ Database

1. ไปที่ Vercel Dashboard > Storage > Postgres
2. เปิด **Table Editor**
3. ตรวจสอบว่ามี tables ถูกสร้างแล้ว:
   - customers
   - vehicles
   - transportation_plans
   - plan_items
   - routes
   - route_stops
   - reports

## การใช้งาน

### Local Development (SQLite)

เมื่อรัน local จะใช้ SQLite โดยอัตโนมัติ:

```bash
cd C:\server
npm run dev
```

### Production (Vercel Postgres)

เมื่อ deploy บน Vercel จะใช้ Postgres โดยอัตโนมัติ (ถ้ามี `POSTGRES_URL`)

## ข้อควรระวัง

1. **Database Migration**: Tables จะถูกสร้างอัตโนมัติเมื่อ API ถูกเรียกครั้งแรก
2. **Connection Pooling**: Vercel Postgres มี connection pooling อัตโนมัติ
3. **Cold Start**: ครั้งแรกที่เรียก API อาจช้าเพราะต้อง initialize database
4. **Data Persistence**: ข้อมูลใน Postgres จะถูกเก็บถาวร (ไม่เหมือน SQLite ใน `/tmp`)

## Troubleshooting

### ปัญหา: Database connection failed

**แก้ไข**:
1. ตรวจสอบว่า `POSTGRES_URL` ถูกตั้งค่าใน Environment Variables
2. ตรวจสอบว่า Postgres database ถูกสร้างแล้วใน Vercel Dashboard
3. ตรวจสอบ logs ใน Vercel Dashboard > Deployments > Functions

### ปัญหา: Tables not created

**แก้ไข**:
1. เรียก API endpoint ใดๆ หนึ่งครั้ง (เช่น `/api/health`)
2. ตรวจสอบ logs ว่ามี error หรือไม่
3. ตรวจสอบใน Table Editor ว่า tables ถูกสร้างแล้ว

### ปัญหา: CORS errors

**แก้ไข**:
1. ตรวจสอบว่า client URL ถูกเพิ่มใน CORS settings
2. ตรวจสอบว่า `VITE_API_URL` ถูกตั้งค่าถูกต้อง

