import React from 'react';

// ✅ เพิ่ม toggleMenu เข้ามารับคำสั่งเปิด/ปิด Sidebar จาก App.jsx
export default function Navbar({ activePage, user, toggleMenu }) {
  // ฟังก์ชันช่วยแปลง ID เป็นชื่อหน้าจอ
  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard': return 'ภาพรวมการเรียนรู้ (Dashboard)';
      case 'module1': return 'รู้เท่าทันภัยทางการเงิน';
      case 'module2': return 'เครื่องคำนวณภาษี (Tax Simulator)';
      case 'module3': return 'เครื่องคิดเลขการเงิน (TVM)';
      case 'module4': return 'วางแผนเกษียณอายุ (Retirement Planner)';
      case 'module5': return 'จำลองแผนการเงินตลอดชีพ (Capstone)';
      default: return 'The Financial Classroom';
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 h-16 flex justify-between items-center px-4 md:px-8 shadow-sm">
      
      <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
        {/* 🍔 ปุ่มแฮมเบอร์เกอร์ (แสดงเฉพาะบนหน้าจอที่เล็กกว่า Desktop) */}
        <button 
          onClick={toggleMenu}
          className="lg:hidden p-2 -ml-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center shrink-0"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* ชื่อหน้าจอ (ตั้งค่าให้ตัดคำเป็น ... หากจอมือถือเล็กเกินไป) */}
        <h2 className="text-lg md:text-xl font-extrabold text-slate-800 tracking-tight truncate">
          {getPageTitle()}
        </h2>
      </div>
      
      <div className="flex items-center gap-4 md:gap-6 shrink-0">
        {/* ช่องค้นหา (แสดงเฉพาะจอคอมพิวเตอร์) */}
        <div className="hidden xl:flex items-center bg-slate-100 rounded-full px-4 py-1.5 gap-2 border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <span className="material-symbols-outlined text-sm text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="ค้นหาบทเรียน..." 
            className="bg-transparent border-none text-sm focus:ring-0 outline-none w-48 text-slate-700 font-medium"
          />
        </div>

        {/* ปุ่มแจ้งเตือน (ซ่อนในมือถือจอเล็กสุดเพื่อประหยัดพื้นที่) */}
        <button className="hidden sm:block p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 relative">
          <span className="material-symbols-outlined">notifications</span>
          <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
        </button>

        {/* ส่วนแสดงข้อมูลผู้ใช้งาน */}
        <div className="flex items-center gap-3 pl-0 sm:pl-6 sm:border-l border-slate-100">
          {/* ชื่อและ ID (ซ่อนบนมือถือ โชว์แค่รูปโปรไฟล์) */}
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-slate-800 leading-none mb-1">
              {user ? user.name : 'แขกรับเชิญ'}
            </div>
            <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest opacity-70">
              {user ? `ID: ${user.id}` : 'GUEST'}
            </div>
          </div>
          
          {/* รูปวงกลมชื่อย่อ (ดึง 2 ตัวแรกของชื่อมาโชว์) */}
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-blue-200 border border-blue-500 cursor-pointer hover:scale-105 transition-transform shrink-0">
            {user ? user.name.substring(0, 2) : '??'}
          </div>
        </div>
      </div>
    </header>
  );
}