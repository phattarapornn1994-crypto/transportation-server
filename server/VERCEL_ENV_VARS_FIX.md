# 🔧 แก้ไขปัญหา: Environment Variable "POSTGRES_URL" references Secret which does not exist

## ❌ ปัญหา

```
Environment Variable "POSTGRES_URL" references Secret "postgres_url", 
which does not exist.
```

## 🔍 สาเหตุ

`vercel.json` อ้างอิง Secret ที่ยังไม่ได้สร้าง Vercel จะสร้าง Environment Variables อัตโนมัติเมื่อสร้าง Postgres database และไม่ต้องอ้างอิงใน `vercel.json`

## ✅ วิธีแก้ไข

### Step 1: แก้ไข vercel.json

ลบส่วน `env` ออกจาก `vercel.json` เพราะ Vercel จะจัดการ Environment Variables อัตโนมัติ

**vercel.json ที่ถูกต้อง**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    }
  ]
}
```

### Step 2: สร้าง Vercel Postgres Database

1. **ไปที่ Vercel Dashboard** > Project ของคุณ
2. **คลิกแท็บ Storage**
3. **คลิก "Create Database"** > เลือก **Postgres**
4. **ตั้งชื่อ**: `transportation-db`
5. **เลือก Region** ที่ใกล้ที่สุด
6. **คลิก "Create"**

### Step 3: ตรวจสอบ Environment Variables

หลังจากสร้าง Postgres แล้ว:

1. **ไปที่ Settings** > **Environment Variables**
2. **คุณจะเห็น Environment Variables ที่ถูกสร้างอัตโนมัติ**:
   - ✅ `POSTGRES_URL`
   - ✅ `POSTGRES_PRISMA_URL`
   - ✅ `POSTGRES_URL_NON_POOLING`
   - และอื่นๆ

**หมายเหตุ**: Environment Variables จะถูกเชื่อมโยงกับ Project อัตโนมัติ

### Step 4: Push Code ใหม่

```bash
cd C:\server
git add vercel.json
git commit -m "fix: ลบ env references จาก vercel.json"
git push origin main
```

### Step 5: Redeploy

1. **Vercel จะ auto-deploy** เมื่อ push code
2. หรือ **Redeploy** จาก Vercel Dashboard

## 📋 Checklist

- [x] แก้ไข `vercel.json` (ลบ env section)
- [ ] Push code ไปยัง GitHub
- [ ] สร้าง Vercel Postgres Database
- [ ] ตรวจสอบ Environment Variables ใน Settings
- [ ] Redeploy

## ⚠️ หมายเหตุสำคัญ

1. **ไม่ต้องสร้าง Secret เอง**: Vercel จะสร้าง Environment Variables อัตโนมัติเมื่อสร้าง Postgres
2. **ไม่ต้องอ้างอิงใน vercel.json**: Environment Variables จะถูก inject อัตโนมัติ
3. **ตรวจสอบใน Settings**: ไปที่ Settings > Environment Variables เพื่อดูว่าถูกสร้างแล้วหรือยัง

## 🎯 สรุป

**ปัญหา**: `vercel.json` อ้างอิง Secret ที่ไม่มี

**วิธีแก้**:
1. ✅ ลบ `env` section จาก `vercel.json`
2. ✅ สร้าง Postgres Database ใน Vercel (จะสร้าง Environment Variables อัตโนมัติ)
3. ✅ Push code ใหม่
4. ✅ Redeploy

**Environment Variables จะถูกจัดการโดย Vercel อัตโนมัติเมื่อสร้าง Postgres Database!** 🎉

