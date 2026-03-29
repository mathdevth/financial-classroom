import React, { useState, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import HistoryModal from '../components/HistoryModal';

export default function Module4RetirementPlanner({ user }) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [planInputs, setPlanInputs] = useState({
    currentAge: 25,
    retireAge: 60,
    lifeExpectancy: 80,
    monthlyExpense: 20000,
    returnRate: 5 
  });

  const [result, setResult] = useState({
    targetFund: 0,
    monthlySavingNeeded: 0,
    monthlyLate: 0,
    costMultiplier: 0,
    isCalculated: false
  });

  const [chartData, setChartData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    setPlanInputs({ ...planInputs, [name]: Number(sanitizedValue) });
  };

  const calculateRetirement = () => {
    const { currentAge, retireAge, lifeExpectancy, monthlyExpense, returnRate } = planInputs;
    const yearsToSave = retireAge - currentAge;
    const yearsInRetirement = lifeExpectancy - retireAge;

    if (yearsToSave <= 0 || yearsInRetirement <= 0) {
      alert("ตรวจสอบข้อมูล: อายุปัจจุบันต้องน้อยกว่าอายุเกษียณ และอายุเกษียณต้องน้อยกว่าอายุขัย");
      return;
    }

    const r = returnRate / 100;
    const i = r / 12;

    const monthsInRetirement = yearsInRetirement * 12;
    const targetFund = i === 0 
      ? monthlyExpense * monthsInRetirement 
      : (monthlyExpense * (1 - Math.pow(1 + i, -monthsInRetirement))) / i;

    const n_acc = yearsToSave * 12;
    const monthlySaving = i === 0 ? targetFund / n_acc : (targetFund * i) / (Math.pow(1 + i, n_acc) - 1);

    const yearsLate = Math.max(1, yearsToSave - 10);
    const n_late = yearsLate * 12;
    const monthlyLate = i === 0 ? targetFund / n_late : (targetFund * i) / (Math.pow(1 + i, n_late) - 1);
    const costMultiplier = (monthlyLate / monthlySaving).toFixed(1);

    let projection = [];
    let currentBalance = 0;
    
    for (let age = currentAge; age <= retireAge; age++) {
      projection.push({ age, fund: Math.round(currentBalance), phase: 'สะสมเงิน' });
      currentBalance = (currentBalance + (monthlySaving * 12)) * (1 + r);
    }

    currentBalance = targetFund; 
    for (let age = retireAge + 1; age <= lifeExpectancy; age++) {
      currentBalance = (currentBalance - (monthlyExpense * 12)) * (1 + r);
      if (currentBalance < 0) currentBalance = 0;
      projection.push({ age, fund: Math.round(currentBalance), phase: 'ใช้เงิน' });
    }

    setChartData(projection);
    setResult({
      targetFund,
      monthlySavingNeeded: monthlySaving,
      monthlyLate: monthlyLate,
      costMultiplier,
      isCalculated: true
    });
  };

  const saveToGoogleSheets = async () => {
    setIsSubmitting(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST", mode: "no-cors",
        body: JSON.stringify({
          action: "save", userId: user.id,
          moduleName: "Module 4: Retirement Mountain",
          actionData: JSON.stringify({ ...planInputs, ...result }) 
        })
      });
      setSubmitStatus('บันทึกแผนสำเร็จ! ✅');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (error) { setSubmitStatus('ล้มเหลว ❌'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-10 px-4 md:px-10 font-sans animate-fadeIn relative overflow-hidden">
      
      {/* 🔮 Background Decor */}
      <div className="absolute top-0 right-0 w-[30rem] md:w-[40rem] h-[30rem] md:h-[40rem] bg-rose-100/40 rounded-full blur-[80px] md:blur-[120px] -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-[25rem] md:w-[35rem] h-[25rem] md:h-[35rem] bg-fuchsia-50/60 rounded-full blur-[80px] md:blur-[100px] -ml-32 -mb-32"></div>

      <div className="max-w-7xl mx-auto space-y-8 md:space-y-10 relative z-10">
        
        {/* Header Section */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/60 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-white shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-fuchsia-500 to-rose-500 rounded-2xl md:rounded-3xl flex items-center justify-center text-white text-4xl md:text-5xl shadow-xl shadow-fuchsia-500/20 group hover:scale-110 transition-transform duration-500 shrink-0">
              <span className="material-symbols-outlined text-4xl md:text-5xl">landscape</span>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight pb-1 md:pb-4 pr-2 md:pr-4 leading-tight">Retirement Mountain</h2>
              <p className="text-slate-500 font-bold italic text-xs md:text-base">จำลอง "เส้นทางสู่ยอดเขาเงินออม" เพื่อเกษียณในฝัน</p>
            </div>
          </div>
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm w-full md:w-auto"
          >
            <span className="material-symbols-outlined text-fuchsia-500">history</span>
            ประวัติการบันทึก
          </button>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
          
          {/* 📥 Left Side: Input Fields */}
          <div className="lg:col-span-5 space-y-8">
            {/* ✅ ลด Padding สำหรับมือถือ (p-6) และใช้ p-10 สำหรับคอม */}
            <div className="bg-white/90 backdrop-blur-2xl p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl shadow-slate-200/40 border border-white space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Setup Your Journey</span>
              </div>
              
              {/* ✅ เปลี่ยนให้เรียง 1 คอลัมน์ (ซ้อนกัน) ในมือถือ และ 2 คอลัมน์ (คู่กัน) ตั้งแต่จอ sm ขึ้นไป */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="อายุปัจจุบัน" name="currentAge" value={planInputs.currentAge} onChange={handleInputChange} icon="person" />
                <InputField label="อายุเกษียณ" name="retireAge" value={planInputs.retireAge} onChange={handleInputChange} icon="flag" />
              </div>
              
              <InputField label="อายุขัยคาดหวัง" name="lifeExpectancy" value={planInputs.lifeExpectancy} onChange={handleInputChange} icon="favorite" />
              <InputField label="ค่าใช้จ่ายหลังเกษียณ (บาท/เดือน)" name="monthlyExpense" value={planInputs.monthlyExpense} onChange={handleInputChange} icon="payments" />
              <InputField label="ผลตอบแทนคาดหวัง (% ต่อปี)" name="returnRate" value={planInputs.returnRate} onChange={handleInputChange} icon="trending_up" />

              <button onClick={calculateRetirement} className="w-full py-5 md:py-6 bg-slate-900 text-white font-black rounded-[1.5rem] md:rounded-3xl shadow-xl hover:bg-fuchsia-600 hover:scale-[1.02] transition-all active:scale-95 text-xl md:text-2xl tracking-tight flex items-center justify-center gap-3 md:gap-4 group mt-4">
                <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">explore</span>
                พิชิตยอดเขาเงินออม
              </button>
            </div>
          </div>

          {/* 🏔️ Right Side: Visualizing the Mountain */}
          <div className="lg:col-span-7">
            {result.isCalculated ? (
              <div className="space-y-6 md:space-y-8 animate-fadeIn">
                
                {/* 💰 Target Fund Card */}
                <div className="bg-gradient-to-br from-fuchsia-600 to-rose-600 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-10 -top-10 md:-right-20 md:-top-20 w-40 h-40 md:w-64 md:h-64 bg-white/10 rounded-full blur-[60px] md:blur-[80px]"></div>
                  <p className="text-rose-100 font-black text-[9px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] mb-2 md:mb-3 opacity-80">ยอดเงินที่ต้องมี ณ วันเกษียณ</p>
                  <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter pb-2 md:pb-4 pr-2 md:pr-4 leading-tight break-words">
                    ฿{Math.round(result.targetFund).toLocaleString()}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 md:mt-4">
                    <span className="material-symbols-outlined text-xs md:text-sm">info</span>
                    <p className="text-rose-100/80 text-[10px] md:text-[11px] font-bold italic">คำนวณเพื่อให้เงินใช้ได้ถึงอายุ {planInputs.lifeExpectancy} ปี</p>
                  </div>
                </div>

                {/* 📊 Saving Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-xl flex flex-col items-center text-center group hover:scale-[1.05] transition-all duration-500">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-50 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center text-emerald-600 mb-3 md:mb-4 shadow-inner">
                      <span className="material-symbols-outlined text-2xl md:text-3xl">rocket_launch</span>
                    </div>
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">เริ่มออมวันนี้</p>
                    <h4 className="text-2xl md:text-3xl font-black text-slate-800">฿{Math.ceil(result.monthlySavingNeeded).toLocaleString()}</h4>
                    <p className="text-[9px] md:text-[10px] font-bold text-emerald-500 mt-2">ประหยัดและมั่นคงกว่า</p>
                  </div>
                  
                  <div className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-xl flex flex-col items-center text-center group hover:scale-[1.05] transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-3 right-3 bg-rose-500 text-white px-2.5 py-1 rounded-full text-[8px] md:text-[9px] font-black shadow-lg">แพงขึ้น {result.costMultiplier} เท่า!</div>
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-rose-50 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center text-rose-500 mb-3 md:mb-4 shadow-inner">
                      <span className="material-symbols-outlined text-2xl md:text-3xl">history_toggle_off</span>
                    </div>
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">เริ่มช้าไป 10 ปี</p>
                    <h4 className="text-2xl md:text-3xl font-black text-slate-800">฿{Math.ceil(result.monthlyLate).toLocaleString()}</h4>
                    <p className="text-[9px] md:text-[10px] font-bold text-rose-500 mt-2">ต้องเหนื่อยเพิ่มขึ้นมหาศาล</p>
                  </div>
                </div>

                {/* 📈 Mountain Chart Area */}
                <div className="bg-white/90 backdrop-blur-2xl p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border border-white h-[350px] md:h-[450px]">
                  <h4 className="font-black text-slate-800 mb-6 md:mb-8 flex items-center gap-2 md:gap-3 text-sm md:text-base">
                    <span className="material-symbols-outlined text-fuchsia-500 text-2xl md:text-3xl">landscape</span>
                    วิถีภูเขาเงินออม (Accumulation & Decumulation)
                  </h4>
                  <ResponsiveContainer width="100%" height="65%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorMountain" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d946ef" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="age" tick={{fontSize: 10, fontWeight: 'black', fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'black', fontSize: '12px' }} formatter={(v) => `฿${v.toLocaleString()}`} />
                      <ReferenceLine x={planInputs.retireAge} stroke="#f43f5e" strokeDasharray="5 5" strokeWidth={2}>
                        <Label value="เกษียณ" position="top" fill="#f43f5e" fontSize={10} fontWeight="black" />
                      </ReferenceLine>
                      <Area type="monotone" dataKey="fund" stroke="#d946ef" strokeWidth={4} fill="url(#colorMountain)" />
                    </AreaChart>
                  </ResponsiveContainer>
                  
                  <button onClick={saveToGoogleSheets} disabled={isSubmitting} className={`w-full mt-4 md:mt-6 py-4 md:py-5 font-black rounded-2xl md:rounded-[2rem] transition-all flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg shadow-xl active:scale-95 ${isSubmitting ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'}`}>
                    <span className="material-symbols-outlined text-xl md:text-2xl">{isSubmitting ? 'sync' : 'cloud_done'}</span>
                    {submitStatus || 'บันทึกเป้าหมายภูเขาเงินออม'}
                  </button>
                </div>
              </div>
            ) : (
              /* 🏔️ Placeholder State */
              <div className="h-full min-h-[400px] md:min-h-[500px] bg-white/80 rounded-[2.5rem] md:rounded-[3.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center p-8 md:p-12 text-slate-300 text-center space-y-4 md:space-y-6">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-full flex items-center justify-center animate-bounce">
                   <span className="material-symbols-outlined text-6xl md:text-7xl opacity-30">landscape</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xl md:text-2xl font-black uppercase tracking-widest text-slate-400">Ready to Climb?</p>
                  <p className="text-xs md:text-base font-bold max-w-xs mx-auto text-slate-400 leading-relaxed">ระบุแผนการใช้ชีวิตของคุณด้านบน <br/>เพื่อร่างวิถีภูเขาเงินออมส่วนบุคคล</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <HistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        userId={user.id} 
        moduleName="Module 4: Retirement Mountain" 
        GOOGLE_SCRIPT_URL={GOOGLE_SCRIPT_URL} 
      />
    </div>
  );
}

// ✅ ลด Padding ให้กรอกง่ายขึ้นในจอมือถือ
function InputField({ label, name, value, onChange, icon }) {
  return (
    <div className="space-y-1.5 pb-2">
      <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3 block">{label}</label>
      <div className="relative flex items-center group">
        <div className="absolute left-3 md:left-4 w-8 h-8 md:w-10 md:h-10 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-400 group-focus-within:bg-fuchsia-50 group-focus-within:text-fuchsia-500 transition-all duration-300">
          <span className="material-symbols-outlined text-[18px] md:text-[20px]">{icon}</span>
        </div>
        {/* ลด pl-12 ในมือถือ (จากเดิม pl-16) เพื่อให้พิมพ์ตัวเลขได้เยอะขึ้น */}
        <input 
          type="text" 
          name={name} 
          value={value === 0 ? '' : value} 
          onChange={onChange} 
          className="w-full pl-14 md:pl-16 pr-4 py-3 md:py-4 bg-slate-50 border border-slate-100 rounded-2xl md:rounded-[1.5rem] focus:ring-4 focus:ring-fuchsia-500/10 focus:bg-white focus:border-fuchsia-200 outline-none font-black text-slate-800 text-base md:text-lg transition-all shadow-inner placeholder:text-slate-200" 
          placeholder="0" 
        />
      </div>
    </div>
  );
}