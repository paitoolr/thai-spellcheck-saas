@echo off
chcp 65001 > nul
title เครื่องมือติดตั้ง อักขราธิการ AI ขึ้นระบบ Cloudflare Pages

echo ==========================================================
echo    ⚡ เครื่องมือติดตั้ง อักขราธิการ AI ขึ้นระบบ Cloudflare Pages ⚡
echo ==========================================================
echo.
echo สคริปต์นี้จะช่วยล็อกอินและอัปโหลดไฟล์แอปพลิเคชันของคุณขึ้น Cloudflare Pages
echo โดยจะอัปโหลดเฉพาะไฟล์หน้าเว็บหลัก (HTML/CSS/JS) และ Pages Functions (Backend)
echo.

:: 1. ตรวจสอบการล็อกอิน Cloudflare
echo [1/3] กำลังตรวจสอบสถานะการเข้าสู่ระบบ Cloudflare...
call npx wrangler whoami > nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [คำเตือน] คุณยังไม่ได้เข้าสู่ระบบ Cloudflare!
    echo ระบบกำลังจะเปิดหน้าต่างเบราว์เซอร์เพื่อให้คุณกดอนุมัติการเชื่อมต่อ (Wrangler Login)
    echo เมื่อยืนยันสิทธิ์บนเว็บเบราว์เซอร์เสร็จแล้ว ให้กลับมาตรวจสอบที่หน้าต่างนี้
    echo.
    pause
    call npx wrangler login
) else (
    echo [สำเร็จ] ตรวจพบการเข้าสู่ระบบ Cloudflare เรียบร้อยแล้ว!
)
echo.

:: 2. อัปโหลดแอปพลิเคชัน
echo [2/3] กำลังเริ่มขั้นตอนการ Deploy แอปพลิเคชันขึ้น Cloudflare Pages...
echo โดเมนเริ่มต้นของคุณจะเป็น: ชื่อโปรเจกต์.pages.dev
echo.
set /p PROJ_NAME="กรุณาป้อนชื่อโปรเจกต์ที่คุณต้องการ (ตัวอย่าง: thai-spellcheck-ai): "

if "%PROJ_NAME%"=="" (
    set PROJ_NAME=thai-spellcheck-ai
)

echo.
echo กำลังจัดส่งไฟล์ไปยัง Cloudflare Pages (โปรเจกต์: %PROJ_NAME%)...
echo.
call npx wrangler pages deploy . --project-name "%PROJ_NAME%" --branch main
if %errorlevel% neq 0 (
    echo.
    echo ❌ เกิดข้อผิดพลาดในขั้นตอนการ Deploy!
    echo กรุณาตรวจสอบว่าชื่อโครงการไม่ซ้ำกับคนอื่น หรือเช็คอินเทอร์เน็ตของคุณ
    pause
    exit /b %errorlevel%
)
echo.

:: 3. สรุปขั้นตอนถัดไป
echo ==========================================================
echo    🎉 ติดตั้งแอปพลิเคชัน อักขราธิการ AI บน Cloudflare สำเร็จ! 🎉
echo ==========================================================
echo.
echo [ขั้นตอนสำคัญถัดไปในการเปิดใช้งานระบบ Backend AI:]
echo 1. เข้าสู่หน้าแดชบอร์ด Cloudflare (https://dash.cloudflare.com)
echo 2. ไปที่เมนู Workers & Pages ➡️ คลิกเลือกโปรเจกต์ "%PROJ_NAME%"
echo 3. ไปที่แท็บ Settings (ตั้งค่า) ➡️ Environment Variables (ตัวแปรสภาพแวดล้อม)
echo 4. คลิก Add Variable ➡️ ตั้งชื่อว่า: GEMINI_API_KEY
echo 5. ป้อนกุญแจ Gemini API Key ของคุณในช่องค่า (Value) ➡️ กด Save
echo 6. ทำการ Redeploy หรือกด Deploy ล่าสุดอีกครั้งเพื่อให้คีย์มีผลใช้งาน
echo.
echo ขอให้สนุกกับการขายแอปพลิเคชันของคุณ!
echo ==========================================================
pause
