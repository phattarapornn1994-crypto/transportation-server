# แก้ไข Error: "added: command not found"

## ปัญหา

Error: `sh: line 1: added: command not found` และ `Error: Command "`npm install`" exited with 127`

เกิดจาก **Install Command** ใน Vercel Dashboard ที่มี backticks (`) หรือคำสั่งผิด

## วิธีแก้ไข

### ขั้นตอนที่ 1: ตรวจสอบ Vercel Dashboard Settings

1. ไปที่ Vercel Dashboard
2. เลือก Project ของคุณ
3. ไปที่ **Settings** > **General** > **Build & Development Settings**
4. ตรวจสอบ **Install Command**

### ขั้นตอนที่ 2: แก้ไข Install Command

**❌ ผิด:**
```
`npm install`
```
หรือ
```
npm install`
```
หรือ
```
added
```

**✅ ถูก:**
```
npm install
```

**หมายเหตุ**: 
- **อย่า** ใส่ backticks (`) 
- **อย่า** ใส่คำสั่งอื่นๆ
- ใช้แค่ `npm install` เท่านั้น

### ขั้นตอนที่ 3: ตั้งค่าอื่นๆ

ตรวจสอบว่า settings อื่นๆ ถูกต้อง:

- **Framework Preset**: `Other`
- **Root Directory**: `server`
- **Build Command**: `npm run build`
- **Output Directory**: (เว้นว่าง - เพราะเป็น serverless)
- **Install Command**: `npm install` (ไม่มี backticks!)

### ขั้นตอนที่ 4: Deploy ใหม่

1. หลังจากแก้ไข settings แล้ว
2. ไปที่ **Deployments** tab
3. คลิก **"Redeploy"** หรือ
4. Push code ใหม่ไป GitHub (Vercel จะ auto-deploy)

---

## วิธีป้องกัน

### ใช้ vercel.json แทน (แนะนำ)

สร้างหรือแก้ไข `vercel.json`:

```json
{
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.ts"
    }
  ]
}
```

วิธีนี้จะ override settings ใน Dashboard และป้องกันปัญหา

---

## ตรวจสอบ Logs

ถ้ายังมีปัญหา ดู logs ใน:
- Vercel Dashboard > Deployments > [เลือก deployment] > Build Logs

---

## สรุป

1. ไปที่ Vercel Dashboard > Settings
2. ตรวจสอบ Install Command = `npm install` (ไม่มี backticks)
3. Save และ Redeploy

