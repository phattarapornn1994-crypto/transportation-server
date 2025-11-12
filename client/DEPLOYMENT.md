# คู่มือการ Deploy บน Vercel

## โครงสร้างโปรเจกต์
- **client/** - Frontend (React + Vite) - โฟลเดอร์นี้
- **server/** - Backend (Express + TypeScript)

## วิธี Deploy

### 1. Deploy Server (Backend) ก่อน

```bash
cd C:\server
npm install -g vercel
vercel login
vercel
```

หรือผ่านเว็บ:
1. ไปที่ [vercel.com](https://vercel.com)
2. Sign in/Login
3. คลิก "Add New..." > "Project"
4. Import project จาก GitHub/GitLab หรือ Upload
5. เลือกโฟลเดอร์ `server`
6. ตั้งค่า:
   - **Root Directory**: `server`
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: (เว้นว่างไว้ - เป็น serverless)
   - **Install Command**: `npm install`
7. คลิก "Deploy"

**บันทึก URL ที่ได้**: เช่น `https://your-server.vercel.app`

### 2. Deploy Client (Frontend)

```bash
cd C:\client
vercel
```

หรือผ่านเว็บ:
1. Import project ใหม่ (หรือใช้ repo เดียวกันแต่เลือกโฟลเดอร์ client)
2. ตั้งค่า:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
3. **Environment Variables** (สำคัญ!):
   - คลิก "Environment Variables"
   - เพิ่ม:
     - **Name**: `VITE_API_URL`
     - **Value**: URL ของ server ที่ deploy แล้ว (เช่น `https://your-server.vercel.app`)
     - เลือกทั้ง Production, Preview, Development
4. คลิก "Deploy"

### 3. เปิดดูเว็บไซต์

หลัง deploy เสร็จ จะได้ URL เช่น:
- Client: `https://your-client.vercel.app`
- Server: `https://your-server.vercel.app`

เปิดเบราว์เซอร์ไปที่ URL ของ Client เพื่อดูเว็บไซต์

## การทดสอบ Local

### รัน Server
```bash
cd C:\server
npm install
npm run dev
```
Server จะรันที่ `http://localhost:5000`

### รัน Client
```bash
cd C:\client
npm install
npm run dev
```
Client จะรันที่ `http://localhost:3000` และจะ proxy API calls ไปที่ server อัตโนมัติ

## ข้อควรระวัง

### Database (SQLite)
⚠️ **สำคัญ**: SQLite บน Vercel serverless อาจมีปัญหาเพราะ filesystem เป็น read-only

**วิธีแก้**:
1. ใช้ `/tmp` directory สำหรับ database (แก้ไข `server/src/database.ts`)
2. หรือใช้ Vercel Postgres (แนะนำสำหรับ production)

### CORS
- Server ตั้งค่า CORS แล้ว แต่ถ้ามีปัญหา ให้เพิ่ม client URL ใน allowed origins

## Troubleshooting

1. **API ไม่ทำงาน**: 
   - ตรวจสอบว่า `VITE_API_URL` ตั้งค่าถูกต้องใน Vercel
   - ตรวจสอบ Network tab ใน browser console

2. **Database error**: 
   - ตรวจสอบว่า database path ใช้ `/tmp` บน Vercel
   - ดู logs ใน Vercel Dashboard

3. **CORS error**: 
   - ตรวจสอบ CORS settings ใน server
   - เพิ่ม client URL ใน CORS allowed origins

4. **Build error**: 
   - ตรวจสอบ logs ใน Vercel Dashboard
   - ทดสอบ build local ก่อน: `npm run build`

