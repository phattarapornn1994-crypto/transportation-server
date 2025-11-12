# คู่มือ Deploy บน Vercel ผ่านเว็บ (ออนไลน์)

## ขั้นตอนที่ 1: Deploy Server (Backend)

### 1.1 เตรียมโปรเจกต์
1. เปิดเว็บเบราว์เซอร์ไปที่ [vercel.com](https://vercel.com)
2. คลิก **"Sign Up"** หรือ **"Log In"** (ใช้ GitHub, GitLab, หรือ Email)

### 1.2 Import Project

**คำถาม: ต้องใช้ GitHub ไหม?**
- **ไม่จำเป็น** แต่แนะนำให้ใช้ (ดูคู่มือ `GITHUB_SETUP.md`)
- ถ้าใช้ GitHub: จะได้ auto-deploy เมื่อ push code
- ถ้าไม่ใช้: สามารถ upload ไฟล์โดยตรงได้

**เลือกวิธี import:**
1. **GitHub/GitLab/Bitbucket**: เชื่อมต่อ repository (แนะนำ)
   - ต้อง upload code ไป GitHub ก่อน (ดู `GITHUB_SETUP.md`)
2. **Import Git Repository**: ใส่ URL ของ repo
3. **Upload**: อัปโหลดไฟล์โดยตรง (ไม่ต้องใช้ Git)

### 1.3 ตั้งค่า Server Project
1. **Project Name**: ตั้งชื่อ เช่น `transportation-server`
2. **Root Directory**: คลิก **"Edit"** และเลือก `server` (หรือพิมพ์ `server`)
3. **Framework Preset**: เลือก **"Other"**
4. **Build Command**: `npm run build`
5. **Output Directory**: **เว้นว่างไว้** (เพราะเป็น serverless function)
6. **Install Command**: `npm install`

### 1.4 Environment Variables (ถ้ามี)
- คลิก **"Environment Variables"**
- เพิ่ม variables ที่จำเป็น (ถ้ามี)

### 1.5 Deploy
1. คลิก **"Deploy"**
2. รอให้ build เสร็จ (ประมาณ 1-2 นาที)
3. **บันทึก URL ที่ได้**: เช่น `https://transportation-server.vercel.app`

---

## ขั้นตอนที่ 2: Deploy Client (Frontend)

### 2.1 Import Project ใหม่
1. กลับไปที่หน้า Dashboard
2. คลิก **"Add New..."** > **"Project"** อีกครั้ง
3. Import project เดียวกัน (แต่จะตั้งค่าแยก)

### 2.2 ตั้งค่า Client Project
1. **Project Name**: ตั้งชื่อ เช่น `transportation-client`
2. **Root Directory**: คลิก **"Edit"** และเลือก `client` (หรือพิมพ์ `client`)
3. **Framework Preset**: เลือก **"Vite"** (Vercel จะ detect อัตโนมัติ)
4. **Build Command**: `npm run build` (หรือเว้นว่างไว้ Vercel จะใช้ default)
5. **Output Directory**: `dist`
6. **Install Command**: `npm install`

### 2.3 ตั้งค่า Environment Variables (สำคัญมาก!)
1. คลิก **"Environment Variables"**
2. เพิ่ม variable:
   - **Name**: `VITE_API_URL`
   - **Value**: URL ของ server ที่ deploy แล้ว (เช่น `https://transportation-server.vercel.app`)
   - เลือกทั้ง 3 environments: **Production**, **Preview**, **Development**
3. คลิก **"Save"**

### 2.4 Deploy
1. คลิก **"Deploy"**
2. รอให้ build เสร็จ
3. **บันทึก URL ที่ได้**: เช่น `https://transportation-client.vercel.app`

---

## ขั้นตอนที่ 3: เปิดดูเว็บไซต์

1. เปิด URL ของ Client ที่ได้จาก Vercel
2. เว็บไซต์จะทำงานและเชื่อมต่อกับ Server อัตโนมัติ

---

## ตัวอย่าง URL ที่จะได้

- **Server**: `https://transportation-server.vercel.app`
- **Client**: `https://transportation-client.vercel.app`

ทดสอบ API:
- `https://transportation-server.vercel.app/api/health`

---

## Troubleshooting

### ปัญหา: API ไม่ทำงาน
**แก้ไข**:
1. ตรวจสอบว่า `VITE_API_URL` ตั้งค่าถูกต้องใน Client project
2. ตรวจสอบว่า Server URL ถูกต้อง (ไม่มี `/api` ต่อท้าย)
3. ดู Network tab ใน Browser DevTools

### ปัญหา: Build Error
**แก้ไข**:
1. ดู Build Logs ใน Vercel Dashboard
2. ตรวจสอบว่า dependencies ติดตั้งครบ: `npm install`
3. ทดสอบ build local ก่อน: `npm run build`

### ปัญหา: Database Error
**หมายเหตุ**: SQLite บน Vercel อาจมีปัญหา เพราะ filesystem เป็น read-only
**แนะนำ**: ใช้ Vercel Postgres หรือ external database

---

## การอัปเดตโค้ด

เมื่อ push code ใหม่ไปที่ Git:
- Vercel จะ **auto-deploy** อัตโนมัติ
- หรือไปที่ Project > **"Redeploy"** ใน Vercel Dashboard

---

## หมายเหตุ

- **Free Plan**: มีการจำกัด bandwidth และ function execution time
- **Custom Domain**: สามารถเพิ่ม domain ของตัวเองได้ใน Project Settings
- **Environment Variables**: สามารถตั้งค่าแยกสำหรับ Production, Preview, Development

