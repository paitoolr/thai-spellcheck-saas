# -*- coding: utf-8 -*-
"""
💻 อักขราธิการ AI - Desktop App Launcher
รันหน้าเว็บแอปพลิเคชันธรรมดาให้กลายเป็นโปรแกรมสแตนด์อโลนบนเดสก์ท็อปด้วย Microsoft Edge WebView2
"""
import os
import sys
import webview

def main():
    # ดึงพาธสัมบูรณ์ของไฟล์ index.html ในโฟลเดอร์เดียวกัน
    if getattr(sys, 'frozen', False):
        # กรณีแปลงเป็นไฟล์ .exe สำเร็จ
        current_dir = os.path.dirname(sys.executable)
    else:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
    html_path = os.path.join(current_dir, 'index.html')
    
    # ตรวจสอบความถูกต้องของไฟล์ก่อนรัน
    if not os.path.exists(html_path):
        print(f"❌ Error: ไม่พบไฟล์ {html_path} ในระบบ")
        sys.exit(1)
        
    print(f"🚀 กำลังเปิดหน้าต่างแอปพลิเคชัน อักขราธิการ AI จาก: {html_path}")
    
    # สร้างหน้าต่างโปรแกรมแบบ Native Windows
    webview.create_window(
        title='อักขราธิการ AI - ระบบตรวจและเกลาสำนวนภาษาไทยอัจฉริยะ',
        url=html_path,
        width=1320,
        height=880,
        resizable=True,
        min_size=(900, 650),
        background_color='#0b0f19' # ให้สีพื้นหลังเริ่มต้นแมตช์ดาร์กโหมด
    )
    
    # สตาร์ทตัวแสดงผลเว็บวิว
    webview.start(gui='edgehtml' if os.name == 'nt' else 'cef')

if __name__ == '__main__':
    main()
