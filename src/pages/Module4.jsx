import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import HistoryModal from '../components/HistoryModal';

export default function Module4RetirementPlanner({ user }) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const [calcMode, setCalcMode] = useState('FIND_TARGET');

  const [planInputs, setPlanInputs] = useState({
    currentAge: 25,
    retireAge: 60,
    lifeExpectancy: 80,
    monthlyExpense: 20000,
    targetFundInput: 10080000, 
    returnRate: 0 
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

  const [knowledgeIndex, setKnowledgeIndex] = useState(0);

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  const knowledgeData = [
    { icon: "elderly", title: "อายุยืนกว่าที่คิด", text: "ความก้าวหน้าทางการแพทย์ ทำให้คนมีแนวโน้มอายุยืนขึ้น ส่งผลให้เงินออมอาจไม่พอใช้" },
    { icon: "personal_injury", title: "ป่วยกะทันหัน", text: "การเจ็บป่วยหรือพบโรคใหม่ อาจต้องใช้เงินรักษาจำนวนมาก ซึ่งสวัสดิการที่มีอาจไม่เพียงพอ" },
    { icon: "trending_down", title: "แพ้เงินเฟ้อ", text: "คิดว่าเงินมีค่าเท่าเดิม แต่ของแพงขึ้น การเริ่มเก็บช้าทำให้เอาชนะเงินเฟ้อไม่ได้" },
    { icon: "warning", title: "ภัยการเงิน", text: "มิจฉาชีพมักจะเล็งผู้สูงวัยเป็นกลุ่มเป้าหมาย เพราะรู้ว่ามีเงินก้อนจากการเกษียณ" },
    { icon: "rocket_launch", title: "เริ่มออมเร็ว = เหนื่อยน้อยลง", text: "ในช่วงเริ่มทำงาน ค่าใช้จ่ายยังไม่มาก หากฝึกมีวินัย จะสร้างนิสัยออมเงินได้ดี" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setKnowledgeIndex((prev) => (prev + 1) % knowledgeData.length);
    }, 6000); 
    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    setPlanInputs({ ...planInputs, [name]: Number(sanitizedValue) });
  };

  const calculateRetirement = () => {
    const { currentAge, retireAge, lifeExpectancy, monthlyExpense, targetFundInput, returnRate } = planInputs;
    
    const r = returnRate / 100;
    const i = r / 12;
    let projection = [];

    if (calcMode === 'FIND_TARGET') {
      const yearsInRetirement = lifeExpectancy - retireAge;
      if (yearsInRetirement <= 0) return alert("อายุขัยคาดหวังต้องมากกว่าอายุเกษียณครับ");

      const monthsInRetirement = yearsInRetirement * 12;
      const targetFund = i === 0 
        ? monthlyExpense * monthsInRetirement 
        : (monthlyExpense * (1 - Math.pow(1 + i, -monthsInRetirement))) / i;

      let currentBalance = targetFund; 
      for (let age = retireAge; age <= lifeExpectancy; age++) {
        projection.push({ age, fund: Math.round(currentBalance), phase: 'ใช้เงิน' });
        currentBalance = (currentBalance - (monthlyExpense * 12)) * (1 + r);
        if (currentBalance < 0) currentBalance = 0;
      }

      setChartData(projection);
      setResult({ ...result, targetFund, isCalculated: true });

    } else if (calcMode === 'FIND_SAVING') {
      const yearsToSave = retireAge - currentAge;
      if (yearsToSave <= 0) return alert("อายุเกษียณต้องมากกว่าอายุปัจจุบันครับ");

      const n_acc = yearsToSave * 12;
      const monthlySaving = i === 0 
        ? targetFundInput / n_acc 
        : (targetFundInput * i) / (Math.pow(1 + i, n_acc) - 1);

      const yearsLate = Math.max(1, yearsToSave - 10);
      const n_late = yearsLate * 12;
      const monthlyLate = i === 0 
        ? targetFundInput / n_late 
        : (targetFundInput * i) / (Math.pow(1 + i, n_late) - 1);
      
      const costMultiplier = (monthlyLate / monthlySaving).toFixed(1);

      let currentBalance = 0;
      for (let age = currentAge; age <= retireAge; age++) {
        projection.push({ age, fund: Math.round(currentBalance), phase: 'สะสมเงิน' });
        currentBalance = (currentBalance + (monthlySaving * 12)) * (1 + r);
      }

      setChartData(projection);
      setResult({
        ...result,
        targetFund: targetFundInput,
        monthlySavingNeeded: monthlySaving,
        monthlyLate: monthlyLate,
        costMultiplier,
        isCalculated: true
      });
    }
  };

  const saveToGoogleSheets = async () => {
    setIsSubmitting(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST", mode: "no-cors",
        body: JSON.stringify({
          action: "save", userId: user.id,
          moduleName: `Module 4: ${calcMode}`,
          actionData: JSON.stringify({ ...planInputs, ...result }) 
        })
      });
      setSubmitStatus('บันทึกแผนสำเร็จ! ✅');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (error) { setSubmitStatus('ล้มเหลว ❌'); }
    finally { setIsSubmitting(false); }
  };

  const renderFormulaBox = () => {
    return (
      <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group mb-6 transition-all duration-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-[40px]"></div>
        
        <div className="flex items-center gap-3 mb-6 opacity-80 border-b border-white/10 pb-3">
          <span className="material-symbols-outlined text-fuchsia-400">functions</span>
          <p className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400">Mathematical Model</p>
        </div>

        {calcMode === 'FIND_TARGET' ? (
          <div className="animate-fadeIn">
            <p className="text-xs md:text-sm text-fuchsia-100/80 mb-3 font-bold text-center whitespace-nowrap mt-2">
              จำนวนเงินที่ต้องมี ณ วันเกษียณ
            </p>
            <div className="overflow-x-auto custom-scrollbar pb-2">
              <div className="flex items-center justify-center gap-1.5 md:gap-2 text-[11px] sm:text-sm md:text-base font-black text-fuchsia-50 whitespace-nowrap w-max mx-auto">
                <span className="text-fuchsia-400 font-bold">=</span>
                <span className="bg-white/10 px-2 md:px-3 py-1.5 rounded-lg border border-white/5">ใช้ต่อเดือน</span>
                <span className="text-fuchsia-400">×</span>
                <span className="bg-white/10 px-2 md:px-3 py-1.5 rounded-lg border border-white/5">12</span>
                <span className="text-fuchsia-400">×</span>
                <span className="bg-white/10 px-2 md:px-3 py-1.5 rounded-lg border border-white/5">ปีที่มีชีวิตหลังเกษียณ</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <p className="text-xs md:text-sm text-fuchsia-100/80 mb-3 font-bold text-center whitespace-nowrap mt-2">
              จำนวนเงินที่ต้องออมต่อเดือน <span className="opacity-70 font-normal">(แบบไม่คิดดอกเบี้ย)</span>
            </p>
            <div className="overflow-x-auto custom-scrollbar pb-2">
              <div className="flex items-center justify-center gap-3 text-[11px] sm:text-sm md:text-base font-black text-fuchsia-50 whitespace-nowrap w-max mx-auto">
                <span className="text-fuchsia-400 font-bold">=</span>
                <div className="flex flex-col items-center">
                  <div className="border-b-2 border-fuchsia-400/50 pb-1.5 px-4 mb-1.5">
                    จำนวนเงินที่ต้องมี ณ วันเกษียณ
                  </div>
                  <div className="flex items-center gap-1.5">
                    จำนวนปีที่ทำงาน <span className="text-fuchsia-400">×</span> 12
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-10 px-4 md:px-10 font-sans animate-fadeIn relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-[30rem] md:w-[40rem] h-[30rem] md:h-[40rem] bg-rose-100/40 rounded-full blur-[80px] md:blur-[120px] -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-[25rem] md:w-[35rem] h-[25rem] md:h-[35rem] bg-fuchsia-50/60 rounded-full blur-[80px] md:blur-[100px] -ml-32 -mb-32"></div>

      <div className="max-w-7xl mx-auto space-y-8 md:space-y-10 relative z-10">
        
        {/* Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/60 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-white shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-fuchsia-500 to-rose-500 rounded-2xl md:rounded-3xl flex items-center justify-center text-white text-4xl md:text-5xl shadow-xl shadow-fuchsia-500/20 group hover:scale-110 transition-transform duration-500 shrink-0">
              <span className="material-symbols-outlined text-4xl md:text-5xl">landscape</span>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight pb-1 md:pb-2 pr-2 md:pr-4 leading-tight">Retirement Planner</h2>
              <p className="text-slate-500 font-bold italic text-xs md:text-base">วางแผนเกษียณตามหลักสูตร สสวท.</p>
            </div>
          </div>
          <button onClick={() => setIsHistoryOpen(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm w-full md:w-auto">
            <span className="material-symbols-outlined text-fuchsia-500">history</span> ประวัติการบันทึก
          </button>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
          
          {/* 📥 Left Side: Input Fields */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/90 backdrop-blur-2xl p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border border-white space-y-6">
              
              <div className="space-y-2 md:space-y-3">
                <label className="text-[10px] md:text-xs font-black text-fuchsia-600 normal-case tracking-[0.3em] ml-2 md:ml-3">เลือกรูปแบบการคำนวณ (ตามหนังสือ)</label>
                <div className="relative group">
                  <select 
                    value={calcMode} 
                    onChange={(e) => { setCalcMode(e.target.value); setResult({ ...result, isCalculated: false }); }} 
                    className="w-full px-5 md:px-6 py-3 md:py-4 bg-fuchsia-50 border border-fuchsia-100 rounded-2xl md:rounded-3xl font-black text-fuchsia-900 outline-none focus:ring-4 focus:ring-fuchsia-500/20 transition-all appearance-none cursor-pointer pr-12 shadow-inner text-sm md:text-base"
                  >
                    <option value="FIND_TARGET">🎯 แบบที่ 1: หาเงินก้อนที่ต้องมี ณ วันเกษียณ</option>
                    <option value="FIND_SAVING">💰 แบบที่ 2: หาจำนวนเงินที่ต้องออมต่อเดือน</option>
                  </select>
                  <div className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 pointer-events-none text-fuchsia-500">
                    <span className="material-symbols-outlined font-black">expand_more</span>
                  </div>
                </div>
              </div>
              
              {renderFormulaBox()}
              
              <div className="space-y-4 animate-fadeIn">
                {calcMode === 'FIND_TARGET' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="อายุเกษียณ" name="retireAge" value={planInputs.retireAge} onChange={handleInputChange} icon="flag" />
                      <InputField label="อายุขัยคาดหวัง" name="lifeExpectancy" value={planInputs.lifeExpectancy} onChange={handleInputChange} icon="favorite" />
                    </div>
                    <InputField label="ค่าใช้จ่ายหลังเกษียณ (บาท/เดือน)" name="monthlyExpense" value={planInputs.monthlyExpense} onChange={handleInputChange} icon="payments" />
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="อายุปัจจุบัน" name="currentAge" value={planInputs.currentAge} onChange={handleInputChange} icon="person" />
                      <InputField label="อายุเกษียณ" name="retireAge" value={planInputs.retireAge} onChange={handleInputChange} icon="flag" />
                    </div>
                    <InputField label="จำนวนเงินที่ต้องมี ณ วันเกษียณ" name="targetFundInput" value={planInputs.targetFundInput} onChange={handleInputChange} icon="account_balance" />
                  </>
                )}
                
                <InputField label="ผลตอบแทนการลงทุน (% ต่อปี) *ใส่ 0 เพื่อคิดตามหนังสือ" name="returnRate" value={planInputs.returnRate} onChange={handleInputChange} icon="trending_up" />
              </div>

              <button onClick={calculateRetirement} className="w-full py-5 md:py-6 bg-slate-900 text-white font-black rounded-[1.5rem] md:rounded-3xl shadow-xl hover:bg-fuchsia-600 hover:scale-[1.02] transition-all active:scale-95 text-xl md:text-2xl tracking-tight flex items-center justify-center gap-3 group mt-4">
                <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">calculate</span>
                คำนวณผลลัพธ์
              </button>
            </div>

            {/* 💡 Knowledge Box */}
            <div className="bg-gradient-to-r from-fuchsia-50 to-rose-50 border border-fuchsia-100 p-6 rounded-[2rem] shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border border-fuchsia-100 text-fuchsia-500">
                <span className="material-symbols-outlined text-2xl">{knowledgeData[knowledgeIndex].icon}</span>
              </div>
              <div>
                <h4 className="text-sm font-black text-fuchsia-900 mb-1">ความรู้เสริม: {knowledgeData[knowledgeIndex].title}</h4>
                <p className="text-xs font-bold text-slate-600 leading-relaxed">{knowledgeData[knowledgeIndex].text}</p>
              </div>
            </div>
          </div>

          {/* 🏔️ Right Side: Visualizing the Mountain */}
          <div className="lg:col-span-7">
            {result.isCalculated ? (
              <div className="space-y-6 md:space-y-8 animate-fadeIn">
                
                {/* 💰 Hero Result Card */}
                {calcMode === 'FIND_TARGET' ? (
                  <div className="bg-gradient-to-br from-fuchsia-600 to-rose-600 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
                    <p className="text-rose-100 font-black text-[11px] uppercase tracking-[0.4em] mb-3 opacity-80">ยอดเงินที่ต้องมี ณ วันเกษียณ</p>
                    <h3 className="text-5xl md:text-7xl font-black tracking-tighter pb-4 leading-tight break-words">
                      ฿{Math.round(result.targetFund).toLocaleString()}
                    </h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-xl flex flex-col items-center text-center group hover:scale-[1.05] transition-all duration-500">
                      <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-3 shadow-inner">
                        <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">เริ่มออมวันนี้</p>
                      <h4 className="text-2xl md:text-3xl font-black text-slate-800">฿{Math.ceil(result.monthlySavingNeeded).toLocaleString()}/ด.</h4>
                    </div>
                    
                    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-xl flex flex-col items-center text-center group hover:scale-[1.05] transition-all duration-500 relative overflow-hidden">
                      <div className="absolute top-3 right-3 bg-rose-500 text-white px-2.5 py-1 rounded-full text-[9px] font-black shadow-lg">แพงขึ้น {result.costMultiplier} เท่า!</div>
                      <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-3 shadow-inner">
                        <span className="material-symbols-outlined text-2xl">history_toggle_off</span>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ถ้าเริ่มช้าไป 10 ปี</p>
                      <h4 className="text-2xl md:text-3xl font-black text-slate-800">฿{Math.ceil(result.monthlyLate).toLocaleString()}/ด.</h4>
                    </div>
                  </div>
                )}

                {/* 📈 Chart Area */}
                <div className="bg-white/90 backdrop-blur-2xl p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border border-white h-[350px] md:h-[450px] flex flex-col">
                  <h4 className="font-black text-slate-800 mb-6 md:mb-8 flex items-center gap-2 text-sm md:text-base">
                    <span className="material-symbols-outlined text-fuchsia-500 text-2xl">landscape</span>
                    {calcMode === 'FIND_TARGET' ? 'ช่วงใช้เงิน (ภูเขาขาลง)' : 'ช่วงออมเงิน (ภูเขาขาขึ้น)'}
                  </h4>
                  <ResponsiveContainer width="100%" height="65%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorMountain" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={calcMode === 'FIND_TARGET' ? "#f43f5e" : "#d946ef"} stopOpacity={0.6}/>
                          <stop offset="95%" stopColor={calcMode === 'FIND_TARGET' ? "#f43f5e" : "#d946ef"} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      
                      {/* ✅ แสดงอายุที่เส้นแกน X */}
                      <XAxis dataKey="age" tick={{fontSize: 10, fontWeight: 'black', fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      
                      {/* ✅ แปลงข้อความ Tooltip เป็นภาษาไทย และเพิ่มคำว่า "อายุ" ให้ชัดเจน */}
                      <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'black', fontSize: '12px' }} 
                        formatter={(value) => [`฿${value.toLocaleString()}`, 'เงินคงเหลือ']} 
                        labelFormatter={(label) => `อายุ ${label} ปี`}
                      />
                      
                      {calcMode === 'FIND_SAVING' && (
                        <ReferenceLine x={planInputs.retireAge} stroke="#f43f5e" strokeDasharray="5 5" strokeWidth={2}>
                          <Label value="เกษียณ" position="top" fill="#f43f5e" fontSize={10} fontWeight="black" />
                        </ReferenceLine>
                      )}
                      
                      <Area type="monotone" dataKey="fund" stroke={calcMode === 'FIND_TARGET' ? "#f43f5e" : "#d946ef"} strokeWidth={4} fill="url(#colorMountain)" />
                    </AreaChart>
                  </ResponsiveContainer>
                  
                  <button onClick={saveToGoogleSheets} disabled={isSubmitting} className={`w-full mt-4 md:mt-6 py-4 md:py-5 font-black rounded-2xl md:rounded-[2rem] transition-all flex items-center justify-center gap-2 text-base md:text-lg shadow-xl active:scale-95 ${isSubmitting ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'}`}>
                    <span className="material-symbols-outlined text-xl">{isSubmitting ? 'sync' : 'cloud_done'}</span>
                    {submitStatus || 'บันทึกเป้าหมายภูเขาเงินออม'}
                  </button>
                </div>
              </div>
            ) : (
              /* 🏔️ Placeholder State */
              <div className="h-full min-h-[400px] md:min-h-[500px] bg-white/80 rounded-[2.5rem] md:rounded-[3.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center p-8 md:p-12 text-slate-300 text-center space-y-4">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center animate-bounce">
                   <span className="material-symbols-outlined text-6xl opacity-30">landscape</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-black uppercase tracking-widest text-slate-400">Ready to Climb?</p>
                  <p className="text-sm font-bold max-w-xs mx-auto text-slate-400">เลือกรูปแบบด้านซ้ายเพื่อดูภาพภูเขาเงินออมของคุณ</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} userId={user.id} moduleName="Module 4: Retirement Mountain" GOOGLE_SCRIPT_URL={GOOGLE_SCRIPT_URL} />
    </div>
  );
}

function InputField({ label, name, value, onChange, icon }) {
  return (
    <div className="space-y-1.5 pb-2">
      <label className="text-[10px] md:text-[11px] font-black text-slate-400 normal-case tracking-widest ml-3 block">{label}</label>
      <div className="relative flex items-center group">
        <div className="absolute left-3 md:left-4 w-8 h-8 md:w-10 md:h-10 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-400 group-focus-within:bg-fuchsia-50 group-focus-within:text-fuchsia-500 transition-all duration-300">
          <span className="material-symbols-outlined text-[18px] md:text-[20px]">{icon}</span>
        </div>
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