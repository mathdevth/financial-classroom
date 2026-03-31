import React, { useState, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import HistoryModal from '../components/HistoryModal';

export default function Module3TVMCalculator({ user }) {
  const [calcType, setCalcType] = useState('FV_SINGLE');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const [inputs, setInputs] = useState({
    amount: 0,
    rate: 5,
    years: 10,
    k: 1 
  });

  const [result, setResult] = useState({
    calculatedValue: 0, 
    totalInvested: 0,
    isCalculated: false
  });

  const [chartData, setChartData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  const k_val = Math.max(1, inputs.k);
  const n_total = inputs.years * k_val;

  const calculateTVM = () => {
    const P_input = inputs.amount; 
    const rate_annual = inputs.rate / 100; 
    const n_years = inputs.years; 
    const k = Math.max(1, inputs.k); 

    const r_period = rate_annual / k; 
    const n_periods = n_years * k;

    if (n_years <= 0) return;

    let projection = [];
    let finalValue = 0;

    for (let year = 0; year <= n_years; year++) {
      const current_n = year * k;
      let currentAmount = 0;

      if (calcType === 'FV_SINGLE') {
        currentAmount = P_input * Math.pow((1 + (rate_annual / k)), current_n);
      } 
      else if (calcType === 'PV_SINGLE') {
        const PV_required = P_input * Math.pow((1 + (rate_annual / k)), -(k * n_years));
        currentAmount = PV_required * Math.pow((1 + (rate_annual / k)), current_n);
        if (year === n_years) finalValue = PV_required; 
      } 
      else if (calcType === 'FVA_ORD') {
        currentAmount = year === 0 ? 0 : P_input * ((Math.pow((1 + r_period), current_n) - 1) / r_period);
      } 
      else if (calcType === 'FVA_DUE') {
        currentAmount = year === 0 ? 0 : P_input * (1 + r_period) * ((Math.pow((1 + r_period), current_n) - 1) / r_period);
      }

      projection.push({
        label: `ปีที่ ${year}`,
        value: Math.round(currentAmount)
      });
      
      if (calcType !== 'PV_SINGLE' && year === n_years) finalValue = currentAmount;
    }

    setChartData(projection);
    setResult({
      calculatedValue: finalValue,
      totalInvested: (calcType === 'FV_SINGLE' || calcType === 'PV_SINGLE') ? (calcType === 'FV_SINGLE' ? P_input : finalValue) : P_input * n_periods,
      isCalculated: true
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    setInputs({ ...inputs, [name]: Number(sanitizedValue) });
  };

  const saveToGoogleSheets = async () => {
    setIsSubmitting(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, { 
        method: "POST", mode: "no-cors", 
        body: JSON.stringify({ 
          action: "save", userId: user.id, 
          moduleName: "Module 3: TVM Calculator", 
          actionData: JSON.stringify({ calcType, inputs }) 
        }) 
      });
      setSubmitStatus('บันทึกสำเร็จ! ✅');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (e) { setSubmitStatus('ผิดพลาด ❌'); }
    finally { setIsSubmitting(false); }
  };

  const renderVisualFormula = () => {
    const isSingle = calcType === 'FV_SINGLE' || calcType === 'PV_SINGLE';
    return (
      <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px]"></div>
        
        <div className="flex items-center gap-3 mb-6 opacity-80 border-b border-white/10 pb-3">
          <span className="material-symbols-outlined text-emerald-400">functions</span>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Mathematical Model</p>
        </div>

        <div className="flex items-center justify-center text-xl md:text-3xl font-black italic text-emerald-100 py-4">
          {calcType === 'FV_SINGLE' && (
            <>
              <span>S = P</span>
              <span className="text-4xl md:text-5xl font-light mx-1 md:mx-2 -mt-1 md:-mt-2">(</span>
              <div className="flex items-center">
                <span>1 +&nbsp;</span>
                <div className="flex flex-col items-center text-lg md:text-2xl mt-1">
                  <span className="border-b-2 border-emerald-400 px-2 pb-0.5 leading-none">r</span>
                  <span className="pt-0.5 leading-none">k</span>
                </div>
              </div>
              <span className="text-4xl md:text-5xl font-light mx-1 md:mx-2 -mt-1 md:-mt-2">)</span>
              <sup className="text-sm md:text-lg -mt-6 md:-mt-8">kn</sup>
            </>
          )}

          {calcType === 'PV_SINGLE' && (
            <>
              <span>P = S</span>
              <span className="text-4xl md:text-5xl font-light mx-1 md:mx-2 -mt-1 md:-mt-2">(</span>
              <div className="flex items-center">
                <span>1 +&nbsp;</span>
                <div className="flex flex-col items-center text-lg md:text-2xl mt-1">
                  <span className="border-b-2 border-emerald-400 px-2 pb-0.5 leading-none">r</span>
                  <span className="pt-0.5 leading-none">k</span>
                </div>
              </div>
              <span className="text-4xl md:text-5xl font-light mx-1 md:mx-2 -mt-1 md:-mt-2">)</span>
              <sup className="text-sm md:text-lg -mt-6 md:-mt-8">-kn</sup>
            </>
          )}

          {calcType === 'FVA_ORD' && (
            <>
              <span className="mr-3 md:mr-4 not-italic font-bold text-lg md:text-2xl">เงินรวม =</span>
              <div className="flex flex-col items-center">
                <div className="border-b-2 border-emerald-400 px-2 md:px-4 pb-1 md:pb-2 flex items-center">
                  <span>R</span>
                  <span className="text-3xl md:text-5xl font-light mx-1 md:mx-2 mt-[-4px] md:mt-[-8px]">(</span>
                  <span>(1+r)</span><sup className="text-xs md:text-sm -mt-4 md:-mt-5">n</sup>
                  <span>&nbsp;- 1</span>
                  <span className="text-3xl md:text-5xl font-light mx-1 md:mx-2 mt-[-4px] md:mt-[-8px]">)</span>
                </div>
                <span className="pt-1 md:pt-2">r</span>
              </div>
            </>
          )}

          {calcType === 'FVA_DUE' && (
            <>
              <span className="mr-3 md:mr-4 not-italic font-bold text-lg md:text-2xl">เงินรวม =</span>
              <div className="flex flex-col items-center">
                <div className="border-b-2 border-emerald-400 px-2 md:px-4 pb-1 md:pb-2 flex items-center">
                  <span>R(1+r)</span>
                  <span className="text-3xl md:text-5xl font-light mx-1 md:mx-2 mt-[-4px] md:mt-[-8px]">(</span>
                  <span>(1+r)</span><sup className="text-xs md:text-sm -mt-4 md:-mt-5">n</sup>
                  <span>&nbsp;- 1</span>
                  <span className="text-3xl md:text-5xl font-light mx-1 md:mx-2 mt-[-4px] md:mt-[-8px]">)</span>
                </div>
                <span className="pt-1 md:pt-2">r</span>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 bg-white/5 p-4 rounded-xl border border-white/10 text-[10px] md:text-xs font-bold space-y-1.5 text-slate-300">
          {isSingle ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <li><strong className="text-emerald-300 text-sm">S</strong> = มูลค่าอนาคต (เงินรวม)</li>
              <li><strong className="text-emerald-300 text-sm">P</strong> = มูลค่าปัจจุบัน (เงินต้น)</li>
              <li><strong className="text-emerald-300 text-sm">r</strong> = อัตราดอกเบี้ยต่อปี (เช่น 5% คือ 0.05)</li>
              <li><strong className="text-emerald-300 text-sm">k</strong> = จำนวนครั้งที่ทบต้นใน 1 ปี</li>
              <li><strong className="text-emerald-300 text-sm">n</strong> = จำนวนปี</li>
            </ul>
          ) : (
            <ul className="grid grid-cols-1 gap-2">
              <li><strong className="text-emerald-300 text-sm">R</strong> = เงินรับหรือจ่ายแต่ละงวด (เท่ากันทุกงวด)</li>
              <li><strong className="text-emerald-300 text-sm">r</strong> = อัตราดอกเบี้ยต่องวด (ดอกเบี้ยต่อปี / งวดต่อปี)</li>
              <li><strong className="text-emerald-300 text-sm">n</strong> = จำนวนงวดทั้งหมด (จำนวนปี × งวดต่อปี)</li>
            </ul>
          )}
        </div>
      </div>
    );
  };

  const getInputLabel = () => {
    if (calcType === 'FV_SINGLE') return "เงินต้น (P)";
    if (calcType === 'PV_SINGLE') return "เงินรวม (S)";
    return "ค่างวดแต่ละงวด (R)";
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-10 px-3 md:px-10 font-sans animate-fadeIn relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[30rem] md:w-[45rem] h-[30rem] md:h-[45rem] bg-emerald-100/40 rounded-full blur-[80px] md:blur-[120px] -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-[25rem] md:w-[35rem] h-[25rem] md:h-[35rem] bg-blue-50/60 rounded-full blur-[80px] md:blur-[100px] -ml-32 -mb-32"></div>

      <div className="max-w-7xl mx-auto space-y-8 md:space-y-10 relative z-10">
        
        {/* Header Section */}
        <section className="bg-white/60 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl md:rounded-3xl flex items-center justify-center text-white text-3xl md:text-5xl shadow-xl shadow-emerald-500/20 shrink-0">
              <span className="material-symbols-outlined">speed</span>
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">TVM Calculator</h2>
              <p className="text-slate-500 font-bold italic text-[10px] md:text-base">จำลองมูลค่าเงินตามเวลาด้วยสูตรคณิตศาสตร์</p>
            </div>
          </div>
          <button onClick={() => setIsHistoryOpen(true)} className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 text-xs md:text-sm font-black rounded-xl hover:bg-slate-50 transition-all shadow-sm w-full md:w-auto">
            <span className="material-symbols-outlined text-emerald-500 text-lg">history</span> ประวัติ
          </button>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
          
          {/* 📥 Input Side */}
          <div className="lg:col-span-5 space-y-6 md:space-y-8">
            <div className="bg-white/90 backdrop-blur-2xl p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl border border-white space-y-6 md:space-y-8">
              
              <div className="space-y-2 md:space-y-3">
                <label className="text-[10px] md:text-xs font-black text-emerald-600 normal-case tracking-[0.3em] ml-2 md:ml-3">โหมดการคำนวณ</label>
                <div className="relative group">
                  <select 
                    value={calcType} 
                    onChange={(e) => { setCalcType(e.target.value); setResult({ ...result, isCalculated: false }); }} 
                    className="w-full px-5 md:px-6 py-3 md:py-4 bg-slate-50 border border-slate-100 rounded-2xl md:rounded-3xl font-black text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer pr-12 shadow-inner text-sm md:text-base"
                  >
                    <option value="FV_SINGLE">💰 มูลค่าอนาคตของเงินต้น (หา S)</option>
                    <option value="PV_SINGLE">🎯 มูลค่าปัจจุบันของเงินรวม (หา P)</option>
                    <option value="FVA_ORD">📈 เงินรวมของค่างวด (รับ/จ่ายตอนสิ้นงวด)</option>
                    <option value="FVA_DUE">🚀 เงินรวมของค่างวด (รับ/จ่ายตอนต้นงวด)</option>
                  </select>
                  <div className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500">
                    <span className="material-symbols-outlined font-black">expand_more</span>
                  </div>
                </div>
              </div>

              {renderVisualFormula()}

              <div className="space-y-4 md:space-y-6">
                <InputField label={getInputLabel()} name="amount" value={inputs.amount} onChange={handleInputChange} icon="payments" />
                <InputField label="อัตราดอกเบี้ยต่อปี (%) (r)" name="rate" value={inputs.rate} onChange={handleInputChange} icon="percent" />
                
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="ระยะเวลา (ปี) (n)" name="years" value={inputs.years} onChange={handleInputChange} icon="calendar_month" />
                  <InputField label="จำนวนงวดต่อปี (k)" name="k" value={inputs.k} onChange={handleInputChange} icon="repeat" />
                </div>
                <p className="text-[9px] md:text-[10px] text-slate-400 font-bold text-center">
                  *เคล็ดลับ: ทบต้นรายเดือน k=12, รายไตรมาส k=4, รายปี k=1
                </p>
              </div>

              <button onClick={calculateTVM} className="w-full py-4 md:py-6 bg-slate-900 text-white font-black rounded-2xl md:rounded-3xl shadow-xl hover:bg-emerald-600 hover:scale-[1.02] transition-all active:scale-95 text-lg md:text-2xl flex items-center justify-center gap-3">
                 <span className="material-symbols-outlined">rocket_launch</span> คำนวณผลลัพธ์
              </button>
            </div>
          </div>

          {/* 🏔️ Result Side */}
          <div className="lg:col-span-7">
            {result.isCalculated ? (
              <div className="space-y-6 md:space-y-8 animate-fadeIn">
                
                {/* 💰 Hero Result Card */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 md:p-12 rounded-[2rem] md:rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-10 -top-10 md:-right-20 md:-top-20 w-40 h-40 md:w-64 md:h-64 bg-white/10 rounded-full blur-[60px]"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10 border-b border-white/10 pb-4 md:pb-6 mb-4 md:mb-6">
                     <div>
                       <p className="text-emerald-200 font-black text-[10px] md:text-xs uppercase tracking-widest mb-1 md:mb-2">
                         {calcType === 'PV_SINGLE' ? 'มูลค่าปัจจุบัน (P) ที่ต้องใช้' : `มูลค่าอนาคต (S) ที่จะได้รับ`}
                       </p>
                       <h3 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter break-words">
                         ฿{result.calculatedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                       </h3>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 relative z-10 text-emerald-50">
                    <div>
                      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-70">เงินต้นทั้งหมดที่ใช้</p>
                      <p className="text-lg md:text-xl font-bold">฿{result.totalInvested.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-70">ดอกเบี้ยสุทธิ (กำไร)</p>
                      <p className="text-lg md:text-xl font-bold">฿{Math.max(0, result.calculatedValue - result.totalInvested).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>

                {/* 📈 Chart Area */}
                <div className="bg-white/90 backdrop-blur-2xl p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] shadow-xl border border-white h-[350px] md:h-[450px] flex flex-col">
                  <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2 text-sm md:text-base">
                    <span className="material-symbols-outlined text-emerald-500 text-2xl">analytics</span> กราฟแสดงวิถีการเติบโต
                  </h4>
                  <ResponsiveContainer width="100%" height="70%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{fontSize: 9, fontWeight: 'black', fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      
                      {/* ✅ เปลี่ยนข้อความตรงนี้ให้แปลไทยเป็นคำว่า "มูลค่าเงิน" เรียบร้อยแล้วครับ */}
                      <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'black', fontSize: '12px' }} 
                        formatter={(value) => [`฿${value.toLocaleString()}`, 'มูลค่าเงิน']} 
                      />
                      
                      <Area type="monotone" dataKey="value" stroke="#059669" strokeWidth={4} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                  
                  <button onClick={saveToGoogleSheets} disabled={isSubmitting} className={`w-full mt-4 md:mt-6 py-3 md:py-5 font-black rounded-xl md:rounded-2xl transition-all flex items-center justify-center gap-2 text-sm md:text-lg shadow-xl active:scale-95 ${isSubmitting ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}`}>
                    <span className="material-symbols-outlined text-lg md:text-2xl">{isSubmitting ? 'sync' : 'cloud_done'}</span>
                    {submitStatus || 'บันทึกข้อมูลลงฐานระบบ'}
                  </button>
                </div>
              </div>
            ) : (
              /* ⏳ Placeholder State */
              <div className="h-full min-h-[400px] md:min-h-[500px] bg-white/80 rounded-[2.5rem] md:rounded-[3.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center p-8 text-slate-300 text-center space-y-4">
                <div className="w-20 h-20 md:w-28 md:h-28 bg-slate-50 rounded-full flex items-center justify-center animate-bounce">
                   <span className="material-symbols-outlined text-5xl md:text-6xl opacity-30">account_balance_wallet</span>
                </div>
                <div className="space-y-2">
                  <p className="text-lg md:text-xl font-black uppercase tracking-widest text-slate-400">Ready to Compute</p>
                  <p className="text-xs md:text-sm font-bold text-slate-400">กรอกตัวแปรให้ครบ แล้วกดปุ่มคำนวณครับ</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} userId={user.id} moduleName="Module 3: TVM Calculator" GOOGLE_SCRIPT_URL={GOOGLE_SCRIPT_URL} />
    </div>
  );
}

function InputField({ label, name, value, onChange, icon }) {
  return (
    <div className="space-y-1.5 pb-2">
      <label className="text-[10px] md:text-[11px] font-black text-emerald-700 normal-case tracking-wide ml-1 md:ml-2 block pb-1">{label}</label>
      <div className="relative flex items-center group">
        <div className="absolute left-2 md:left-3 w-8 h-8 md:w-10 md:h-10 bg-emerald-100 rounded-lg md:rounded-xl flex items-center justify-center text-emerald-600 transition-all duration-300">
          <span className="material-symbols-outlined text-[16px] md:text-[20px]">{icon}</span>
        </div>
        <input 
          type="text" 
          name={name} 
          value={value === 0 ? '' : value} 
          onChange={onChange} 
          className="w-full pl-12 md:pl-16 pr-4 py-3 md:py-4 bg-emerald-50/50 border border-emerald-100 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-emerald-500/50 outline-none font-black text-emerald-900 text-sm md:text-lg transition-all shadow-inner placeholder:text-emerald-200" 
          placeholder="0" 
        />
      </div>
    </div>
  );
}