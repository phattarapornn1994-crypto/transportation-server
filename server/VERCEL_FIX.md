# แก้ไข Error Vercel Deployment

## ปัญหาที่พบ

1. **Warning**: `builds` ใน vercel.json ใช้รูปแบบเก่า
2. **Error**: `@types/better-sqlite3@^5.4.5` ไม่พบ version

## การแก้ไข

### 1. แก้ไข vercel.json
- ลบ `functions` config ออก เพราะ Vercel จะ auto-detect serverless functions ในโฟลเดอร์ `api/` อัตโนมัติ
- เก็บแค่ `rewrites` เพื่อ route `/api/*` ไปที่ `/api/index.ts`

### 2. แก้ไข package.json
- ลบ `@types/better-sqlite3` ออก (better-sqlite3 มี types อยู่แล้ว)
- เพิ่ม `engines` เพื่อระบุ Node.js version

## วิธี Deploy ใหม่

### วิธีที่ 1: ใช้ vercel.json (ที่แก้ไขแล้ว)
1. Commit และ push การเปลี่ยนแปลง
2. Vercel จะ auto-deploy อัตโนมัติ

### วิธีที่ 2: ลบ vercel.json แล้วใช้ Vercel Dashboard
1. ลบไฟล์ `vercel.json`
2. ไปที่ Vercel Dashboard > Project Settings
3. ตั้งค่า:
   - **Framework Preset**: Other
   - **Root Directory**: `server`
   - **Build Command**: `npm run build`
   - **Output Directory**: (เว้นว่าง)
4. Deploy ใหม่

## ถ้ายังมีปัญหา

ลองลบ `@types/better-sqlite3` ออกไปเลย เพราะ `better-sqlite3` อาจมี types อยู่แล้ว:

```json
{
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.5",
    // ลบบรรทัดนี้: "@types/better-sqlite3": "^5.4.4",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

