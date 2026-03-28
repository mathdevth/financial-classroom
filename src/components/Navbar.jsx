import React, { useState, useEffect, useRef } from 'react';

export default function Navbar({ activePage, user, toggleMenu, setActivePage, onLogout }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  // 1. ดึงข้อมูลกิจกรรมล่าสุด
  useEffect(() => {
    const fetchNotify = async () => {
      try {
        const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getHistory&userId=${user.id}&limit=5`);
        const result = await res.json();
        if (result.status === "success") setNotifications(result.data);
      } catch (e) { console.log("Notification Fetch Error"); }
    };
    if (user) fetchNotify();
  }, [user, activePage]);

  // 2. ระบบ Search (Enter เพื่อวาร์ป)
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const q = searchQuery.toLowerCase();
      if (q.includes('ภัย') || q.includes('1')) setActivePage('module1');
      else if (q.includes('ภาษี') || q.includes('2')) setActivePage('module2');
      else if (q.includes('tvm') || q.includes('3') || q.includes('คำนวณ')) setActivePage('module3');
      else if (q.includes('เกษียณ') || q.includes('4')) setActivePage('module4');
      else if (q.includes('ชีวิต') || q.includes('5') || q.includes('มั่งคั่ง')) setActivePage('module5');
      else if (q.includes('หน้าแรก') || q.includes('สรุป')) setActivePage('dashboard');
      setSearchQuery('');
    }
  };

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard': return 'ภาพรวมการเรียนรู้';
      case 'module1': return 'รู้เท่าทันภัยทางการเงิน';
      case 'module2': return 'เครื่องคำนวณภาษี';
      case 'module3': return 'เครื่องคิดเลข TVM';
      case 'module4': return 'วางแผนเกษียณอายุ';
      case 'module5': return 'จำลองแผนการเงินตลอดชีพ';
      case 'settings': return 'ตั้งค่าข้อมูลส่วนตัว';
      default: return 'The Financial Classroom';
    }
  };

  return (
    <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-[60] border-b border-slate-200/50 h-20 flex justify-between items-center px-4 md:px-10 shadow-sm transition-all duration-500">
      
      {/* ⬅️ Left: Menu & Title */}
      <div className="flex items-center gap-6 overflow-hidden">
        <button 
          onClick={toggleMenu} 
          className="p-2.5 -ml-2 text-slate-600 hover:bg-slate-100 rounded-2xl transition-all active:scale-90"
        >
          <span className="material-symbols-outlined text-2xl font-bold">menu_open</span>
        </button>
        <div className="hidden lg:block">
          {/* ✅ ใส่ pb-1 pr-4 กันหางแหว่ง */}
          <h2 className="text-xl font-black text-slate-800 tracking-tight pb-1 pr-4 drop-shadow-sm transition-all animate-fadeIn">
            {getPageTitle()}
          </h2>
        </div>
      </div>
      
      {/* 🔍 Center: Smart Search */}
      <div className="flex-1 max-w-xs md:max-w-lg mx-6 relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-slate-400 group-focus-within:text-blue-500 transition-colors">search</span>
        </div>
        <input 
          type="text" 
          placeholder="ค้นหาบทเรียน (Enter)..." 
          className="w-full bg-slate-100/80 border border-transparent rounded-[1.25rem] py-3 pl-12 pr-6 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-200 transition-all outline-none shadow-inner"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      {/* ➡️ Right: Notification & Profile */}
      <div className="flex items-center gap-3 md:gap-5 shrink-0 relative">
        
        {/* 🔔 Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => { setIsBellOpen(!isBellOpen); setIsProfileOpen(false); }}
            className={`p-3 rounded-2xl transition-all relative ${isBellOpen ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
          >
            <span className="material-symbols-outlined text-2xl">notifications</span>
            {notifications.length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
            )}
          </button>

          {isBellOpen && (
            <div className="absolute right-0 mt-4 w-72 md:w-96 bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-fadeIn py-2 border-t-4 border-t-blue-500">
              <div className="px-7 py-5 border-b border-slate-50 flex justify-between items-center">
                <span className="font-black text-xs text-slate-400 uppercase tracking-[0.2em]">กิจกรรมล่าสุด</span>
                <span className="text-[10px] bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-black uppercase">Live</span>
              </div>
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? notifications.map((n, i) => (
                  <div key={i} className="px-7 py-5 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0 group cursor-default">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-xl">history</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-slate-700 leading-tight line-clamp-1">{n.module}</p>
                        <p className="text-[11px] text-slate-400 font-bold tracking-tight">{n.date}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-16 text-center">
                    <span className="material-symbols-outlined text-slate-200 text-5xl mb-3">cloud_off</span>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">ไม่มีกิจกรรมใหม่</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 👤 Profile Area */}
        <div className="relative ml-2">
          <button 
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsBellOpen(false); }}
            className={`flex items-center gap-3 p-1.5 pr-4 rounded-full border transition-all active:scale-95 shadow-sm
              ${isProfileOpen ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-lg border-2 border-white/20 shrink-0 uppercase">
              {user ? user.name.substring(0, 2) : '??'}
            </div>
            <div className="text-left hidden sm:block">
              <p className={`text-[9px] font-black leading-none uppercase mb-1 ${isProfileOpen ? 'text-blue-300' : 'text-blue-600'}`}>
                {user?.role || 'STUDENT'}
              </p>
              <p className={`text-[13px] font-black truncate max-w-[80px] ${isProfileOpen ? 'text-white' : 'text-slate-700'}`}>
                {user?.name.split(' ')[0]}
              </p>
            </div>
            <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isProfileOpen ? 'rotate-180 text-blue-300' : 'text-slate-400'}`}>
              expand_more
            </span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-4 w-64 bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 p-3 animate-fadeIn border-t-4 border-t-slate-800">
              <div className="p-5 mb-3 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">ล็อกอินเป็น</p>
                <p className="text-sm font-black text-slate-800 truncate">{user?.name}</p>
                <p className="text-[11px] font-bold text-blue-600 mt-1">โรงเรียนวังโพรงพิทยาคม</p>
              </div>
              
              <button 
                onClick={() => { setActivePage('settings'); setIsProfileOpen(false); }}
                className="w-full flex items-center gap-4 p-4 text-sm font-black text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all group"
              >
                <span className="material-symbols-outlined text-xl group-hover:rotate-45 transition-transform duration-300 text-slate-400 group-hover:text-blue-500">settings</span>
                แก้ไขโปรไฟล์
              </button>

              <div className="h-px bg-slate-100 mx-4 my-2"></div>
              
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-4 p-4 text-sm font-black text-rose-500 hover:bg-rose-50 rounded-2xl transition-all group"
              >
                <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform text-rose-400 group-hover:text-rose-600">logout</span>
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </header>
  );
}