import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminDashboard({ user }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  // 📝 พจนานุกรมแปลงคำศัพท์ (ไทย)
  const labelMap = {
    // ทั่วไป / Module 3-4-5
    inputs: 'ข้อมูลนำเข้า',
    amount: 'จำนวนเงิน',
    rate: 'ดอกเบี้ย/ผลตอบแทน',
    years: 'ระยะเวลา (ปี)',
    everyXMonths: 'คิดดอกทุกๆ (เดือน)',
    calcType: 'ประเภทคำนวณ',
    currentAge: 'อายุปัจจุบัน',
    retireAge: 'อายุเกษียณ',
    lifeExpectancy: 'อายุขัย',
    monthlyExpense: 'รายจ่ายต่อเดือน',
    startingSalary: 'เงินเดือนเริ่มต้น',
    salaryIncrease: 'เงินเดือนขึ้น (%/ปี)',
    yearsToSimulate: 'ระยะเวลาจำลอง (ปี)',
    totalWealth: 'ความมั่งคั่งรวม',
    monthlySavingNeeded: 'ต้องออมต่อเดือน',
    targetFund: 'เป้าหมายเงินเกษียณ',
    
    // การแบ่งเงิน (Allocations)
    allocations: 'สัดส่วนเงิน',
    emergency: 'เงินสำรอง',
    wealth: 'พอร์ตลงทุน',
    happiness: 'เงินใช้สอย',
    
    // ประเภทการคำนวณ TVM
    FV_SINGLE: 'เงินก้อนเดียว',
    PV_SINGLE: 'หาเงินต้น',
    FVA_ORD: 'ออมรายงวด',
    FVA_DUE: 'ออมรายงวด (ต้นงวด)',

    // ภาษี (Module 2)
    taxToPay: 'ภาษีที่ต้องจ่าย',
    incomes: 'รายได้รวม',
    deductions: 'ลดหย่อนรวม'
  };

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
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { if (user?.role === 'teacher') fetchAdminData(); }, [user]);

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

  // ✅ ฟังก์ชันจัดรูปแบบรายละเอียด (เวอร์ชันภาษาไทยอ่านง่าย)
  const formatDetail = (detail) => {
    try {
      if (typeof detail === 'string' && detail.startsWith('{')) {
        const obj = JSON.parse(detail);
        const badges = [];

        const flatten = (data) => {
          Object.entries(data).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              flatten(value); 
            } else if (value !== 0 && value !== "" && value !== null) {
              // แปลง Key และ Value เป็นภาษาไทยตาม Map
              const cleanKey = key.replace('inputs_', '').replace('allocations_', '');
              const label = labelMap[cleanKey] || cleanKey;
              const displayVal = labelMap[value] || (typeof value === 'number' ? value.toLocaleString() : value);
              
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

  // ... (ส่วน Render กราฟและตารางเหมือนเดิม แต่ผมรวมป๊อปอัปแบบปรับภาษาให้แล้ว) ...
  const analyticsData = [
    { name: 'ด่าน 1', count: students.filter(s => s.history.some(h => h.module.includes("Module 1"))).length },
    { name: 'ด่าน 2', count: students.filter(s => s.history.some(h => h.module.includes("Module 2"))).length },
    { name: 'ด่าน 3', count: students.filter(s => s.history.some(h => h.module.includes("Module 3"))).length },
    { name: 'ด่าน 4', count: students.filter(s => s.history.some(h => h.module.includes("Module 4"))).length },
    { name: 'ด่าน 5', count: students.filter(s => s.history.some(h => h.module.includes("Module 5"))).length },
  ];

  if (user?.role !== "teacher") return <div className="p-20 text-center font-black">เฉพาะครูผู้สอนเท่านั้น</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-10 font-sans animate-fadeIn relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* Header */}
        <section className="bg-white/60 backdrop-blur-2xl p-10 rounded-[3rem] border border-white shadow-xl flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl flex items-center justify-center text-white text-5xl shadow-xl">
              <span className="material-symbols-outlined text-5xl">analytics</span>
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-800 tracking-tight">Class Analytics</h2>
              <p className="text-slate-500 font-bold italic">{user.school}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={exportToCSV} className="px-8 py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-lg">ส่งออก CSV</button>
            <button onClick={fetchAdminData} className="px-8 py-4 bg-white border border-slate-200 font-black rounded-2xl">รีเฟรช</button>
          </div>
        </section>

        {/* 📑 Student Table */}
        <div className="bg-white/90 backdrop-blur-2xl rounded-[3.5rem] border border-white shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xl font-black text-slate-800">รายชื่อนักเรียนและผลการเรียน</h3>
            <input type="text" placeholder="ค้นหา..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="px-5 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm w-80 shadow-inner" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-10 py-6">ข้อมูลนักเรียน</th>
                  <th className="px-10 py-6">ความก้าวหน้า</th>
                  <th className="px-10 py-6 text-center">ใช้งานล่าสุด</th>
                  <th className="px-10 py-6 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.filter(s => s.name.includes(searchTerm)).map(std => (
                  <tr key={std.id} className="hover:bg-indigo-50/20 transition-all group">
                    <td className="px-10 py-6">
                      <div className="font-black text-slate-800 text-lg">{std.name}</div>
                      <div className="text-[10px] font-black text-slate-400">ID: {std.id}</div>
                    </td>
                    <td className="px-10 py-6 w-72">
                      <div className="flex justify-between text-[10px] font-black mb-1">
                        <span>{std.progressCount}/5</span>
                        <span className="text-indigo-600">{std.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-700 ${std.progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{width: `${std.progressPercent}%`}}></div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center text-xs font-black text-slate-500">{std.lastActive}</td>
                    <td className="px-10 py-6 text-center">
                      <button onClick={() => setSelectedStudent(std)} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-indigo-600 transition-all">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ Modal แสดงรายละเอียด (แก้ไขภาษาไทยแล้ว) */}
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
              <button onClick={() => setSelectedStudent(null)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all">
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
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">{record.date}</div>
                        <h4 className="text-base font-black text-slate-800 mb-3">{record.module}</h4>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap">
                          {formatDetail(record.detail)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-20 text-center text-slate-300 font-black">ยังไม่มีข้อมูล</div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-[3rem] text-center">
              <button onClick={() => setSelectedStudent(null)} className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black active:scale-95 transition-all">ปิดหน้าต่าง</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ Sub-component for Quick Stats
function QuickStatCard({ label, value, unit, icon, color }) {
  const colors = { blue: 'bg-blue-50 text-blue-600', emerald: 'bg-emerald-50 text-emerald-600' };
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