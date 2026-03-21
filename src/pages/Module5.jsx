import React, { useState } from 'react';
// 1. นำเข้า Component สำหรับทำกราฟ Stacked Area
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Module5LifePlanner({ user }) {
  const [inputs, setInputs] = useState({
    startingSalary: 15000,
    salaryIncrease: 5,
    monthlyExpense: 11000,
    yearsToSimulate: 30
  });

  const [allocations, setAllocations] = useState({
    emergency: 40,
    happiness: 20,
    wealth: 40
  });

  const [projectionData, setProjectionData] = useState([]);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setInputs({ ...inputs, [e.target.name]: Number(value) });
  };

  const handleAllocationChange = (e) => {
    setAllocations({ ...allocations, [e.target.name]: Number(e.target.value) });
  };

  const calculateProjection = () => {
    const totalAllocation = allocations.emergency + allocations.happiness + allocations.wealth;
    if (totalAllocation !== 100) {
      alert(`สัดส่วนรวมต้องได้ 100% (ตอนนี้คือ ${totalAllocation}%)`);
      return;
    }

    let data = [];
    let currentSalary = inputs.startingSalary;
    let totalE = 0; let totalH = 0; let totalW = 0;
    let totalInterest = 0;

    const rateE = 0.02; // 2%
    const rateH = 0.00; // 0%
    const rateW = 0.08; // 8%

    for (let year = 1; year <= inputs.yearsToSimulate; year++) {
      let monthlyRem = currentSalary - inputs.monthlyExpense;
      if (monthlyRem < 0) monthlyRem = 0;
      let yearlyRem = monthlyRem * 12;

      let cE = yearlyRem * (allocations.emergency / 100);
      let cH = yearlyRem * (allocations.happiness / 100);
      let cW = yearlyRem * (allocations.wealth / 100);

      let iE = (totalE + cE) * rateE;
      let iW = (totalW + cW) * rateW;
      
      totalE += cE + iE;
      totalH += cH;
      totalW += cW + iW;
      
      let yearInt = iE + iW;
      totalInterest += yearInt;

      data.push({
        year: `ปีที่ ${year}`,
        salary: Math.round(currentSalary),
        remaining: Math.round(monthlyRem),
        "กองทุนฉุกเฉิน": Math.round(totalE),
        "กองทุนความสุข": Math.round(totalH),
        "กองทุนมั่งคั่ง": Math.round(totalW),
        totalWealth: Math.round(totalE + totalH + totalW),
        yearInt: Math.round(yearInt)
      });

      currentSalary *= (1 + (inputs.salaryIncrease / 100));
    }

    setProjectionData(data);
    setIsCalculated(true);
  };

  const saveToGoogleSheets = async () => {
    if (!isCalculated) return alert("กรุณากดคำนวณก่อนครับ");
    setIsSubmitting(true);
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";
    
    const lastYear = projectionData[projectionData.length - 1];
    const payload = {
      action: "save",
      userId: user.id,
      moduleName: "Module 5: Life Planner",
      actionData: `ความมั่งคั่งปีสุดท้าย: ฿${lastYear.totalWealth.toLocaleString()}`
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(payload) });
      setSubmitStatus('บันทึกสำเร็จ ✅');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (error) {
      setSubmitStatus('ผิดพลาด ❌');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen font-sans">
      
      {/* Header */}
      <section className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl flex items-center gap-6 relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg relative z-10 shrink-0">🏆</div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tight">จำลองแผนการเงินตลอดชีพ (Capstone)</h2>
          <p className="text-slate-400 font-medium italic">"กราฟวิเคราะห์ความมั่งคั่งและการกระจายความเสี่ยงใน 30 ปีข้างหน้า"</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Configuration */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 border-b pb-4">
              <span className="material-symbols-outlined text-blue-600">tune</span>
              ตั้งค่าตัวแปร
            </h3>
            
            <InputField label="เงินเดือนเริ่มต้น (บาท)" name="startingSalary" value={inputs.startingSalary} onChange={handleInputChange} />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="เงินเดือนขึ้น (%)" name="salaryIncrease" value={inputs.salaryIncrease} onChange={handleInputChange} />
              <InputField label="จำนวนปีจำลอง" name="yearsToSimulate" value={inputs.yearsToSimulate} onChange={handleInputChange} />
            </div>
            <InputField label="รายจ่ายประจำ (บาท/เดือน)" name="monthlyExpense" value={inputs.monthlyExpense} onChange={handleInputChange} />

            <div className="pt-6 border-t border-slate-50 space-y-5">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">สัดส่วนการออม (รวม 100%)</h4>
              <Slider label="กองทุนฉุกเฉิน (2%)" name="emergency" value={allocations.emergency} onChange={handleAllocationChange} color="blue" />
              <Slider label="กองทุนความสุข (0%)" name="happiness" value={allocations.happiness} onChange={handleAllocationChange} color="orange" />
              <Slider label="กองทุนมั่งคั่ง (8%)" name="wealth" value={allocations.wealth} onChange={handleAllocationChange} color="green" />
              <div className="text-center p-3 bg-slate-50 rounded-2xl text-xs font-black text-slate-500">
                รวมทั้งหมด: {allocations.emergency + allocations.happiness + allocations.wealth}%
              </div>
            </div>

            <button onClick={calculateProjection} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all text-lg">
              สร้างแผนความมั่งคั่ง
            </button>
          </div>
        </div>

        {/* Right: Charts & Data Grid */}
        <div className="lg:col-span-8 space-y-6">
          {isCalculated ? (
            <div className="animate-fadeIn space-y-6">
              
              {/* ส่วนกราฟ Stacked Area */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="font-black text-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-500">stacked_line_chart</span>
                    กราฟการเติบโตของทรัพย์สินรวม
                  </h4>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase">ทรัพย์สินสุทธิปีสุดท้าย</p>
                    <p className="text-2xl font-black text-blue-600">฿{projectionData[projectionData.length-1].totalWealth.toLocaleString()}</p>
                  </div>
                </div>

                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                        <linearGradient id="colorH" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
                        <linearGradient id="colorW" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(value) => `฿${value.toLocaleString()}`}
                      />
                      <Legend verticalAlign="top" height={36}/>
                      <Area stackId="1" type="monotone" dataKey="กองทุนฉุกเฉิน" stroke="#3b82f6" fillOpacity={1} fill="url(#colorE)" />
                      <Area stackId="1" type="monotone" dataKey="กองทุนความสุข" stroke="#f59e0b" fillOpacity={1} fill="url(#colorH)" />
                      <Area stackId="1" type="monotone" dataKey="กองทุนมั่งคั่ง" stroke="#10b981" fillOpacity={1} fill="url(#urlW)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ตารางแสดงผลรายปี */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
                  <h4 className="font-black text-slate-800 text-sm">ตารางกระแสเงินสดจำลอง</h4>
                  <button onClick={saveToGoogleSheets} disabled={isSubmitting} className="px-6 py-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-black transition-all">
                    {isSubmitting ? 'ซิงค์ข้อมูล...' : submitStatus || 'บันทึกลงฐานข้อมูล'}
                  </button>
                </div>
                <div className="overflow-x-auto max-h-[300px]">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-white text-[10px] font-black text-slate-400 uppercase sticky top-0 border-b">
                      <tr>
                        <th className="p-4 text-center">ปี</th>
                        <th className="p-4">เงินเดือน</th>
                        <th className="p-4 text-blue-600">เงินเก็บ/ด.</th>
                        <th className="p-4">ทรัพย์สินรวม</th>
                        <th className="p-4 text-green-600">ดอกเบี้ยปีนั้น</th>
                      </tr>
                    </thead>
                    <tbody className="font-bold text-slate-600 divide-y divide-slate-50">
                      {projectionData.map(row => (
                        <tr key={row.year} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 text-center text-slate-300 font-black">{row.year.replace('ปีที่ ', '')}</td>
                          <td>฿{row.salary.toLocaleString()}</td>
                          <td className="text-blue-600">฿{row.remaining.toLocaleString()}</td>
                          <td className="font-black text-slate-800">฿{row.totalWealth.toLocaleString()}</td>
                          <td className="text-green-600">+฿{row.yearInt.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-100 rounded-[3rem] border-2 border-dashed border-slate-200 h-full min-h-[500px] flex flex-col items-center justify-center text-slate-400 text-center p-12">
              <span className="material-symbols-outlined text-7xl mb-6 opacity-20">insights</span>
              <h4 className="text-xl font-black text-slate-600 mb-2">เริ่มสร้างอนาคตของคุณ</h4>
              <p className="max-w-xs text-sm font-medium leading-relaxed">ปรับเปลี่ยนสัดส่วนการออมและรายได้ที่เมนูด้านซ้าย เพื่อดูพลังของ "เวลา" และ "ดอกเบี้ยทบต้น" ผ่านกราฟ 30 ปี</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-Components
function InputField({ label, name, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input type="text" name={name} value={value === 0 ? '' : value} onChange={onChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 font-black text-slate-700 outline-none transition-all" placeholder="0" />
      <p className="text-[9px] font-black text-blue-500 text-right mr-1">= {Number(value).toLocaleString()}</p>
    </div>
  );
}

function Slider({ label, name, value, onChange, color }) {
  const accentColor = color === 'blue' ? 'accent-blue-600' : color === 'orange' ? 'accent-orange-500' : 'accent-green-600';
  const textColor = color === 'blue' ? 'text-blue-600' : color === 'orange' ? 'text-orange-500' : 'text-green-600';
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
        <span className="text-slate-500">{label}</span>
        <span className={`${textColor} bg-white px-2 py-0.5 rounded-lg border shadow-sm`}>{value}%</span>
      </div>
      <input type="range" name={name} min="0" max="100" value={value} onChange={onChange} className={`w-full ${accentColor} h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer`} />
    </div>
  );
}