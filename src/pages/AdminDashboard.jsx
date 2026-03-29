import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminDashboard({ user }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // ✅ State สำหรับควบคุม Modal ดูรายละเอียดนักเรียน
  const [selectedStudent, setSelectedStudent] = useState(null);

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

  const exportToCSV = () => {
    const headers = ["ID", "Name", "School", "Modules Completed", "Progress (%)", "Last Active"];
    const rows = students.map(s => [s.id, s.name, user.school, s.progressCount, s.progressPercent, s.lastActive]);
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

  // ✅ ฟังก์ชันช่วยแปลงข้อมูล JSON ยาวๆ ให้ดูอ่านง่ายขึ้นใน Modal
  const formatDetail = (detail) => {
    try {
      if (typeof detail === 'string' && detail.startsWith('{')) {
        const obj = JSON.parse(detail);
        return Object.entries(obj)
          .filter(([key, value]) => value !== 0 && value !== "") // ซ่อนค่าว่าง
          .map(([key, value]) => {
            // แปลงคีย์ให้สวยงาม (ถ้าต้องการ) หรือแค่โชว์ค่า
            const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
            return <span key={key} className="inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs mr-2 mb-2 font-bold">{key}: {formattedValue}</span>;
          });
      }
      return <span className="text-slate-600 text-sm font-bold">{detail}</span>;
    } catch (e) {
      return <span className="text-slate-600 text-sm font-bold">{detail}</span>;
    }
  };

  if (user?.role !== "teacher") {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[600px] text-slate-500 space-y-6 animate-fadeIn">
        <div className="w-24 h-24 bg-rose-50 text-rose-400 rounded-[2rem] flex items-center justify-center shadow-inner">
           <span className="material-symbols-outlined text-5xl">gavel</span>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight pb-2">พื้นที่สงวนสิทธิ์เฉพาะครูผู้สอน</h2>
          <p className="font-bold opacity-60">บัญชีของคุณไม่มีสิทธิ์เข้าถึงข้อมูลวิเคราะห์ส่วนนี้ครับ</p>
        </div>
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
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-10 font-sans animate-fadeIn relative overflow-hidden">
      
      {/* 🔮 Background Decor */}
      <div className="absolute top-0 right-0 w-[45rem] h-[45rem] bg-indigo-100/40 rounded-full blur-[120px] -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] bg-blue-50/60 rounded-full blur-[100px] -ml-48 -mb-48"></div>

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* 💎 Header Section: Snowy Glass Style */}
        <section className="bg-white/60 backdrop-blur-2xl p-10 rounded-[3rem] border border-white shadow-xl shadow-slate-200/50 flex flex-col lg:flex-row justify-between items-center gap-8 overflow-hidden">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl flex items-center justify-center text-white text-5xl shadow-xl shadow-indigo-500/20 group hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-5xl">analytics</span>
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-800 tracking-tight pb-2 pr-4 leading-tight">Class Analytics</h2>
              <p className="text-slate-500 font-bold italic flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">school</span> 
                {user.school}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 w-full lg:w-auto">
            <button onClick={exportToCSV} className="flex-1 lg:flex-none px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-3 active:scale-95">
              <span className="material-symbols-outlined">download</span> ส่งออก CSV
            </button>
            <button onClick={fetchAdminData} disabled={loading} className="flex-1 lg:flex-none px-8 py-4 bg-white border border-slate-200 text-slate-700 font-black rounded-2xl shadow-sm hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-3">
              <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>sync</span>
              {loading ? 'Updating...' : 'รีเฟรชข้อมูล'}
            </button>
          </div>
        </section>

        {/* 📊 Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Bar Chart Section */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl p-10 rounded-[3.5rem] shadow-2xl shadow-slate-200/40 border border-white h-full">
            <div className="flex items-center gap-3 mb-10 border-b border-slate-50 pb-6">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                 <span className="material-symbols-outlined">bar_chart</span>
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">สถิติการผ่านรายโมดูล</h3>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: '900', fontSize: 11}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 'bold'}} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'black'}}
                    formatter={(value) => [`${value} คน`, 'จำนวนผู้ผ่าน']}
                  />
                  <Bar dataKey="count" radius={[12, 12, 4, 4]} barSize={45}>
                    {analyticsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#a5b4fc'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats Column */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-[60px]"></div>
              <p className="text-indigo-100 font-black text-[11px] uppercase tracking-[0.3em] mb-3 opacity-80">School Average Progress</p>
              <h3 className="text-7xl font-black tracking-tighter pb-4 pr-12 leading-none">{avgProgress}%</h3>
              <div className="mt-6 w-full bg-white/20 h-4 rounded-full overflow-hidden p-1">
                <div className="bg-white h-full rounded-full shadow-lg transition-all duration-1000" style={{width: `${avgProgress}%`}}></div>
              </div>
              <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[10rem] opacity-5 rotate-12">auto_graph</span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <QuickStatCard label="นักเรียนทั้งหมด" value={students.length} unit="คน" icon="group" color="blue" />
              <QuickStatCard label="เรียนจบ 100%" value={students.filter(s => s.progressPercent === 100).length} unit="คน" icon="verified_user" color="emerald" />
            </div>
          </div>
        </div>

        {/* 📑 Student List Table Section */}
        <div className="bg-white/90 backdrop-blur-2xl rounded-[3.5rem] border border-white shadow-2xl overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                 <span className="material-symbols-outlined">person_search</span>
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">รายชื่อนักเรียนและผลการเรียน</h3>
            </div>
            
            <div className="flex items-center bg-white rounded-2xl px-5 py-3 border border-slate-200 w-full sm:w-80 shadow-inner group focus-within:border-indigo-300 transition-all">
              <span className="material-symbols-outlined text-slate-400 text-xl mr-3 group-focus-within:text-indigo-500">search</span>
              <input 
                type="text" placeholder="ค้นหาชื่อ หรือ ID นักเรียน..." 
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="border-none outline-none text-sm w-full font-bold text-slate-700 bg-transparent placeholder:text-slate-300"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sticky top-0 shadow-sm z-20">
                <tr>
                  <th className="px-10 py-6">Student Info</th>
                  <th className="px-10 py-6">Overall Progress</th>
                  <th className="px-10 py-6 text-center">Last Active</th>
                  <th className="px-10 py-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(std => (
                    <tr key={std.id} className="hover:bg-indigo-50/20 transition-all group">
                      <td className="px-10 py-6">
                        <div className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{std.name}</div>
                        <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-1">ID: {std.id}</div>
                      </td>
                      <td className="px-10 py-6 w-72">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase">{std.progressCount} / 5 Modules</span>
                          <span className="text-sm font-black text-indigo-600">{std.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5">
                          <div className={`h-full rounded-full transition-all duration-700 shadow-sm ${std.progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${std.progressPercent}%` }}></div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center text-xs font-black text-slate-500">{std.lastActive}</td>
                      <td className="px-10 py-6 text-center">
                        <button 
                          className="px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-[10px] font-black tracking-widest uppercase transition-all active:scale-95 shadow-md"
                          onClick={() => setSelectedStudent(std)} // ✅ เปลี่ยนจาก alert เป็นการเปิด Modal
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="p-20 text-center text-slate-300 font-black uppercase tracking-widest italic">No students found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ Premium Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedStudent(null)}></div>
          <div className="bg-white rounded-[3rem] w-full max-w-3xl max-h-[85vh] flex flex-col relative z-10 shadow-2xl animate-fadeIn">
            
            <div className="flex justify-between items-center p-8 border-b border-slate-100 bg-slate-50/50 rounded-t-[3rem]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">account_circle</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 leading-tight">{selectedStudent.name}</h3>
                  <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">ID: {selectedStudent.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
              {selectedStudent.history && selectedStudent.history.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-slate-100">
                  {selectedStudent.history.map((record, index) => (
                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-indigo-100 text-indigo-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-md z-10">
                        <span className="material-symbols-outlined text-xl">history_edu</span>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow hover:border-indigo-100 group-hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{record.date}</span>
                        </div>
                        <h4 className="text-base font-black text-slate-800 mb-3">{record.module}</h4>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          {formatDetail(record.detail)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-4xl">folder_off</span>
                  </div>
                  <div>
                    <p className="text-xl font-black text-slate-500">ไม่มีประวัติการบันทึก</p>
                    <p className="text-sm font-bold text-slate-400">นักเรียนคนนี้ยังไม่ได้เริ่มทำกิจกรรมใดๆ</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-[3rem] text-center">
              <button onClick={() => setSelectedStudent(null)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black shadow-md hover:bg-indigo-600 transition-colors active:scale-95">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ✅ Sub-component for Quick Stats
function QuickStatCard({ label, value, unit, icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600'
  };
  return (
    <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[3rem] shadow-xl border border-white flex items-center gap-6 group hover:scale-[1.02] transition-all duration-500">
      <div className={`w-16 h-16 ${colors[color]} rounded-2xl flex items-center justify-center shadow-inner shrink-0`}>
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{value} <span className="text-sm text-slate-400">{unit}</span></h4>
      </div>
    </div>
  );
}