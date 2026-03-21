import React from 'react';

// เติม onLogout เข้าไปใน { } ตรงนี้ครับ เพื่อรับคำสั่งมาจาก App.jsx
export default function Sidebar({ activePage, setActivePage, onLogout }) { 
  const menuItems = [
    { id: 'dashboard', label: 'ภาพรวมแดชบอร์ด', icon: 'dashboard' },
    { id: 'module1', label: 'โมดูล 1: รู้เท่าทันภัย', icon: 'security' },
    { id: 'module2', label: 'โมดูล 2: คำนวณภาษี', icon: 'receipt_long' },
    { id: 'module3', label: 'โมดูล 3: เครื่องคิดเลข TVM', icon: 'calculate' },
    { id: 'module4', label: 'โมดูล 4: วางแผนเกษียณ', icon: 'elderly' },
    { id: 'module5', label: 'โมดูล 5: แผนตลอดชีพ', icon: 'emoji_events' },
  ];

  return (
    <aside className="w-72 bg-slate-900 text-white hidden md:flex flex-col h-screen sticky top-0 shrink-0 shadow-xl z-40">
      <div className="p-8 border-b border-slate-800 relative">
        <h1 className="text-xl font-black text-white leading-tight">The Financial Classroom</h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">คลังความรู้การเงิน</p>
        
        {/* ของตกแต่งเล็กน้อย */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-xl"></div>
      </div>
      
      <nav className="flex-1 py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full text-left flex items-center gap-3 py-3 px-8 transition-all duration-200 font-bold ${
              activePage === item.id 
                ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-500 shadow-inner' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-4 border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ส่วนท้ายเมนู: ปุ่มออกจากระบบ */}
      <div className="p-8 border-t border-slate-800 mt-auto bg-slate-950/50">
        <button 
          onClick={onLogout} // <--- เติม onClick={onLogout} เข้าไปตรงนี้ครับ!
          className="flex items-center gap-3 w-full p-4 bg-slate-800 hover:bg-red-500/10 text-slate-500 hover:text-red-400 font-bold rounded-xl transition-all duration-200 shadow-md active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span className="font-bold uppercase tracking-widest text-xs">ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}