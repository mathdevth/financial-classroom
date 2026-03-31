import React, { useState, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import HistoryModal from '../components/HistoryModal';

export default function Module5LifePlanner({ user }) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // 1. ตัวแปรชีวิต
  const [inputs, setInputs] = useState({
    startingSalary: 20000,
    salaryIncrease: 5,
    monthlyExpense: 12000,
    yearsToSimulate: 30
  });

  // 2. สัดส่วนการจัดสรร
  const [allocations, setAllocations] = useState({
    emergency: 30,
    wealth: 50,
    happiness: 20
  });

  const [projectionData, setProjectionData] = useState([]);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  const calculateYearlyTax = (annualIncome) => {
    const income = annualIncome - 100000;
    if (income <= 150000) return 0;
    if (income <= 300000) return (income - 150000) * 0.05;
    if (income <= 500000) return 7500 + (income - 300000) * 0.10;
    return 27500 + (income - 500000) * 0.15;
  };

  const calculateProjection = () => {
    const totalAlloc = allocations.emergency + allocations.wealth + allocations.happiness;
    if (totalAlloc !== 100) {
      alert(`กรุณาปรับสัดส่วนรวมให้ได้ 100% (ตอนนี้คือ ${totalAlloc}%)`);
      return;
    }

    let data = [];
    let currentSalary = inputs.startingSalary;
    let totalEmergency = 0; 
    let totalWealth = 0;   
    let totalHappiness = 0; 

    for (let year = 1; year <= inputs.yearsToSimulate; year++) {
      const yearlyIncome = currentSalary * 12;
      const yearlyTax = calculateYearlyTax(yearlyIncome);
      const netYearlyIncome = yearlyIncome - yearlyTax;
      
      let yearlySurplus = netYearlyIncome - (inputs.monthlyExpense * 12);
      if (yearlySurplus < 0) yearlySurplus = 0;

      let addEmergency = yearlySurplus * (allocations.emergency / 100);
      let addWealth = yearlySurplus * (allocations.wealth / 100);
      let addHappiness = yearlySurplus * (allocations.happiness / 100);

      totalEmergency = (totalEmergency + addEmergency) * 1.02;
      totalWealth = (totalWealth + addWealth) * 1.08;
      totalHappiness += addHappiness;

      data.push({
        year: `ปีที่ ${year}`,
        "เงินสำรอง (2%)": Math.round(totalEmergency),
        "พอร์ตลงทุน (8%)": Math.round(totalWealth),
        "เงินใช้สอยสะสม": Math.round(totalHappiness),
        total: Math.round(totalEmergency + totalWealth + totalHappiness)
      });

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
          moduleName: "Module 5: Wealth Galaxy",
          actionData: JSON.stringify({ inputs, allocations, totalWealth: projectionData[projectionData.length-1]?.total }) 
        }) 
      });
      setSubmitStatus('บันทึกแผนชีวิตสำเร็จ ✅');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (e) { setSubmitStatus('ผิดพลาด ❌'); }
    finally { setIsSubmitting(false); }
  };

  // ✅ ฟังก์ชันแสดงสูตรและคอนเซปต์ของ Module 5
  const renderFormulaBox = () => {
    return (
      <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-[40px]"></div>
        
        <div className="flex items-center gap-3 mb-6 opacity-80 border-b border-white/10 pb-3">
          <span className="material-symbols-outlined text-cyan-400">account_tree</span>
          <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Financial Flow Model</p>
        </div>

        <div className="space-y-4">
          <p className="text-xs md:text-sm text-cyan-100/80 mb-2 font-bold text-center whitespace-nowrap">
            วิธีหาเงินคงเหลือเพื่อนำไปจัดสรร (Surplus)
          </p>
          <div className="overflow-x-auto custom-scrollbar pb-2">
            <div className="flex items-center justify-center gap-2 text-[11px] sm:text-sm md:text-base font-black text-cyan-50 whitespace-nowrap w-max mx-auto">
              <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30">รายได้ต่อปี</span>
              <span className="text-cyan-400 font-bold">-</span>
              <span className="bg-rose-500/20 text-rose-300 px-3 py-1.5 rounded-lg border border-rose-500/30">ภาษีรายปี</span>
              <span className="text-cyan-400 font-bold">-</span>
              <span className="bg-orange-500/20 text-orange-300 px-3 py-1.5 rounded-lg border border-orange-500/30">ค่าใช้จ่ายรายปี</span>
              <span className="text-cyan-400 font-bold">=</span>
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-lg border border-blue-500/30">เงินก้อนเพื่อจัดสรร</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 text-center leading-relaxed">
              *หมายเหตุ: โปรแกรมจะนำ <strong className="text-blue-300">"เงินก้อนเพื่อจัดสรร"</strong> ไปแบ่งตามเปอร์เซ็นต์ที่คุณกำหนดด้านล่าง <br className="hidden md:block" />
              และนำไปคำนวณทบต้นด้วยดอกเบี้ยของแต่ละกองทุนในทุกๆ ปี
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-10 px-4 md:px-10 font-sans animate-fadeIn relative overflow-hidden">
      
      {/* 🔮 Background Decor */}
      <div className="absolute top-0 right-0 w-[30rem] md:w-[45rem] h-[30rem] md:h-[45rem] bg-cyan-100/40 rounded-full blur-[80px] md:blur-[120px] -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-[25rem] md:w-[35rem] h-[25rem] md:h-[35rem] bg-blue-50/60 rounded-full blur-[80px] md:blur-[100px] -ml-32 -mb-32"></div>

      <div className="max-w-7xl mx-auto space-y-8 md:space-y-10 relative z-10">
        
        {/* Header Section */}
        <section className="bg-white/60 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-white shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl md:rounded-3xl flex items-center justify-center text-white text-4xl md:text-5xl shadow-xl shadow-cyan-500/20 group hover:scale-110 transition-transform duration-500 shrink-0">
              <span className="material-symbols-outlined text-4xl md:text-5xl">rocket_launch</span>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight pb-1 md:pb-4 pr-2 md:pr-4 leading-tight">The Wealth Galaxy</h2>
              <p className="text-slate-500 font-bold italic text-xs md:text-base">จำลองเส้นทางความมั่งคั่ง 30 ปีในจักรวาลของคุณ</p>
            </div>
          </div>
          <button onClick={() => setIsHistoryOpen(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm w-full md:w-auto">
            <span className="material-symbols-outlined text-cyan-500">history</span> 
            ประวัติจำลองชีวิต
          </button>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
          
          {/* 📥 Left Side: Inputs */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white/90 backdrop-blur-2xl p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl shadow-slate-200/40 border border-white space-y-6 md:space-y-8 text-slate-800">
              
              {/* ✅ แสดงสูตรการทำงาน */}
              {renderFormulaBox()}

              <div className="space-y-4">
                <h3 className="text-xs md:text-sm font-black text-cyan-600 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-100 pb-3 md:pb-4">
                  <span className="material-symbols-outlined text-lg md:text-xl">work</span> 1. ข้อมูลรายได้-รายจ่าย
                </h3>
                <InputField label="เงินเดือนเริ่มต้น" value={inputs.startingSalary} onChange={(e)=>setInputs({...inputs, startingSalary: Number(e.target.value)})} icon="payments" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="เงินเดือนขึ้น (%/ปี)" value={inputs.salaryIncrease} onChange={(e)=>setInputs({...inputs, salaryIncrease: Number(e.target.value)})} icon="trending_up" />
                  <InputField label="ระยะเวลาจำลอง (ปี)" value={inputs.yearsToSimulate} onChange={(e)=>setInputs({...inputs, yearsToSimulate: Number(e.target.value)})} icon="calendar_today" />
                </div>
                
                <InputField label="รายจ่ายคงที่ต่อเดือน" value={inputs.monthlyExpense} onChange={(e)=>setInputs({...inputs, monthlyExpense: Number(e.target.value)})} icon="shopping_bag" />
              </div>

              <div className="space-y-5 md:space-y-6 pt-2">
                <h3 className="text-xs md:text-sm font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-100 pb-3 md:pb-4">
                  <span className="material-symbols-outlined text-lg md:text-xl">pie_chart</span> 2. กลยุทธ์การแบ่งเงิน
                </h3>
                <SliderField label="กองทุนสำรอง (โต 2%)" value={allocations.emergency} color="blue" onChange={(e)=>setAllocations({...allocations, emergency: Number(e.target.value)})} />
                <SliderField label="พอร์ตลงทุน (โต 8%)" value={allocations.wealth} color="emerald" onChange={(e)=>setAllocations({...allocations, wealth: Number(e.target.value)})} />
                <SliderField label="เงินรางวัลชีวิต (กินใช้)" value={allocations.happiness} color="orange" onChange={(e)=>setAllocations({...allocations, happiness: Number(e.target.value)})} />
                
                <div className={`text-center p-3 md:p-4 rounded-2xl text-[10px] md:text-xs font-black transition-all shadow-inner border ${allocations.emergency + allocations.wealth + allocations.happiness === 100 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                  สัดส่วนรวมตอนนี้: {allocations.emergency + allocations.wealth + allocations.happiness}% {allocations.emergency + allocations.wealth + allocations.happiness !== 100 && "(ต้องปรับให้ได้ 100%)"}
                </div>
              </div>

              <button onClick={calculateProjection} className="w-full py-5 md:py-6 bg-slate-900 text-white font-black rounded-[1.5rem] md:rounded-3xl shadow-xl hover:bg-cyan-600 hover:scale-[1.02] transition-all active:scale-95 text-xl md:text-2xl flex items-center justify-center gap-3 md:gap-4 group mt-4">
                 <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">auto_mode</span>
                 รันผลจำลองชีวิต
              </button>
            </div>
          </div>

          {/* 🏔️ Right Side: Result Visual */}
          <div className="lg:col-span-7">
            {isCalculated ? (
              <div className="space-y-6 md:space-y-8 animate-fadeIn">
                
                {/* 💰 Total Wealth Card */}
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-10 -top-10 md:-right-20 md:-top-20 w-40 h-40 md:w-64 md:h-64 bg-white/10 rounded-full blur-[60px] md:blur-[80px]"></div>
                  <p className="text-cyan-100 font-black text-[9px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] mb-2 md:mb-3 opacity-80">ความมั่งคั่งสุทธิในปีที่ {inputs.yearsToSimulate}</p>
                  
                  <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter pb-2 md:pb-4 pr-2 md:pr-4 leading-tight break-words">
                    ฿{projectionData[projectionData.length-1].total.toLocaleString()}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-2 md:mt-4 px-3 md:px-4 py-1.5 md:py-2 bg-white/10 rounded-full w-fit backdrop-blur-md border border-white/10">
                    <span className="material-symbols-outlined text-xs md:text-sm">stars</span>
                    <p className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-cyan-50">คำนวณภาษีและเงินเฟ้อแล้ว</p>
                  </div>
                </div>

                {/* 📈 Chart Area */}
                <div className="bg-white/90 backdrop-blur-2xl p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border border-white h-[400px] md:h-[480px] flex flex-col">
                  <h4 className="font-black text-slate-800 mb-6 md:mb-8 flex items-center gap-2 md:gap-3 text-sm md:text-base">
                    <span className="material-symbols-outlined text-blue-500 text-2xl md:text-3xl">analytics</span>
                    วิถีการเติบโตของความมั่งคั่งสะสม
                  </h4>
                  <ResponsiveContainer width="100%" height="75%">
                    <AreaChart data={projectionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{fontSize: 9, fontWeight: 'black', fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      
                      {/* ✅ แปลง Tooltip ให้แสดงภาษาไทย */}
                      <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'black', fontSize: '12px' }} 
                        formatter={(value, name) => {
                          let label = name;
                          if (name === 'total') label = 'รวมความมั่งคั่งสุทธิ';
                          return [`฿${value.toLocaleString()}`, label];
                        }}
                      />
                      
                      {/* ✅ แปลง Legend (คำอธิบายสีของกราฟ) ให้เป็นภาษาไทย */}
                      <Legend 
                        verticalAlign="top" 
                        wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} 
                        formatter={(value) => {
                          if (value === 'total') return 'ความมั่งคั่งรวม';
                          return value;
                        }}
                      />
                      
                      <Area stackId="1" type="monotone" dataKey="เงินใช้สอยสะสม" stroke="#f59e0b" strokeWidth={3} fill="#f59e0b40" />
                      <Area stackId="1" type="monotone" dataKey="พอร์ตลงทุน (8%)" stroke="#10b981" strokeWidth={3} fill="#10b98140" />
                      <Area stackId="1" type="monotone" dataKey="เงินสำรอง (2%)" stroke="#3b82f6" strokeWidth={3} fill="#3b82f640" />
                    </AreaChart>
                  </ResponsiveContainer>
                  
                  <button onClick={saveToSheets} disabled={isSubmitting} className={`w-full mt-4 md:mt-6 py-4 md:py-5 font-black rounded-2xl md:rounded-[2rem] transition-all flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg shadow-xl active:scale-95 ${isSubmitting ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'}`}>
                    <span className="material-symbols-outlined text-xl md:text-2xl">{isSubmitting ? 'sync' : 'cloud_done'}</span>
                    {submitStatus || 'บันทึกจักรวาลความมั่งคั่ง'}
                  </button>
                </div>
              </div>
            ) : (
              /* 🛸 Placeholder State */
              <div className="h-full min-h-[400px] md:min-h-[550px] bg-white/80 rounded-[2.5rem] md:rounded-[3.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center p-8 md:p-12 text-slate-300 text-center space-y-4 md:space-y-6">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-full flex items-center justify-center animate-pulse">
                   <span className="material-symbols-outlined text-6xl md:text-7xl opacity-30">explore</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xl md:text-2xl font-black uppercase tracking-widest text-slate-400">Wealth Awaits</p>
                  <p className="text-xs md:text-base font-bold max-w-xs mx-auto text-slate-400 leading-relaxed">ปรับกลยุทธ์การจัดสรรเงินทางด้านซ้าย <br/>เพื่อร่างจักรวาลความมั่งคั่ง 30 ปีของคุณ</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} userId={user.id} moduleName="Module 5: Wealth Galaxy" GOOGLE_SCRIPT_URL={GOOGLE_SCRIPT_URL} />
    </div>
  );
}

// ✅ ลด Padding + เพิ่ม normal-case ป้องกันตัวพิมพ์ใหญ่
function InputField({ label, value, onChange, icon }) {
  return (
    <div className="space-y-1.5 pb-2">
      <label className="text-[9px] md:text-[10px] font-black text-slate-400 normal-case tracking-widest ml-3 block">{label}</label>
      <div className="relative flex items-center group">
        <div className="absolute left-3 md:left-4 w-8 h-8 md:w-10 md:h-10 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-400 group-focus-within:bg-blue-50 group-focus-within:text-blue-500 transition-all duration-300">
          <span className="material-symbols-outlined text-[18px] md:text-[20px]">{icon}</span>
        </div>
        <input 
          type="text" 
          value={value === 0 ? '' : value} 
          onChange={onChange} 
          className="w-full pl-14 md:pl-16 pr-4 py-3 md:py-4 bg-slate-50 border border-slate-100 rounded-2xl md:rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-200 outline-none font-black text-slate-800 text-base md:text-lg transition-all shadow-inner placeholder:text-slate-200" 
          placeholder="0" 
        />
      </div>
    </div>
  );
}

function SliderField({ label, value, onChange, color }) {
  const colorMap = {
    blue: { main: '#3b82f6', bg: '#dbeafe' },
    emerald: { main: '#10b981', bg: '#d1fae5' },
    orange: { main: '#f59e0b', bg: '#ffedd5' }
  };
  
  const current = colorMap[color] || colorMap.blue;
  const trackStyle = {
    background: `linear-gradient(to right, ${current.main} 0%, ${current.main} ${value}%, ${current.bg} ${value}%, ${current.bg} 100%)`
  };

  return (
    <div className="space-y-2 md:space-y-3 mb-2">
      <div className="flex justify-between text-[9px] md:text-[10px] font-black normal-case tracking-widest px-2">
        <span className="text-slate-400">{label}</span>
        <span 
          className="text-[10px] md:text-[12px] font-black px-2 md:px-3 py-1 rounded-full bg-white border shadow-sm transition-all"
          style={{ color: current.main, borderColor: `${current.main}40` }}
        >
          {value}%
        </span>
      </div>
      
      <div className="relative flex items-center px-1">
        <input 
          type="range" 
          min="0" max="100" 
          value={value} 
          onChange={onChange} 
          style={trackStyle}
          className="w-full h-2 rounded-full appearance-none cursor-pointer transition-all focus:outline-none shadow-inner custom-slider" 
        />
      </div>

      <style>{`
        .custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: white;
          border: 4px solid ${current.main};
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 12px ${current.main}30;
          transition: all 0.2s ease-in-out;
        }
        @media (min-width: 768px) {
          .custom-slider::-webkit-slider-thumb {
            width: 24px;
            height: 24px;
          }
        }
        .custom-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 0 20px ${current.main}40;
        }
      `}</style>
    </div>
  );
}