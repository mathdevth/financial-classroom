import React, { useState, useEffect, useRef } from 'react';

// ✅ รับ setActivePage เพื่อใช้ในการวาร์ปไปหน้าต่างๆ และ onLogout สำหรับการออกจากระบบ
export default function Navbar({ activePage, user, toggleMenu, setActivePage, onLogout }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  // 1. ดึงข้อมูลกิจกรรมล่าสุดมาโชว์ในกระดิ่ง (Notification)
  useEffect(() => {
    const fetchNotify = async () => {
      try {
        const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getHistory&userId=${user.id}&limit=5`);
        const result = await res.json();
        if (result.status === "success") {
          setNotifications(result.data);
        }
      } catch (e) {
        console.log("Notification Fetch Error");
      }
    };
    if (user) fetchNotify();
  }, [user, activePage]); // อัปเดตเมื่อมีการเปลี่ยนหน้า

  // 2. ระบบ Search (กด Enter เพื่อวาร์ป)
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const q = searchQuery.toLowerCase();
      // ค้นหาตาม Keyword หรือหมายเลขโมดูล
      if (q.includes('ภัย') || q.includes('1')) setActivePage('module1');
      else if (q.includes('ภาษี') || q.includes('2')) setActivePage('module2');
      else if (q.includes('tvm') || q.includes('3') || q.includes('คำนวณ')) setActivePage('module3');
      else if (q.includes('เกษียณ') || q.includes('4')) setActivePage('module4');
      else if (q.includes('ชีวิต') || q.includes('5') || q.includes('มั่งคั่ง')) setActivePage('module5');
      else if (q.includes('หน้าแรก') || q.includes('สรุป')) setActivePage('dashboard');
      
      setSearchQuery(''); // ล้างช่องค้นหาหลังกด
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
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 h-16 flex justify-between items-center px-4 md:px-8 shadow-sm">
      
      {/* ส่วนซ้าย: Menu & Title */}
      <div className="flex items-center gap-4 overflow-hidden">
        <button onClick={toggleMenu} className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="text-lg font-extrabold text-slate-800 truncate hidden sm:block">
          {getPageTitle()}
        </h2>
      </div>
      
      {/* ส่วนกลาง: Search Bar (Smart Search) */}
      <div className="flex-1 max-w-xs md:max-w-md mx-4 relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
        <input 
          type="text" 
          placeholder="ค้นหาบทเรียน (Enter เพื่อไป)..." 
          className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-xs md:text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      {/* ส่วนขวา: Notification & Profile */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0 relative">
        
        {/* กระดิ่งแจ้งเตือน (Dropdown) */}
        <div className="relative">
          <button 
            onClick={() => { setIsBellOpen(!isBellOpen); setIsProfileOpen(false); }}
            className={`p-2 rounded-full transition-all relative ${isBellOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <span className="material-symbols-outlined">notifications</span>
            {notifications.length > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
          </button>

          {isBellOpen && (
            <div className="absolute right-0 mt-3 w-72 md:w-80 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn py-2">
              <div className="px-5 py-3 border-b border-slate-50 flex justify-between items-center">
                <span className="font-black text-xs text-slate-400 uppercase tracking-widest">กิจกรรมล่าสุด</span>
                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">New</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? notifications.map((n, i) => (
                  <div key={i} className="px-5 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group cursor-default">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-sm">history</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-700 leading-tight line-clamp-1">{n.module}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{n.date}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-10 text-center text-slate-400 text-xs font-bold italic">ไม่มีกิจกรรมใหม่</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* โปรไฟล์ผู้ใช้งาน (Dropdown) */}
        <div className="relative ml-2">
          <button 
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsBellOpen(false); }}
            className="flex items-center gap-2 p-1 pr-3 bg-slate-50 rounded-full border border-slate-100 hover:border-blue-200 transition-all active:scale-95"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xs font-black shadow-md border border-blue-500 shrink-0">
              {user ? user.name.substring(0, 2) : '??'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[10px] font-black text-blue-600 leading-none uppercase mb-0.5">{user?.role || 'User'}</p>
              <p className="text-xs font-bold text-slate-700 line-clamp-1">คุณ{user?.name.split(' ')[0]}</p>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 p-2 animate-fadeIn">
              <div className="p-3 mb-2 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">ล็อกอินเป็น</p>
                <p className="text-xs font-bold text-slate-700 truncate">{user?.name}</p>
              </div>
              
              <button 
                onClick={() => { setActivePage('settings'); setIsProfileOpen(false); }}
                className="w-full flex items-center gap-3 p-3 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all group"
              >
                <span className="material-symbols-outlined text-lg group-hover:rotate-45 transition-transform">settings</span>
                แก้ไขโปรไฟล์
              </button>

              <div className="h-px bg-slate-100 my-2"></div>
              
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 p-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}