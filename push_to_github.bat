@echo off
chcp 65001 > nul
title เครื่องมืออัปโหลด อักขราธิการ AI ขึ้น GitHub

echo ==========================================================
echo    🐙 เครื่องมืออัปโหลด อักขราธิการ AI ขึ้น GitHub 🐙
echo ==========================================================
echo.
echo สคริปต์นี้จะช่วยอัปโหลดไฟล์โครงการของคุณขึ้น GitHub ไปยังคลังเก็บโค้ด (Repository) ของคุณ
echo.
echo [ขั้นตอนแรกที่คุณต้องดำเนินการ:]
echo 1. เข้าเว็บไซต์ https://github.com และล็อกอินบัญชีของคุณ
echo 2. คลิกปุ่ม "New" (สร้าง Repository ใหม่) 
echo 3. ตั้งชื่อ Repository เช่น: thai-spellcheck-saas
echo 4. **สำคัญ:** ปล่อยค่าอื่นๆ เป็นแบบเริ่มต้น (ห้ามคลิกติ๊กถูก Add a README, .gitignore หรือ License)
echo 5. คลิกปุ่ม "Create repository" เพื่อสร้างโครงการเปล่า
echo.
echo ==========================================================
echo.

:: ตรวจสอบว่ามีรีโมทเดิมหรือไม่
git remote remove origin > nul 2>&1

:: รับค่า URL จากผู้ใช้
set /p REPO_URL="กรุณาวางลิงก์ Git Repository ของคุณที่นี่ (ตัวอย่าง: https://github.com/ชื่อผู้ใช้/ชื่อโครงการ.git): "

if "%REPO_URL%"=="" (
    echo.
    echo ❌ คุณไม่ได้ใส่ลิงก์คลังเก็บโค้ด! การทำงานถูกยกเลิก
    pause
    exit /b 1
)

echo.
echo [2/3] กำลังตั้งค่ากิ่งหลัก (Branch) เป็น main...
git branch -M main

echo.
echo [3/3] กำลังเชื่อมต่อและส่งโค้ดขึ้น GitHub (Git Push)...
git remote add origin %REPO_URL%
echo.
echo ระบบอาจจะเด้งหน้าต่างให้คุณกรอกข้อมูลล็อกอิน GitHub (หากเป็นการใช้งานครั้งแรก)
echo กรุณายืนยันสิทธิ์ในระบบหน้าต่างที่ปรากฏ...
echo.
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo ❌ เกิดข้อผิดพลาดในการอัปโหลดโค้ดขึ้น GitHub!
    echo กรุณาตรวจสอบลิงก์คลังเก็บโค้ด หรือตรวจสอบการล็อกอิน Git ของเครื่องคอมพิวเตอร์ของคุณ
    pause
    exit /b %errorlevel%
)

echo.
echo ==========================================================
echo    🎉 อัปโหลดแอปพลิเคชันขึ้น GitHub เรียบร้อยแล้ว! 🎉
echo ==========================================================
echo.
pause
