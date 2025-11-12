# 🔧 แก้ไขปัญหา: Root Directory "server" does not exist

## ❌ ปัญหา

```
The specified Root Directory "server" does not exist. 
Please update your Project Settings.
```

## 🔍 สาเหตุ

Vercel ไม่พบ folder `server` ใน GitHub repository ของคุณ

## ✅ วิธีแก้ไข

### วิธีที่ 1: ตรวจสอบ Repository Structure

ตรวจสอบว่า repository structure เป็นอย่างไร:

**Option A: Repository มี folder `server`**
```
transportation-server/
├── server/
│   ├── src/
│   ├── api/
│   └── package.json
└── README.md
```
→ ตั้ง Root Directory: `server` ✅

**Option B: Repository root คือ `server`**
```
transportation-server/
├── src/
├── api/
└── package.json
```
→ ตั้ง Root Directory: `.` หรือเว้นว่าง ✅

### วิธีที่ 2: เปลี่ยน Root Directory ใน Vercel

1. **ไปที่ Vercel Dashboard**
   - เปิด Project ของคุณ
   - คลิก **Settings**

2. **ไปที่ General Settings**
   - เลื่อนลงไปหา **Root Directory**

3. **เปลี่ยน Root Directory**:
   - ถ้า repository root คือ `server` → ตั้งเป็น `.` หรือเว้นว่าง
   - ถ้า repository มี folder `server` → ตั้งเป็น `server`
   - ถ้า repository มี folder อื่น → ตั้งชื่อ folder นั้น

4. **Save** และ **Redeploy**

### วิธีที่ 3: ตรวจสอบ GitHub Repository Structure

1. ไปที่ GitHub repository: `github.com/phattarapornn1994-crypto/transportation-server`
2. ดูว่าไฟล์อยู่ที่ไหน:
   - ถ้าเห็น `src/`, `api/`, `package.json` อยู่ที่ root → Root Directory = `.`
   - ถ้าเห็น folder `server/` → Root Directory = `server`

## 📋 ขั้นตอนการแก้ไข

### Step 1: ตรวจสอบ Repository Structure

ดูใน GitHub ว่าไฟล์อยู่ที่ไหน:
- `package.json` อยู่ที่ไหน?
- `src/` folder อยู่ที่ไหน?
- `api/` folder อยู่ที่ไหน?

### Step 2: ตั้งค่า Root Directory ใน Vercel

1. Vercel Dashboard > Project > **Settings**
2. **General** > **Root Directory**
3. เปลี่ยนเป็น:
   - `.` (ถ้าไฟล์อยู่ที่ root)
   - `server` (ถ้ามี folder server)
   - หรือชื่อ folder ที่ถูกต้อง
4. **Save**

### Step 3: Redeploy

1. ไปที่ **Deployments** tab
2. คลิก **Redeploy** บน deployment ล่าสุด
3. หรือ push code ใหม่ไปยัง GitHub

## 🎯 ตัวอย่างการตั้งค่า

### กรณีที่ 1: Repository root คือ server code
```
transportation-server/
├── src/
├── api/
├── package.json
└── vercel.json
```
**Root Directory**: `.` หรือเว้นว่าง

### กรณีที่ 2: Repository มี folder server
```
transportation-server/
├── server/
│   ├── src/
│   ├── api/
│   └── package.json
└── README.md
```
**Root Directory**: `server`

### กรณีที่ 3: Monorepo (มีทั้ง server และ client)
```
transportation-system/
├── server/
│   ├── src/
│   └── package.json
└── client/
    ├── src/
    └── package.json
```
**Root Directory**: `server` (สำหรับ server project)

## ⚠️ หมายเหตุ

- Root Directory ต้องชี้ไปที่ folder ที่มี `package.json`
- ถ้าเปลี่ยน Root Directory แล้วต้อง **Save** และ **Redeploy**
- ตรวจสอบว่า `vercel.json` อยู่ใน Root Directory ที่ถูกต้อง

## 🔄 หลังจากแก้ไข

1. ✅ เปลี่ยน Root Directory ใน Vercel Settings
2. ✅ Save
3. ✅ Redeploy หรือ push code ใหม่
4. ✅ ตรวจสอบว่า build สำเร็จ

