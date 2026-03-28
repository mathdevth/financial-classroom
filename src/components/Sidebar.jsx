import React from 'react';

export default function Sidebar({ activePage, setActivePage, onLogout, user, isOpen, setIsOpen }) { 
  const menuItems = [
    { id: 'dashboard', label: 'ภาพรวมแดชบอร์ด', icon: 'grid_view' },
    { id: 'module1', label: 'โมดูล 1: รู้เท่าทันภัย', icon: 'verified_user' },
    { id: 'module2', label: 'โมดูล 2: คำนวณภาษี', icon: 'account_balance_wallet' },
    { id: 'module3', label: 'โมดูล 3: เครื่องคิดเลข TVM', icon: 'speed' },
    { id: 'module4', label: 'โมดูล 4: วางแผนเกษียณ', icon: 'auto_graph' },
    { id: 'module5', label: 'โมดูล 5: แผนตลอดชีพ', icon: 'stars' },
  ];

  return (
    <>
      {/* 📱 Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] lg:hidden transition-all duration-500"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 🏰 Main Sidebar: Deep Ocean Glass Style */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] h-full w-72 shrink-0 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        bg-[#0a0f1e]/95 backdrop-blur-3xl border-r border-white/5 shadow-[20px_0_50px_-15px_rgba(0,0,0,0.5)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      `}>
        
        {/* 💎 Premium Header Section */}
        <div className="p-10 border-b border-white/5 relative overflow-hidden">
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          <div className="absolute -top-16 -left-16 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px]"></div>
          
          <div className="relative z-10 space-y-1">
            <h1 className="text-2xl font-black text-white leading-[1.1] tracking-tighter font-sans">
              The Financial <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Classroom</span>
            </h1>
            <div className="flex items-center gap-2 pt-2">
              <span className="h-px w-4 bg-cyan-500/50"></span>
              <p className="text-[9px] text-cyan-400 uppercase tracking-[0.4em] font-black opacity-90">
                Knowledge Hub
              </p>
            </div>
          </div>
        </div>
        
        {/* 🚀 Navigation Menu */}
        <nav className="flex-1 py-8 space-y-1.5 overflow-y-auto custom-scrollbar px-5">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                if (window.innerWidth < 1024) setIsOpen(false); 
              }}
              className={`
                w-full text-left flex items-center gap-4 py-4 px-6 font-bold transition-all duration-300 rounded-[1.25rem] group relative overflow-hidden
                ${activePage === item.id 
                  ? 'bg-gradient-to-br from-white/10 to-white/[0.02] text-white shadow-lg border border-white/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }
              `}
            >
              {activePage === item.id && (
                <>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                  <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-cyan-500/10 rounded-full blur-xl" />
                </>
              )}

              <span className={`material-symbols-outlined text-2xl transition-all duration-300
                ${activePage === item.id 
                  ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' 
                  : 'text-slate-500 group-hover:text-cyan-300 group-hover:scale-110'
                }
              `}>
                {item.icon}
              </span>
              <span className={`tracking-tight text-[14.5px] transition-colors duration-300 ${activePage === item.id ? 'font-black' : 'font-bold'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* 🛠️ Footer Actions */}
        <div className="p-6 border-t border-white/5 mt-auto bg-black/40 space-y-3">
          
          {user?.role === 'teacher' && (
            <button 
              onClick={() => {
                setActivePage('admin');
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
              className={`
                flex items-center gap-4 w-full p-4 font-black rounded-2xl transition-all duration-300 shadow-xl active:scale-95 group relative overflow-hidden border
                ${activePage === 'admin'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-white/20'
                  : 'bg-white/5 border-white/5 hover:bg-white/10 text-blue-400 hover:text-white hover:border-white/10'
                }
              `}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/40 transition-colors">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
              <span className="uppercase tracking-[0.1em] text-[11px] font-black">ข้อมูลครูผู้สอน</span>
            </button>
          )}

          {/* 🚪 Logout Button: ปรับเป็นสีแดงถาวร (Rose Glass Style) */}
          <button 
            onClick={onLogout}
            className="flex items-center gap-4 w-full p-4 bg-rose-500/10 text-rose-400 font-black rounded-2xl transition-all duration-300 border border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40 shadow-lg shadow-rose-900/10 active:scale-95 group"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center group-hover:bg-rose-500/30 transition-colors">
              <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">logout</span>
            </div>
            <span className="uppercase tracking-[0.1em] text-[11px] font-black pb-0.5">ออกจากระบบ</span>
          </button>
        </div>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 3px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34, 211, 238, 0.2); }
        `}</style>
      </aside>
    </>
  );
}