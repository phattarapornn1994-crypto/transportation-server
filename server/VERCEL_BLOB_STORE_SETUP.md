# 📦 คู่มือการตั้งค่า Vercel Blob Store

## ❓ Custom Prefix คืออะไร?

**Custom Prefix** คือ prefix ที่จะถูกเพิ่มหน้า environment variables ที่ถูกสร้างอัตโนมัติสำหรับ Blob Store

## 📝 ตัวอย่าง

### ถ้า Custom Prefix = `BLOB`:

Environment Variables ที่จะถูกสร้าง:
- `BLOB_STORE_URL`
- `BLOB_STORE_READ_WRITE_TOKEN`
- `BLOB_STORE_READ_ONLY_TOKEN`

### ถ้า Custom Prefix = `STORAGE`:

Environment Variables ที่จะถูกสร้าง:
- `STORAGE_STORE_URL`
- `STORAGE_STORE_READ_WRITE_TOKEN`
- `STORAGE_STORE_READ_ONLY_TOKEN`

### ถ้า Custom Prefix = เว้นว่าง (ไม่มี prefix):

Environment Variables ที่จะถูกสร้าง:
- `BLOB_STORE_URL` (default)
- `BLOB_STORE_READ_WRITE_TOKEN`
- `BLOB_STORE_READ_ONLY_TOKEN`

## 🎯 คำแนะนำสำหรับโปรเจกต์นี้

### สำหรับ Transportation System:

**แนะนำ**: ใช้ **Postgres Database** แทน Blob Store

เพราะ:
- ✅ ระบบใช้ relational database (customers, vehicles, plans, routes)
- ✅ Postgres เหมาะกับ structured data
- ✅ Blob Store เหมาะกับไฟล์/รูปภาพ/object storage

### ถ้าต้องการใช้ Blob Store จริงๆ:

**Custom Prefix ที่แนะนำ**:
- `BLOB` (default - ง่ายและชัดเจน)
- `STORAGE` (ถ้าต้องการชื่อที่ generic กว่า)
- `TRANSPORT_BLOB` (ถ้าต้องการระบุว่าเป็นของ transportation system)

## 📋 ขั้นตอนการตั้งค่า

### Option 1: ใช้ Postgres (แนะนำ)

1. **Storage** > **Create Database** > **Postgres**
2. ตั้งชื่อ: `transportation-db`
3. **ไม่ต้องตั้ง Custom Prefix** (Postgres ไม่มี prefix)
4. Environment Variables จะเป็น:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`

### Option 2: ใช้ Blob Store (ถ้าจำเป็น)

1. **Storage** > **Create Database** > **Blob**
2. ตั้งชื่อ: `transportation-blob`
3. **Custom Prefix**: `BLOB` (หรือเว้นว่าง)
4. Environment Variables จะเป็น:
   - `BLOB_STORE_URL`
   - `BLOB_STORE_READ_WRITE_TOKEN`
   - `BLOB_STORE_READ_ONLY_TOKEN`

## 🔧 การใช้งานใน Code

### ถ้าใช้ Postgres (แนะนำ):

```typescript
// ใน database.ts
const usePostgres = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
```

### ถ้าใช้ Blob Store:

```typescript
// ตัวอย่างการใช้งาน Blob Store
import { put, list, head, del } from '@vercel/blob';

const blob = await put('filename.txt', file, {
  access: 'public',
  token: process.env.BLOB_STORE_READ_WRITE_TOKEN
});
```

## ✅ สรุป

**สำหรับโปรเจกต์ Transportation System:**

1. **ใช้ Postgres Database** (ไม่ใช่ Blob Store)
2. **Custom Prefix**: ไม่ต้องตั้ง (Postgres ไม่มี prefix)
3. **Environment Variables**: `POSTGRES_URL`, `POSTGRES_PRISMA_URL`

**ถ้าต้องการใช้ Blob Store จริงๆ:**
- **Custom Prefix**: `BLOB` (หรือเว้นว่าง)
- Environment Variables จะเป็น: `BLOB_STORE_URL`, `BLOB_STORE_READ_WRITE_TOKEN`

## ⚠️ หมายเหตุ

- **Blob Store** เหมาะสำหรับ: ไฟล์, รูปภาพ, object storage
- **Postgres Database** เหมาะสำหรับ: structured data, relational data
- สำหรับโปรเจกต์นี้ **แนะนำใช้ Postgres** เพราะเป็นระบบจัดการข้อมูลที่มีโครงสร้าง

