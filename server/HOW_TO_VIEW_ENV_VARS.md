# 📋 วิธีดู Environment Variables ใน Vercel Dashboard

## 🔍 วิธีที่ 1: ดูจาก Project Settings

### ขั้นตอน:

1. **ไปที่ Vercel Dashboard**
   - เปิด https://vercel.com/dashboard
   - Login เข้าสู่ระบบ

2. **เลือก Project**
   - คลิกที่ Project: `transportation-system` (หรือชื่อ project ของคุณ)

3. **ไปที่ Settings**
   - คลิกแท็บ **Settings** ที่ด้านบน
   - หรือคลิก **Settings** จากเมนูด้านซ้าย

4. **เปิด Environment Variables**
   - ในเมนูด้านซ้าย ใต้ Settings
   - คลิก **Environment Variables**

5. **ดูรายการ Variables**
   - คุณจะเห็นรายการ Environment Variables ทั้งหมด
   - ค้นหา:
     - `POSTGRES_URL` 
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NON_POOLING`
     - `POSTGRES_USER`
     - `POSTGRES_HOST`
     - `POSTGRES_PASSWORD`
     - `POSTGRES_DATABASE`

## 🔍 วิธีที่ 2: ดูจาก Storage (Postgres)

### ขั้นตอน:

1. **ไปที่ Vercel Dashboard**
   - เปิด https://vercel.com/dashboard

2. **เลือก Project**
   - คลิกที่ Project ของคุณ

3. **ไปที่ Storage Tab**
   - คลิกแท็บ **Storage** ที่ด้านบน

4. **เลือก Postgres Database**
   - คลิกที่ Postgres database ของคุณ (เช่น `transportation-db`)

5. **ดู Connection Strings**
   - ในหน้า Postgres database
   - คุณจะเห็นส่วน **Connection String** หรือ **.env.local**
   - คลิก **Show** เพื่อดูค่า (จะถูกซ่อนด้วย `***`)

6. **Copy Connection String**
   - คลิก **Copy** เพื่อคัดลอก connection string
   - หรือดูในส่วน **Environment Variables** ที่แสดงอยู่

## 🔍 วิธีที่ 3: ดูจาก Deployments

### ขั้นตอน:

1. **ไปที่ Project**
   - เปิด Project ใน Vercel Dashboard

2. **ไปที่ Deployments**
   - คลิกแท็บ **Deployments**

3. **เลือก Deployment ล่าสุด**
   - คลิกที่ deployment ล่าสุด

4. **ดู Runtime Logs**
   - ไปที่แท็บ **Functions** หรือ **Logs**
   - Environment Variables จะถูกแสดงใน logs (แต่ค่าจะถูกซ่อน)

## 📝 ตัวอย่าง Environment Variables ที่ควรมี

เมื่อสร้าง Vercel Postgres แล้ว คุณจะเห็น Environment Variables เหล่านี้:

```
POSTGRES_URL=postgres://default:xxx@xxx.aws.neon.tech:5432/verceldb?sslmode=require
POSTGRES_PRISMA_URL=postgres://default:xxx@xxx.aws.neon.tech:5432/verceldb?sslmode=require&pgbouncer=true
POSTGRES_URL_NON_POOLING=postgres://default:xxx@xxx.aws.neon.tech:5432/verceldb?sslmode=require
POSTGRES_USER=default
POSTGRES_HOST=xxx.aws.neon.tech
POSTGRES_PASSWORD=xxx
POSTGRES_DATABASE=verceldb
```

## ⚠️ หมายเหตุสำคัญ

1. **ค่าจะถูกซ่อน**: Vercel จะซ่อนค่าจริงของ Environment Variables ด้วย `***` เพื่อความปลอดภัย

2. **อัตโนมัติ**: เมื่อสร้าง Postgres database ใน Vercel แล้ว Environment Variables จะถูกสร้างและเชื่อมโยงกับ Project อัตโนมัติ

3. **ไม่ต้องตั้งค่าเอง**: คุณไม่จำเป็นต้องสร้าง Environment Variables เอง เพราะ Vercel จะทำให้อัตโนมัติ

4. **ตรวจสอบได้**: คุณสามารถตรวจสอบได้ว่า Environment Variables ถูกตั้งค่าแล้วหรือไม่โดย:
   - ดูใน Settings > Environment Variables
   - หรือเรียก API `/api/health` และดู response ว่า `database: "Postgres"`

## 🧪 วิธีทดสอบว่า Environment Variables ถูกตั้งค่าถูกต้อง

### 1. ทดสอบผ่าน API

```bash
curl https://your-server.vercel.app/api/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "message": "Transportation Management API is running",
  "database": "Postgres"  // ← ถ้าเห็น "Postgres" แสดงว่า POSTGRES_URL ถูกตั้งค่าแล้ว
}
```

### 2. ตรวจสอบใน Code

ใน `src/database.ts` มีการตรวจสอบ:

```typescript
const usePostgres = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
```

ถ้า `usePostgres` เป็น `true` แสดงว่า Environment Variables ถูกตั้งค่าแล้ว

## 🎯 สรุป

**Environment Variables ดูได้จาก**:
1. ✅ **Project Settings > Environment Variables** (แนะนำ)
2. ✅ **Storage > Postgres Database > Connection String**
3. ✅ **Deployments > Functions/Logs**

**ไม่ต้องกังวล**: ถ้าคุณสร้าง Postgres database ใน Vercel แล้ว Environment Variables จะถูกสร้างอัตโนมัติและเชื่อมโยงกับ Project ของคุณทันที! 🎉

