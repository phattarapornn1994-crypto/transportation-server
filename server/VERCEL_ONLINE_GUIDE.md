# คู่มือ Deploy Server บน Vercel ผ่านเว็บ (ออนไลน์)

## ขั้นตอนการ Deploy

### 1. เตรียมโปรเจกต์
1. เปิดเว็บเบราว์เซอร์ไปที่ [vercel.com](https://vercel.com)
2. คลิก **"Sign Up"** หรือ **"Log In"** (ใช้ GitHub, GitLab, หรือ Email)

### 2. Import Project
1. หลังจาก login แล้ว คลิก **"Add New..."** > **"Project"**
2. เลือกวิธี import:
   - **GitHub/GitLab/Bitbucket**: เชื่อมต่อ repository (แนะนำ)
   - **Import Git Repository**: ใส่ URL ของ repo
   - **Upload**: อัปโหลดไฟล์ (ถ้าไม่มี Git)

### 3. ตั้งค่า Project
1. **Project Name**: ตั้งชื่อ เช่น `transportation-server`
2. **Root Directory**: 
   - คลิก **"Edit"** 
   - เลือกหรือพิมพ์ `server`
3. **Framework Preset**: เลือก **"Other"**
4. **Build Command**: `npm run build`
5. **Output Directory**: **เว้นว่างไว้** (เพราะเป็น serverless function)
6. **Install Command**: `npm install`

### 4. Environment Variables (ถ้ามี)
- คลิก **"Environment Variables"**
- เพิ่ม variables ที่จำเป็น (ถ้ามี)
- เช่น: `NODE_ENV=production`

### 5. Deploy
1. คลิก **"Deploy"**
2. รอให้ build เสร็จ (ประมาณ 1-2 นาที)
3. **บันทึก URL ที่ได้**: เช่น `https://transportation-server.vercel.app`

---

## ทดสอบ API

หลัง deploy เสร็จ ทดสอบ:
```
https://your-server.vercel.app/api/health
```

ควรได้ response:
```json
{
  "status": "ok",
  "message": "Transportation Management API is running"
}
```

---

## ข้อควรระวัง

### Database (SQLite)
⚠️ **สำคัญ**: SQLite บน Vercel serverless มีข้อจำกัด:
- Filesystem เป็น read-only ยกเว้น `/tmp`
- ข้อมูลใน `/tmp` จะหายเมื่อ function restart

**วิธีแก้**:
1. แก้ไข `src/database.ts` ให้ใช้ `/tmp/transportation.db`
2. หรือใช้ Vercel Postgres (แนะนำสำหรับ production)

### CORS
- Server ตั้งค่า CORS แล้ว
- ถ้ามีปัญหา ให้เพิ่ม client URL ใน allowed origins

---

## การอัปเดต

เมื่อ push code ใหม่ไปที่ Git:
- Vercel จะ **auto-deploy** อัตโนมัติ
- หรือไปที่ Project > **"Redeploy"** ใน Vercel Dashboard

---

## หมายเหตุ

- **Free Plan**: มีการจำกัด function execution time (10 วินาที)
- **Logs**: ดู logs ได้ใน Vercel Dashboard > Project > Functions
- **Custom Domain**: สามารถเพิ่ม domain ของตัวเองได้ใน Project Settings

