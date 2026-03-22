import React, { useState, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import HistoryModal from '../components/HistoryModal';

export default function Module5LifePlanner({ user }) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // 1. ตัวแปรชีวิต (เน้นรายได้และการเติบโต)
  const [inputs, setInputs] = useState({
    startingSalary: 20000, // เงินเดือนเริ่ม
    salaryIncrease: 5,     // % เงินเดือนขึ้น
    monthlyExpense: 12000, // รายจ่ายต่อเดือน
    yearsToSimulate: 30    // จำลองไปอีกกี่ปี
  });

  // 2. สัดส่วนการจัดสรร (หัวใจของโมดูลนี้)
  const [allocations, setAllocations] = useState({
    emergency: 30, // เก็บสำรองฉุกเฉิน
    wealth: 50,    // ลงทุนให้ความมั่งคั่ง
    happiness: 20  // เงินรางวัลชีวิต (กินเที่ยว)
  });

  const [projectionData, setProjectionData] = useState([]);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  // ✅ Logic การจำลองอนาคต (Forward Projection)
  const calculateProjection = () => {
    const totalAlloc = allocations.emergency + allocations.wealth + allocations.happiness;
    if (totalAlloc !== 100) {
      alert(`กรุณาปรับสัดส่วนรวมให้ได้ 100% (ตอนนี้คือ ${totalAlloc}%)`);
      return;
    }

    let data = [];
    let currentSalary = inputs.startingSalary;
    let totalEmergency = 0; // โต 2% ต่อปี
    let totalWealth = 0;    // โต 8% ต่อปี
    let totalHappiness = 0; // ไม่โต (เน้นใช้)

    for (let year = 1; year <= inputs.yearsToSimulate; year++) {
      let monthlySurplus = currentSalary - inputs.monthlyExpense;
      if (monthlySurplus < 0) monthlySurplus = 0;
      let yearlySurplus = monthlySurplus * 12;

      // แบ่งเงินตามสัดส่วน
      let addEmergency = yearlySurplus * (allocations.emergency / 100);
      let addWealth = yearlySurplus * (allocations.wealth / 100);
      let addHappiness = yearlySurplus * (allocations.happiness / 100);

      // ทบต้นดอกเบี้ย
      totalEmergency = (totalEmergency + addEmergency) * 1.02;
      totalWealth = (totalWealth + addWealth) * 1.08;
      totalHappiness += addHappiness; // สะสมเงินรางวัลชีวิต

      data.push({
        year: `ปีที่ ${year}`,
        "เงินสำรอง (2%)": Math.round(totalEmergency),
        "พอร์ตลงทุน (8%)": Math.round(totalWealth),
        "เงินใช้สอยสะสม": Math.round(totalHappiness),
        total: Math.round(totalEmergency + totalWealth + totalHappiness)
      });

      // เงินเดือนเพิ่มขึ้นในปีถัดไป
      currentSalary *= (1 + (inputs.salaryIncrease / 100));
    }

    setProjectionData(data);
    setIsCalculated(true);
  };

  const saveToSheets = async () => {
    setIsSubmitting(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, { 
        method: "POST", mode: "no-cors", 
        body: JSON.stringify({
          action: "save", userId: user.id,
          moduleName: "Module 5: Life Planner",
          actionData: JSON.stringify({ inputs, allocations, totalWealth: projectionData[projectionData.length-1]?.total }) 
        }) 
      });
      setSubmitStatus('บันทึกแผนชีวิตสำเร็จ ✅');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (e) { setSubmitStatus('ผิดพลาด ❌'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn font-sans">
      
      {/* Header ต่างจาก Module 4 ชัดเจน */}
      <section className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-indigo-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-indigo-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shrink-0">💎</div>
          <div>
            <h2 className="text-3xl font-black tracking-tight">Life Simulation</h2>
            <p className="text-indigo-200 font-medium italic">จำลองการบริหารรายได้และพอร์ตความมั่งคั่งในอนาคต</p>
          </div>
        </div>
        <button onClick={() => setIsHistoryOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all shadow-sm relative z-10">
          <span className="material-symbols-outlined">history</span> ดูประวัติจำลองชีวิต
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-lg font-black text-slate-800 border-b pb-4">1. รายได้และรายจ่าย</h3>
            <InputField label="เงินเดือนเริ่มต้น" name="startingSalary" value={inputs.startingSalary} onChange={(e)=>setInputs({...inputs, startingSalary: Number(e.target.value)})} icon="payments" />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="เงินเดือนขึ้น (%/ปี)" name="salaryIncrease" value={inputs.salaryIncrease} onChange={(e)=>setInputs({...inputs, salaryIncrease: Number(e.target.value)})} icon="trending_up" />
              <InputField label="ระยะเวลาจำลอง (ปี)" name="yearsToSimulate" value={inputs.yearsToSimulate} onChange={(e)=>setInputs({...inputs, yearsToSimulate: Number(e.target.value)})} icon="calendar_today" />
            </div>
            <InputField label="รายจ่ายคงที่ต่อเดือน" name="monthlyExpense" value={inputs.monthlyExpense} onChange={(e)=>setInputs({...inputs, monthlyExpense: Number(e.target.value)})} icon="shopping_bag" />

            <h3 className="text-lg font-black text-indigo-600 border-b pb-4 pt-4">2. กลยุทธ์การจัดสรร (Must be 100%)</h3>
            <Slider label="กองทุนฉุกเฉิน (โต 2%)" value={allocations.emergency} color="blue" onChange={(e)=>setAllocations({...allocations, emergency: Number(e.target.value)})} />
            <Slider label="กองทุนพอร์ตลงทุน (โต 8%)" value={allocations.wealth} color="green" onChange={(e)=>setAllocations({...allocations, wealth: Number(e.target.value)})} />
            <Slider label="เงินรางวัลชีวิต (กินใช้)" value={allocations.happiness} color="orange" onChange={(e)=>setAllocations({...allocations, happiness: Number(e.target.value)})} />
            
            <div className={`text-center p-3 rounded-2xl text-xs font-black transition-all ${allocations.emergency + allocations.wealth + allocations.happiness === 100 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              ผลรวมสัดส่วน: {allocations.emergency + allocations.wealth + allocations.happiness}%
            </div>

            <button onClick={calculateProjection} className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all text-lg">รันผลจำลองเส้นทางชีวิต</button>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          {isCalculated ? (
            <div className="animate-fadeIn space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-indigo-50 flex flex-col h-full">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">คาดการณ์ความมั่งคั่งรวม</p>
                    <h4 className="text-4xl font-black text-indigo-600">฿{projectionData[projectionData.length-1].total.toLocaleString()}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-green-500 uppercase">เงินลงทุนสุทธิ</p>
                    <p className="text-xl font-bold text-slate-700">฿{projectionData[projectionData.length-1]["พอร์ตลงทุน (8%)"].toLocaleString()}</p>
                  </div>
                </div>

                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData}>
                      <defs>
                        <linearGradient id="colorE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/></linearGradient>
                        <linearGradient id="colorW" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/></linearGradient>
                        <linearGradient id="colorH" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} formatter={(v) => `฿${v.toLocaleString()}`} />
                      <Legend verticalAlign="top" height={36}/>
                      <Area stackId="1" type="monotone" dataKey="เงินสำรอง (2%)" stroke="#3b82f6" fill="url(#colorE)" />
                      <Area stackId="1" type="monotone" dataKey="พอร์ตลงทุน (8%)" stroke="#10b981" fill="url(#colorW)" />
                      <Area stackId="1" type="monotone" dataKey="เงินใช้สอยสะสม" stroke="#f59e0b" fill="url(#colorH)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <button onClick={saveToSheets} disabled={isSubmitting} className="mt-8 w-full py-4 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                  <span className="material-symbols-outlined">{isSubmitting ? 'sync' : 'save_as'}</span>
                  {submitStatus || 'บันทึกแผนชีวิตลงประวัติ'}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-100 rounded-[3.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-slate-400 text-center font-bold">
              <span className="material-symbols-outlined text-8xl mb-6 opacity-20">insights</span>
              <p className="text-xl">ตั้งค่าตัวแปรและสัดส่วนเงินเก็บ <br/>เพื่อจำลอง "เส้นทางความรวย" ของคุณ</p>
            </div>
          )}
        </div>
      </div>

      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} userId={user.id} moduleName="Module 5: Life Planner" GOOGLE_SCRIPT_URL={GOOGLE_SCRIPT_URL} />
    </div>
  );
}

// Sub-components
function InputField({ label, value, onChange, icon }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-4 text-slate-400">{icon}</span>
        <input type="text" value={value === 0 ? '' : value} onChange={onChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-black text-slate-700 outline-none transition-all shadow-inner" placeholder="0" />
      </div>
    </div>
  );
}

function Slider({ label, value, onChange, color }) {
  const colors = { blue: 'accent-blue-600 text-blue-600', green: 'accent-green-600 text-green-600', orange: 'accent-orange-500 text-orange-500' };
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase">
        <span className="text-slate-500">{label}</span>
        <span className={`${colors[color].split(' ')[1]} bg-white px-2 py-0.5 rounded-lg border shadow-sm`}>{value}%</span>
      </div>
      <input type="range" min="0" max="100" value={value} onChange={onChange} className={`w-full ${colors[color].split(' ')[0]} h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer`} />
    </div>
  );
}