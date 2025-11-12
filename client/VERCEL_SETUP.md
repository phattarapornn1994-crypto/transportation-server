# วิธี Deploy บน Vercel - สรุปสั้นๆ

## ขั้นตอน

### 1. Deploy Server ก่อน
```bash
cd C:\server
vercel
```
หรือใช้ Vercel Dashboard (ดู `DEPLOYMENT.md`)

**บันทึก URL ที่ได้**: เช่น `https://your-server.vercel.app`

### 2. Deploy Client
```bash
cd C:\client
vercel
```

**สำคัญ**: ต้องตั้งค่า Environment Variable:
- **Name**: `VITE_API_URL`
- **Value**: URL ของ server (เช่น `https://your-server.vercel.app`)

### 3. เปิดดูเว็บ
เปิด URL ของ Client ที่ได้จาก Vercel

## หมายเหตุ

โค้ดปัจจุบันใช้ `axios.get('/api/...')` โดยตรง ซึ่งจะทำงานใน:
- ✅ **Development**: ใช้ Vite proxy (ทำงานอัตโนมัติ)
- ⚠️ **Production**: ต้องตั้งค่า `VITE_API_URL` ใน Vercel

ถ้าต้องการให้รองรับทั้งสองกรณีโดยอัตโนมัติ ให้แก้ไขไฟล์ที่ใช้ axios ให้ใช้ `apiClient` จาก `src/api/axios.ts` แทน

ดูตัวอย่างใน `DEPLOYMENT.md`

