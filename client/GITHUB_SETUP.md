# วิธี Upload โปรเจกต์ไป GitHub (สำหรับ Vercel)

## 📌 คำตอบสั้นๆ

**ไม่จำเป็นต้องใช้ GitHub** แต่แนะนำให้ใช้เพราะ:
- ✅ Auto-deploy เมื่อ push code ใหม่
- ✅ Version control
- ✅ ง่ายต่อการจัดการและ backup

## ⚠️ สำคัญ: โครงสร้างไฟล์ที่ต้อง Upload

**ต้องเอา folder `server/` และ `client/` ทั้งหมดไป** ไม่ใช่แค่ไฟล์ใน `src/` เท่านั้น!

ดูรายละเอียด: `GITHUB_STRUCTURE.md`

---

## 🚀 วิธีที่ 1: ใช้ GitHub (แนะนำ)

### ขั้นตอนที่ 1: สร้าง Repository บน GitHub

1. ไปที่ [github.com](https://github.com)
2. Login
3. คลิก **"+"** → **"New repository"**
4. ตั้งชื่อ repository เช่น `transportation-system`
5. เลือก **Public** หรือ **Private**
6. **อย่า** check "Initialize with README" (ถ้ามี code อยู่แล้ว)
7. คลิก **"Create repository"**

### ขั้นตอนที่ 2: Upload Code ไป GitHub

#### วิธี A: ใช้ GitHub Desktop (ง่ายที่สุด)

1. ดาวน์โหลด [GitHub Desktop](https://desktop.github.com/)
2. เปิด GitHub Desktop
3. File → Add Local Repository
4. เลือกโฟลเดอร์ที่มี `server` และ `client` (เช่น `C:\`)
5. คลิก **"Publish repository"**
6. เลือก repository ที่สร้างไว้บน GitHub
7. คลิก **"Publish repository"**

#### วิธี B: ใช้ Command Line (Git)

เปิด PowerShell หรือ Command Prompt:

```bash
# ไปที่โฟลเดอร์ที่มี server และ client
cd C:\

# ตรวจสอบว่าเป็น git repository หรือยัง
git status

# ถ้ายังไม่ใช่ git repository ให้รัน:
git init

# เพิ่มไฟล์ทั้งหมด
git add .

# Commit
git commit -m "Initial commit"

# เพิ่ม remote repository (แทน YOUR_USERNAME และ REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push ไป GitHub
git branch -M main
git push -u origin main
```

#### วิธี C: Upload ผ่านเว็บ (ง่าย แต่ไม่เหมาะกับไฟล์เยอะ)

1. ไปที่ repository ที่สร้างไว้บน GitHub
2. คลิก **"uploading an existing file"**
3. ลากไฟล์และโฟลเดอร์ `server` และ `client` ไปวาง
4. Commit changes

---

## 📤 วิธีที่ 2: Upload โดยตรงไป Vercel (ไม่ใช้ GitHub)

### ขั้นตอน

1. ไปที่ [vercel.com](https://vercel.com) → Login
2. คลิก **"Add New..."** → **"Project"**
3. เลือก **"Upload"** หรือ **"Browse"**
4. เลือกโฟลเดอร์ `server` หรือ `client` ที่ต้องการ deploy
5. ตั้งค่าตามคู่มือ `VERCEL_ONLINE_GUIDE.md`
6. Deploy

**หมายเหตุ**: วิธีนี้จะต้อง upload ใหม่ทุกครั้งที่แก้ไข code

---

## 📝 สร้างไฟล์ .gitignore

สร้างไฟล์ `.gitignore` ที่ root (C:\) เพื่อไม่ให้ commit ไฟล์ที่ไม่จำเป็น:

```
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.production

# Database
*.db
*.sqlite
*.sqlite3

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Vercel
.vercel
```

---

## ✅ หลัง Upload ไป GitHub แล้ว

1. ไปที่ Vercel Dashboard
2. Import project จาก GitHub
3. เลือก repository ที่ upload ไว้
4. ตั้งค่า Root Directory เป็น `server` หรือ `client`
5. Deploy

---

## 🔄 การอัปเดต Code

### ถ้าใช้ GitHub:
```bash
git add .
git commit -m "Update code"
git push
```
Vercel จะ auto-deploy อัตโนมัติ!

### ถ้าไม่ใช้ GitHub:
ต้อง upload ใหม่ทุกครั้งใน Vercel Dashboard

---

## 💡 แนะนำ

**ใช้ GitHub** เพราะ:
- ง่ายต่อการจัดการ
- Auto-deploy
- Backup code อัตโนมัติ
- ทำงานร่วมกับทีมได้ง่าย

