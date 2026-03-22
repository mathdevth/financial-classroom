import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminDashboard({ user }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getAdminData&school=${encodeURIComponent(user.school)}&t=${new Date().getTime()}`);
      const result = await response.json();
      
      if (result.status === "success") {
        const processedData = result.data.map(std => {
          const completedModules = [...new Set(std.history.map(h => h.module))];
          return {
            ...std,
            progressCount: completedModules.length,
            progressPercent: Math.round((completedModules.length / 5) * 100),
            lastActive: std.history.length > 0 ? std.history[0].date : 'ยังไม่เคยเข้าเรียน'
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
    if (user?.role === 'teacher') fetchAdminData();
  }, [user]);

  // --- 📈 ส่วนที่ 1: วิเคราะห์ข้อมูลสำหรับกราฟ (Class Analytics) ---
  const getAnalyticsData = () => {
    const modules = [
      { id: 'Module 1', short: 'ด่าน 1', full: 'รู้เท่าทันภัย' },
      { id: 'Module 2', short: 'ด่าน 2', full: 'คำนวณภาษี' },
      { id: 'Module 3', short: 'ด่าน 3', full: 'เครื่องคิดเลข TVM' },
      { id: 'Module 4', short: 'ด่าน 4', full: 'แผนเกษียณ' },
      { id: 'Module 5', short: 'ด่าน 5', full: 'แผนตลอดชีพ' },
    ];

    return modules.map(m => {
      const passedCount = students.filter(s => 
        s.history.some(h => h.module && h.module.includes(m.id))
      ).length;
      return { name: m.short, full: m.full, count: passedCount };
    });
  };

  // --- 📊 ส่วนที่ 2: ฟังก์ชันส่งออกข้อมูล (Data Export) ---
  const exportToCSV = () => {
    // หัวตาราง
    const headers = ["ID", "Name", "School", "Modules Completed", "Progress (%)", "Last Active"];
    
    // ข้อมูลนักเรียน
    const rows = students.map(s => [
      s.id,
      s.name,
      user.school,
      s.progressCount,
      s.progressPercent,
      s.lastActive
    ]);

    // สร้างเนื้อหา CSV (ใส่ BOM เพื่อให้ Excel อ่านภาษาไทยออก)
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `รายงานผลการเรียน_${user.school}_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (user?.role !== "teacher") {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-slate-500 space-y-4 animate-fadeIn">
        <span className="material-symbols-outlined text-7xl text-red-300">gavel</span>
        <h2 className="text-2xl font-black text-slate-700">พื้นที่สงวนสิทธิ์เฉพาะครูผู้สอน</h2>
        <p>บัญชีของคุณไม่มีสิทธิ์เข้าถึงข้อมูลส่วนนี้ครับ</p>
      </div>
    );
  }

  const analyticsData = getAnalyticsData();
  const avgProgress = students.length > 0 
    ? Math.round(students.reduce((acc, curr) => acc + curr.progressPercent, 0) / students.length) 
    : 0;

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
            <span className="material-symbols-outlined text-4xl">analytics</span>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Analytics Dashboard</h2>
            <p className="text-indigo-300 font-bold text-sm md:text-base mt-1">
              โรงเรียน: {user.school}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full md:w-auto">
          {/* ✅ ปุ่มส่งออกข้อมูล */}
          <button 
            onClick={exportToCSV}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
          >
            <span className="material-symbols-outlined">download</span>
            ส่งออกไฟล์ CSV
          </button>
          
          <button onClick={fetchAdminData} disabled={loading} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-white/20 backdrop-blur-md active:scale-95">
            <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>sync</span>
            {loading ? 'กำลังดึงข้อมูล...' : 'รีเฟรช'}
          </button>
        </div>
      </section>

      {/* Stats & Class Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* กราฟแท่งแสดงผลงานรายด่าน */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-500">bar_chart</span>
            จำนวนนักเรียนที่ผ่านในแต่ละโมดูล
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 'bold', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 'bold'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                  formatter={(value) => [`${value} คน`, 'จำนวนผู้ผ่าน']}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                  {analyticsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* การ์ดสถิติเล็ก */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-indigo-100 font-bold text-xs uppercase tracking-widest mb-1">ความคืบหน้าเฉลี่ยทั้งโรงเรียน</p>
              <h3 className="text-5xl font-black">{avgProgress}%</h3>
              <div className="mt-4 w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div className="bg-white h-full" style={{width: `${avgProgress}%`}}></div>
              </div>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10">grade</span>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><span className="material-symbols-outlined">group</span></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">นร. ทั้งหมด</p>
                <h4 className="text-2xl font-black text-slate-800">{students.length} คน</h4>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"><span className="material-symbols-outlined">verified</span></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">นร. ที่เรียนจบ 100%</p>
                <h4 className="text-2xl font-black text-slate-800">{students.filter(s => s.progressPercent === 100).length} คน</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ตารางรายชื่อนักเรียน (คงเดิมแต่ปรับ UI นิดหน่อย) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-500">person_search</span> รายชื่อนักเรียนและประวัติการเรียน
          </h3>
          <div className="flex items-center bg-white rounded-xl px-4 py-2 border border-slate-200 w-full sm:w-64 shadow-inner">
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
                <th className="p-5 border-b">ข้อมูลนักเรียน</th>
                <th className="p-5 border-b">ความคืบหน้า</th>
                <th className="p-5 border-b text-center">เข้าเรียนล่าสุด</th>
                <th className="p-5 border-b text-center">รายละเอียด</th>
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
                        <span className="text-[10px] font-bold text-slate-400">{std.progressCount}/5 ด่าน</span>
                        <span className="text-xs font-black text-indigo-600">{std.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${std.progressPercent === 100 ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ width: `${std.progressPercent}%` }}></div>
                      </div>
                    </td>
                    <td className="p-5 text-center text-xs font-bold text-slate-500">{std.lastActive}</td>
                    <td className="p-5 text-center">
                      <button 
                        className="px-4 py-2 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded-xl text-[10px] font-black tracking-widest uppercase transition-all active:scale-95"
                        onClick={() => alert(`📌 ข้อมูลของ ${std.name}:\n\n${std.history.length > 0 ? std.history.map(h => `[${h.date}] ${h.module}: ${h.detail}`).join('\n') : 'ไม่มีข้อมูล'}`)}
                      >
                        เปิดดู
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="p-10 text-center text-slate-400 font-bold italic">ไม่พบข้อมูลนักเรียนในโรงเรียนนี้</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}