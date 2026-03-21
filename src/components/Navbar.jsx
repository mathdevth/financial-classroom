import React from 'react';

export default function Navbar({ activePage }) {
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
        <h2 className="text-xl font-extrabold text-slate-800">{getPageTitle()}</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center bg-slate-100 rounded-full px-4 py-1.5 gap-2 border border-slate-200">
          <span className="material-symbols-outlined text-sm text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="ค้นหาบทเรียน..." 
            className="bg-transparent border-none text-sm focus:ring-0 outline-none w-48 text-slate-700"
          />
        </div>
        <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md cursor-pointer">
          อช
        </div>
      </div>
    </header>
  );
}