import React, { useState, useEffect } from 'react';

export default function AdminDashboard({ user }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // ⚠️ วาง URL ของ Google Apps Script ของคุณครู
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // ✅ ส่งชื่อโรงเรียนของครูไปให้ระบบคัดกรองข้อมูลนักเรียน
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getAdminData&school=${encodeURIComponent(user.school)}`);
      const result = await response.json();
      
      if (result.status === "success") {
        // ประมวลผลข้อมูล: คำนวณว่าเด็กเรียนจบไปกี่โมดูลแล้ว
        const processedData = result.data.map(std => {
          const completedModules = [...new Set(std.history.map(h => h.module))];
          return {
            ...std,
            progressCount: completedModules.length,
            progressPercent: Math.round((completedModules.length / 5) * 100),
            lastActive: std.history.length > 0 ? std.history[std.history.length - 1].date : 'ยังไม่เคยเข้าเรียน'
          };
        });
        setStudents(processedData);
      }
    } catch (err) {
      console.error("Fetch Admin Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // โหลดข้อมูลก็ต่อเมื่อเป็นครูเท่านั้น
    if (user?.role === 'teacher') {
      fetchAdminData();
    }
  }, [user]);

  // 🔒 ระบบป้องกัน: ล็อกไม่ให้เด็กเข้า (เช็กจากสิทธิ์ role)
  if (user?.role !== "teacher") {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-slate-500 space-y-4 animate-fadeIn">
        <span className="material-symbols-outlined text-7xl text-red-300">gavel</span>
        <h2 className="text-2xl font-black text-slate-700">พื้นที่สงวนสิทธิ์เฉพาะครูผู้สอน</h2>
        <p>บัญชีของคุณไม่มีสิทธิ์เข้าถึงข้อมูลส่วนนี้ครับ</p>
      </div>
    );
  }

  // สถิติภาพรวม
  const totalStudents = students.length;
  const completedAll = students.filter(s => s.progressPercent === 100).length;
  const activeStudents = students.filter(s => s.progressCount > 0).length;

  // ระบบค้นหา
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen font-sans animate-fadeIn">
      
      {/* Header */}
      <section className="bg-slate-900 p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <span className="material-symbols-outlined text-4xl">admin_panel_settings</span>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">ระบบจัดการสำหรับครู</h2>
            {/* ✅ แสดงชื่อโรงเรียนที่ครูสังกัดอยู่ */}
            <p className="text-indigo-300 font-bold text-sm md:text-base mt-1">
              ข้อมูลนักเรียน: {user.school}
            </p>
          </div>
        </div>
        <button onClick={fetchAdminData} disabled={loading} className="relative z-10 w-full md:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-white/20 backdrop-blur-md">
          <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>sync</span>
          {loading ? 'กำลังดึงข้อมูล...' : 'รีเฟรชข้อมูล'}
        </button>
      </section>

      {/* สถิติสรุป (Stats Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl"><span className="material-symbols-outlined">group</span></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">นักเรียนในระบบ</p><h3 className="text-3xl font-black text-slate-800">{totalStudents} <span className="text-sm font-bold text-slate-400">คน</span></h3></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-2xl"><span className="material-symbols-outlined">emoji_events</span></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">เรียนจบครบ 5 โมดูล</p><h3 className="text-3xl font-black text-slate-800">{completedAll} <span className="text-sm font-bold text-slate-400">คน</span></h3></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center text-2xl"><span className="material-symbols-outlined">local_fire_department</span></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">กำลังเข้าเรียน (Active)</p><h3 className="text-3xl font-black text-slate-800">{activeStudents} <span className="text-sm font-bold text-slate-400">คน</span></h3></div>
        </div>
      </div>

      {/* ตารางรายชื่อนักเรียน */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-500">format_list_bulleted</span> ข้อมูลนักเรียนรายบุคคล
          </h3>
          <div className="flex items-center bg-white rounded-xl px-4 py-2 border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-100 w-full sm:w-64 shadow-inner">
            <span className="material-symbols-outlined text-slate-400 text-sm mr-2">search</span>
            <input 
              type="text" placeholder="ค้นหาชื่อ หรือ ID..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none outline-none text-sm w-full font-bold text-slate-600 bg-transparent"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0 shadow-sm z-10">
              <tr>
                <th className="p-5 border-b">รหัส / ชื่อ-สกุล</th>
                <th className="p-5 border-b">ความคืบหน้าภาพรวม</th>
                <th className="p-5 border-b text-center">ใช้งานล่าสุด</th>
                <th className="p-5 border-b text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(std => (
                  <tr key={std.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-5">
                      <div className="font-black text-slate-800 text-base">{std.name}</div>
                      <div className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">ID: {std.id}</div>
                    </td>
                    <td className="p-5 w-48 sm:w-64">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-400">ผ่าน {std.progressCount}/5 โมดูล</span>
                        <span className="text-xs font-black text-indigo-600">{std.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${std.progressPercent === 100 ? 'bg-green-500' : 'bg-indigo-500'}`} 
                          style={{ width: `${std.progressPercent}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="p-5 text-center text-xs font-bold text-slate-500">{std.lastActive}</td>
                    <td className="p-5 text-center">
                      <button 
                        className="px-4 py-2 bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all"
                        onClick={() => alert(`📌 ประวัติล่าสุดของ ${std.name}:\n\n${std.history.length > 0 ? std.history.slice(-5).reverse().map(h => `[${h.module}] ${h.detail}`).join('\n') : 'ยังไม่มีประวัติ'}`)}
                      >
                        ดูข้อมูล
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="p-10 text-center text-slate-400 font-bold italic">ไม่พบข้อมูลนักเรียน (หรือกำลังโหลด)</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}