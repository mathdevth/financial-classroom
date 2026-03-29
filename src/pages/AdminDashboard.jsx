import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminDashboard({ user }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('2569');
  const [filterSemester, setFilterSemester] = useState('1');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  // 📝 พจนานุกรมแปลภาษาไทยฉบับสมบูรณ์ (ครอบคลุมทุก Module)
  const labelMap = {
    // 🏦 Module 3, 4, 5 (General & Wealth)
    inputs: 'ข้อมูลนำเข้า', amount: 'จำนวนเงิน', rate: 'ดอกเบี้ย/ผลตอบแทน', years: 'ระยะเวลา (ปี)',
    everyXMonths: 'คิดดอกทุกๆ (เดือน)', calcType: 'ประเภทคำนวณ', currentAge: 'อายุปัจจุบัน',
    retireAge: 'อายุเกษียณ', lifeExpectancy: 'อายุขัย', monthlyExpense: 'รายจ่ายต่อเดือน',
    startingSalary: 'เงินเดือนเริ่มต้น', salaryIncrease: 'เงินเดือนขึ้น (%/ปี)',
    yearsToSimulate: 'ระยะเวลาจำลอง (ปี)', totalWealth: 'ความมั่งคั่งรวม',
    monthlySavingNeeded: 'ต้องออมต่อเดือน', targetFund: 'เป้าหมายเงินเกษียณ',
    monthlyLate: 'หากเริ่มช้า (ต่อเดือน)', costMultiplier: 'ภาระเพิ่มขึ้น (เท่า)',
    isCalculated: 'สถานะการคำนวณ',
    
    // 🍕 สัดส่วนเงิน (Allocations)
    allocations: 'สัดส่วนเงิน', emergency: 'เงินสำรอง', wealth: 'พอร์ตลงทุน', happiness: 'เงินใช้สอย',
    
    // 🧮 ประเภท TVM
    FV_SINGLE: 'เงินก้อนเดียว', PV_SINGLE: 'หาเงินต้นที่ต้องใช้', FVA_ORD: 'ออมรายงวด', FVA_DUE: 'ออมรายงวด (ต้นงวด)',

    // 📑 Module 2: ภาษี (รายได้)
    m40_1: '40(1) เงินเดือน', m40_2: '40(2) งานอิสระ', m40_3: '40(3) ค่าลิขสิทธิ์', m40_4: '40(4) ดอกเบี้ย/ปันผล',
    m40_5: '40(5) ค่าเช่า', m40_6: '40(6) วิชาชีพพิเศษ', m40_7: '40(7) รับเหมา', m40_8: '40(8) อื่นๆ/ขายของ',
    
    // 👨‍👩‍👧‍👦 Module 2: ภาษี (ลดหย่อน)
    spouse: 'คู่สมรส (ไม่มีรายได้)', parentsCount: 'พ่อแม่ (60 ปี+)', childrenOld: 'ลูก(คนแรก)', childrenNew: 'ลูก(คนที่ 2+)',
    lifeInsurance: 'ประกันชีวิต', healthInsurance: 'ประกันสุขภาพ', socialSecurity: 'ประกันสังคม',
    rmf: 'กองทุน RMF', ssf: 'กองทุน SSF', pension: 'ประกันบำนาญ', donationGeneral: 'บริจาคทั่วไป',
    donationEdu: 'บริจาคการศึกษา', homeLoanInterest: 'ดอกเบี้ยบ้าน',
    taxToPay: 'ภาษีที่ต้องจ่าย', incomes: 'รายได้รวม', deductions: 'ลดหย่อนรวม'
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getAdminData&school=${encodeURIComponent(user.school)}&t=${Date.now()}`);
      const result = await response.json();
      if (result.status === "success") {
        setStudents(result.data.map(std => ({
          ...std,
          progressCount: [...new Set(std.history.map(h => h.module))].length,
          progressPercent: Math.round((([...new Set(std.history.map(h => h.module))].length) / 5) * 100),
          lastActive: std.history.length > 0 ? std.history[0].date : 'ยังไม่เคยเข้าเรียน'
        })));
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { if (user?.role === 'teacher') fetchAdminData(); }, [user]);

  const handleDeleteStudent = async (studentId, studentName) => {
    if (window.confirm(`⚠️ ลบข้อมูลของ "${studentName}"?\nข้อมูลทั้งหมดจะหายไปและกู้คืนไม่ได้`)) {
      try {
        await fetch(GOOGLE_SCRIPT_URL, { method: "POST", mode: "no-cors", body: JSON.stringify({ action: "deleteStudent", userId: studentId }) });
        alert("ลบข้อมูลสำเร็จ"); fetchAdminData();
      } catch (e) { alert("เกิดข้อผิดพลาด"); }
    }
  };

  const handleEditName = async (studentId, oldName) => {
    const newName = prompt(`แก้ไขชื่อ ID: ${studentId}`, oldName);
    if (newName && newName !== oldName) {
      try {
        await fetch(GOOGLE_SCRIPT_URL, { method: "POST", mode: "no-cors", body: JSON.stringify({ action: "updateStudentName", userId: studentId, newName }) });
        alert("อัปเดตชื่อสำเร็จ"); fetchAdminData();
      } catch (e) { alert("เกิดข้อผิดพลาด"); }
    }
  };

  const filteredStudents = students.filter(s => 
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.includes(searchTerm)) &&
    (String(s.year || '2569') === filterYear) && (String(s.semester || '1') === filterSemester)
  );

  const analyticsData = [
    { name: 'ด่าน 1', count: filteredStudents.filter(s => s.history.some(h => h.module.includes("Module 1"))).length },
    { name: 'ด่าน 2', count: filteredStudents.filter(s => s.history.some(h => h.module.includes("Module 2"))).length },
    { name: 'ด่าน 3', count: filteredStudents.filter(s => s.history.some(h => h.module.includes("Module 3"))).length },
    { name: 'ด่าน 4', count: filteredStudents.filter(s => s.history.some(h => h.module.includes("Module 4"))).length },
    { name: 'ด่าน 5', count: filteredStudents.filter(s => s.history.some(h => h.module.includes("Module 5"))).length },
  ];

  const avgProgress = filteredStudents.length > 0 ? Math.round(filteredStudents.reduce((acc, curr) => acc + curr.progressPercent, 0) / filteredStudents.length) : 0;

  // ✅ ฟังก์ชันจัดรูปแบบภาษาไทย (แก้บัคคำแปล และค่า Boolean)
  const formatDetail = (detail) => {
    try {
      if (typeof detail === 'string' && detail.startsWith('{')) {
        const obj = JSON.parse(detail);
        const badges = [];
        const flatten = (data) => {
          Object.entries(data).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) flatten(value); 
            else if (value !== "" && value !== null) {
              // 1. แปลงค่าการแสดงผล (Value)
              let displayVal = value;
              if (typeof value === 'boolean') displayVal = value ? 'ใช่/สำเร็จ' : 'ไม่ใช่/ไม่มี';
              else if (typeof value === 'number') displayVal = value.toLocaleString();
              else displayVal = labelMap[value] || value;

              // 2. แปลงหัวข้อ (Key)
              const cleanKey = key.replace('inputs_', '').replace('allocations_', '');
              const label = labelMap[cleanKey] || cleanKey;
              
              badges.push(
                <span key={key} className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-[11px] mr-2 mb-2 font-black border border-indigo-100 shadow-sm">
                  <span className="opacity-50 mr-1">{label}:</span> {displayVal}
                </span>
              );
            }
          });
        };
        flatten(obj);
        return badges.length > 0 ? badges : <span className="text-slate-400 italic text-xs">บันทึกค่าพื้นฐาน</span>;
      }
      return <span className="text-slate-600 text-sm font-black">{detail}</span>;
    } catch (e) { return <span className="text-slate-400 text-xs italic">{detail}</span>; }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Modules", "Progress(%)", "Last Active"];
    const rows = filteredStudents.map(s => [s.id, s.name, s.progressCount, s.progressPercent, s.lastActive]);
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `รายงาน_${filterSemester}_${filterYear}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  if (user?.role !== "teacher") return <div className="p-20 text-center font-black">เฉพาะครูผู้สอนเท่านั้น</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-10 font-sans animate-fadeIn relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* 🛠️ Management Bar */}
        <section className="bg-white/60 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white shadow-xl flex flex-wrap gap-6 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
             <div className="space-y-1">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ปีการศึกษา</p>
               <select value={filterYear} onChange={(e)=>setFilterYear(e.target.value)} className="bg-white border border-slate-100 px-4 py-2.5 rounded-xl font-black text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
                 <option value="2569">2569</option>
                 <option value="2568">2568</option>
               </select>
             </div>
             <div className="space-y-1">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ภาคเรียน</p>
               <select value={filterSemester} onChange={(e)=>setFilterSemester(e.target.value)} className="bg-white border border-slate-100 px-4 py-2.5 rounded-xl font-black text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
                 <option value="1">ภาคเรียนที่ 1</option>
                 <option value="2">ภาคเรียนที่ 2</option>
               </select>
             </div>
          </div>
          <div className="flex gap-3">
             <button onClick={exportToCSV} className="px-6 py-3 bg-emerald-500 text-white font-black text-sm rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">download</span> ส่งออก CSV
             </button>
             <button onClick={fetchAdminData} className="px-6 py-3 bg-white border border-slate-200 font-black text-sm rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2">
                <span className={`material-symbols-outlined text-indigo-500 ${loading ? 'animate-spin' : ''}`}>sync</span> รีเฟรช
             </button>
          </div>
        </section>

        {/* 📊 Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl p-10 rounded-[3.5rem] shadow-2xl border border-white">
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-indigo-600">bar_chart</span> สถิติผู้ผ่านรายด่าน ({filterSemester}/{filterYear})
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: '900', fontSize: 11}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 'bold'}} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', fontWeight: 'black'}} />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={40}>
                    {analyticsData.map((entry, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#a5b4fc'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
               <p className="text-indigo-200 font-black text-[10px] uppercase tracking-widest mb-2">Average Progress</p>
               <h3 className="text-6xl font-black">{avgProgress}%</h3>
               <div className="mt-4 w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full transition-all duration-1000" style={{width: `${avgProgress}%`}}></div>
               </div>
            </div>
            <QuickStatCard label="นักเรียนในเทอมนี้" value={filteredStudents.length} unit="คน" icon="group" color="blue" />
            <QuickStatCard label="สำเร็จ 100%" value={filteredStudents.filter(s => s.progressPercent === 100).length} unit="คน" icon="stars" color="emerald" />
          </div>
        </div>

        {/* 📑 Student Table */}
        <div className="bg-white/90 backdrop-blur-2xl rounded-[3.5rem] border border-white shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/30">
            <h3 className="text-xl font-black text-slate-800">รายชื่อนักเรียน ({filteredStudents.length})</h3>
            <div className="relative w-full md:w-80">
              <input type="text" placeholder="ค้นหาชื่อหรือ ID..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-10 py-6">ข้อมูลนักเรียน</th>
                  <th className="px-10 py-6">ความก้าวหน้า</th>
                  <th className="px-10 py-6 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map(std => (
                  <tr key={std.id} className="hover:bg-indigo-50/20 transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2">
                        <div className="font-black text-slate-800 text-lg">{std.name}</div>
                        <button onClick={() => handleEditName(std.id, std.name)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-indigo-600 transition-all"><span className="material-symbols-outlined text-sm">edit</span></button>
                      </div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {std.id}</div>
                    </td>
                    <td className="px-10 py-6 w-72">
                      <div className="flex justify-between text-[10px] font-black mb-1">
                        <span className="text-indigo-600">{std.progressPercent}%</span>
                        <span className="text-slate-400">{std.progressCount}/5</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-700 ${std.progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{width: `${std.progressPercent}%`}}></div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => setSelectedStudent(std)} className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-600 transition-all">View</button>
                        <button onClick={() => handleDeleteStudent(std.id, std.name)} className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><span className="material-symbols-outlined text-sm">delete</span></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ Modal Timeline (Simplified & Fixed Labels) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedStudent(null)}></div>
          <div className="bg-white rounded-[3rem] w-full max-w-3xl max-h-[85vh] flex flex-col relative z-10 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center p-8 border-b border-slate-100 bg-slate-50/50 rounded-t-[3rem]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-2xl">account_circle</span></div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 leading-tight">{selectedStudent.name}</h3>
                  <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">ID: {selectedStudent.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all"><span className="material-symbols-outlined text-lg">close</span></button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
              {selectedStudent.history && selectedStudent.history.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:h-full before:w-1 before:bg-slate-100">
                  {selectedStudent.history.map((record, index) => (
                    <div key={index} className="relative flex items-start gap-8 group">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-indigo-100 text-indigo-600 shrink-0 shadow-md z-10">
                        <span className="material-symbols-outlined text-xl">history_edu</span>
                      </div>
                      <div className="flex-1 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 group-hover:border-indigo-100 transition-all group-hover:-translate-y-1">
                        <div className="flex justify-between mb-2 text-[9px] font-black text-slate-400 uppercase">{record.date}</div>
                        <h4 className="text-base font-black text-slate-800 mb-3">{record.module}</h4>
                        <div className="flex flex-wrap">{formatDetail(record.detail)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : ( <div className="p-20 text-center text-slate-300 font-black">ยังไม่มีข้อมูล</div> )}
            </div>
            <div className="p-6 text-center"><button onClick={() => setSelectedStudent(null)} className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black active:scale-95 transition-all">ปิดหน้าต่าง</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickStatCard({ label, value, unit, icon, color }) {
  const colors = { blue: 'bg-blue-50 text-blue-600', emerald: 'bg-emerald-50 text-emerald-600' };
  return (
    <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white flex items-center gap-5 group hover:scale-[1.02] transition-all duration-500">
      <div className={`w-14 h-14 ${colors[color]} rounded-2xl flex items-center justify-center shadow-inner shrink-0`}><span className="material-symbols-outlined text-2xl">{icon}</span></div>
      <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p><h4 className="text-2xl font-black text-slate-800 tracking-tighter">{value} <span className="text-sm text-slate-400">{unit}</span></h4></div>
    </div>
  );
}