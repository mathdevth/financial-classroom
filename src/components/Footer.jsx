import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full py-8 px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center bg-white border-t border-slate-200 mt-auto">
      <div className="text-slate-500 font-medium text-sm">
        © 2026 พัฒนาแอปพลิเคชันโดย นายอชิตพล บุณรัตน์ | ตำแหน่ง ครู รร.วังโพรงพิทยาคม สพม.พลอต.
      </div>
      <div className="flex gap-6 text-sm font-bold">
        <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">นโยบายความเป็นส่วนตัว</a>
        <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">ข้อตกลงการใช้งาน</a>
        <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">ติดต่อผู้ดูแลระบบ</a>
      </div>
    </footer>
  );
}