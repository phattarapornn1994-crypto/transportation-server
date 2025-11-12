# คู่มือการ Deploy Server บน Vercel

## ขั้นตอนการ Deploy

### วิธีที่ 1: ใช้ Vercel CLI

```bash
cd C:\server
npm install -g vercel
vercel login
vercel
```

### วิธีที่ 2: ใช้ Vercel Dashboard

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

## หลัง Deploy

หลัง deploy เสร็จ จะได้ URL เช่น: `https://your-server.vercel.app`

**บันทึก URL นี้ไว้** - จะต้องใช้ในการตั้งค่า Client

## ข้อควรระวัง

### Database (SQLite)

⚠️ **สำคัญ**: SQLite บน Vercel serverless มีข้อจำกัด:
- Filesystem เป็น read-only ยกเว้น `/tmp`
- ข้อมูลใน `/tmp` จะหายเมื่อ function restart

**วิธีแก้**:
1. แก้ไข `src/database.ts` ให้ใช้ `/tmp/transportation.db`
2. หรือใช้ Vercel Postgres (แนะนำสำหรับ production)

### Environment Variables

ถ้ามี environment variables ให้ตั้งค่าใน:
- Vercel Dashboard > Project > Settings > Environment Variables

## การทดสอบ

หลัง deploy แล้ว ทดสอบ API:
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

