import React from 'react';

// เพิ่ม { user } เข้ามาเพื่อดึงข้อมูลคนล็อกอินมาโชว์ครับ
export default function Navbar({ activePage, user }) {
  // ฟังก์ชันช่วยแปลง ID เป็นชื่อหน้าจอ
  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard': return 'ภาพรวมการเรียนรู้ (Dashboard)';
      case 'module1': return 'รู้เท่าทันภัยทางการเงิน';
      case 'module2': return 'เครื่องคำนวณภาษี (Tax Simulator)';
      case 'module3': return 'เครื่องคิดเลขการเงิน (TVM Calculator)';
      case 'module4': return 'วางแผนเกษียณอายุ (Retirement Planner)';
      case 'module5': return 'จำลองแผนการเงินตลอดชีพ (Capstone)';
      default: return 'The Financial Classroom';
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 h-16 flex justify-between items-center px-8 shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{getPageTitle()}</h2>
      </div>
      
      <div className="flex items-center gap-6">
        {/* ช่องค้นหา (ตกแต่ง) */}
        <div className="hidden lg:flex items-center bg-slate-100 rounded-full px-4 py-1.5 gap-2 border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <span className="material-symbols-outlined text-sm text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="ค้นหาบทเรียน..." 
            className="bg-transparent border-none text-sm focus:ring-0 outline-none w-48 text-slate-700 font-medium"
          />
        </div>

        {/* ปุ่มแจ้งเตือน */}
        <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 relative">
          <span className="material-symbols-outlined">notifications</span>
          <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
        </button>

        {/* ส่วนแสดงข้อมูลผู้ใช้งาน */}
        <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-slate-800 leading-none mb-1">
              {user ? user.name : 'แขกรับเชิญ'}
            </div>
            <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest opacity-70">
              {user ? `ID: ${user.id}` : 'GUEST'}
            </div>
          </div>
          
          {/* รูปวงกลมชื่อย่อ (ดึง 2 ตัวแรกของชื่อมาโชว์) */}
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-blue-200 border border-blue-500 cursor-pointer hover:scale-105 transition-transform">
            {user ? user.name.substring(0, 2) : '??'}
          </div>
        </div>
      </div>
    </header>
  );
}