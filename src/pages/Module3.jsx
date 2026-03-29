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
    everyXMonths: 1 
  });

  const [result, setResult] = useState({
    futureValue: 0,
    totalInvested: 0,
    isCalculated: false
  });

  const [chartData, setChartData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  const k = inputs.everyXMonths > 0 ? 12 / inputs.everyXMonths : 12;
  const n_total = inputs.years * k;

  const calculateTVM = () => {
    const r = inputs.rate / 100;
    const interval = inputs.everyXMonths > 0 ? inputs.everyXMonths : 1;
    const k_val = 12 / interval;
    const p = inputs.amount;
    const i = r / k_val;
    const n = inputs.years * k_val;

    if (n <= 0) return;

    let projection = [];
    let finalValue = 0;

    for (let year = 0; year <= inputs.years; year++) {
      const current_n = year * k_val;
      let currentFV = 0;

      if (calcType === 'FV_SINGLE') {
        currentFV = p * Math.pow((1 + i), current_n);
      } else if (calcType === 'PV_SINGLE') {
        const pv = p / Math.pow((1 + i), n);
        currentFV = pv * Math.pow((1 + i), current_n);
      } else if (calcType === 'FVA_ORD') {
        currentFV = year === 0 ? 0 : p * ((Math.pow((1 + i), current_n) - 1) / i);
      } else if (calcType === 'FVA_DUE') {
        currentFV = year === 0 ? 0 : p * (1 + i) * ((Math.pow((1 + i), current_n) - 1) / i);
      }

      projection.push({
        label: `ปีที่ ${year}`,
        value: Math.round(currentFV)
      });
      if (year === inputs.years) finalValue = currentFV;
    }

    setChartData(projection);
    setResult({
      futureValue: finalValue,
      totalInvested: (calcType === 'FV_SINGLE' || calcType === 'PV_SINGLE') ? (calcType === 'FV_SINGLE' ? p : p / Math.pow(1+i, n)) : p * n,
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
    const style = "flex items-center justify-center gap-2 text-base md:text-xl font-black italic text-emerald-200 py-2";
    if (calcType === 'FV_SINGLE') return <div className={style}>FV = PV (1 + i)ⁿ</div>;
    if (calcType === 'PV_SINGLE') return <div className={style}>PV = FV / (1 + i)ⁿ</div>;
    return <div className={style}>FVA = PMT × [((1+i)ⁿ - 1) / i]</div>;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-10 px-4 md:px-10 font-sans animate-fadeIn relative overflow-hidden">
      
      {/* 🔮 Background Decor */}
      <div className="absolute top-0 right-0 w-[30rem] md:w-[45rem] h-[30rem] md:h-[45rem] bg-emerald-100/40 rounded-full blur-[80px] md:blur-[120px] -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-[25rem] md:w-[35rem] h-[25rem] md:h-[35rem] bg-blue-50/60 rounded-full blur-[80px] md:blur-[100px] -ml-32 -mb-32"></div>

      <div className="max-w-7xl mx-auto space-y-8 md:space-y-10 relative z-10">
        
        {/* Header Section */}
        <section className="bg-white/60 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-white shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl md:rounded-3xl flex items-center justify-center text-white text-4xl md:text-5xl shadow-xl shadow-emerald-500/20 group hover:scale-110 transition-transform duration-500 shrink-0">
              <span className="material-symbols-outlined text-4xl md:text-5xl">speed</span>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight pb-1 md:pb-2 pr-2 md:pr-4 leading-tight">Wealth Simulator</h2>
              <p className="text-slate-500 font-bold italic text-xs md:text-base">จำลองพลังดอกเบี้ยทบต้นและมูลค่าเงินตามเวลา</p>
            </div>
          </div>
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm w-full md:w-auto"
          >
            <span className="material-symbols-outlined text-emerald-500">history</span> 
            ดูประวัติการจำลอง
          </button>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
          
          {/* 📥 Input Side */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white/90 backdrop-blur-2xl p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl shadow-slate-200/40 border border-white space-y-6 md:space-y-8 text-slate-800">
              
              <div className="space-y-3 md:space-y-4">
                <label className="text-[10px] md:text-xs font-black text-emerald-600 uppercase tracking-[0.3em] ml-2 md:ml-3">โหมดการคำนวณ</label>
                <div className="relative group">
                  <select 
                    value={calcType} 
                    onChange={(e) => { setCalcType(e.target.value); setResult({ ...result, isCalculated: false }); }} 
                    className="w-full px-5 md:px-6 py-3 md:py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer pr-12 shadow-inner text-sm md:text-base"
                  >
                    <option value="FV_SINGLE">💰 เงินก้อนเดียว (Future Value)</option>
                    <option value="PV_SINGLE">🎯 หาเงินต้นที่ต้องใช้ (Present Value)</option>
                    <option value="FVA_ORD">📈 ออมรายงวด (Ordinary Annuity)</option>
                    <option value="FVA_DUE">🚀 ออมรายงวด (ต้นงวด)</option>
                  </select>
                  <div className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500 transition-transform group-hover:translate-y-[-30%]">
                    <span className="material-symbols-outlined font-black">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Formula & Metadata Box */}
              <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-emerald-500/10 rounded-full blur-[40px] md:blur-3xl"></div>
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest text-center mb-3 md:mb-4 opacity-70">Mathematical Model</p>
                {renderVisualFormula()}
                <div className="pt-4 md:pt-6 mt-4 md:mt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">งวดต่อปี (k)</p>
                    <p className="text-xl md:text-2xl font-black text-white">{k.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">รวมทั้งสิ้น (n)</p>
                    <p className="text-xl md:text-2xl font-black text-white">{n_total.toFixed(0)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                <InputField label={calcType === 'PV_SINGLE' ? "เป้าหมายเงินในอนาคต (FV)" : "จำนวนเงิน (PV หรือ PMT)"} name="amount" value={inputs.amount} onChange={handleInputChange} icon="payments" />
                <InputField label="ดอกเบี้ยต่อปี (%)" name="rate" value={inputs.rate} onChange={handleInputChange} icon="percent" />
                
                {/* ✅ เปลี่ยนให้เรียงซ้อนกัน 1 คอลัมน์ในจอมือถือ (sm:grid-cols-2) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <InputField label="ระยะเวลา (ปี)" name="years" value={inputs.years} onChange={handleInputChange} icon="calendar_month" />
                  <InputField label="คิดดอกทุกๆ (เดือน)" name="everyXMonths" value={inputs.everyXMonths} onChange={handleInputChange} icon="schedule" />
                </div>
              </div>

              <button onClick={calculateTVM} className="w-full py-5 md:py-6 bg-slate-900 text-white font-black rounded-[1.5rem] md:rounded-3xl shadow-xl hover:bg-emerald-600 hover:scale-[1.02] transition-all active:scale-95 text-xl md:text-2xl flex items-center justify-center gap-3 md:gap-4 group mt-4">
                 <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">rocket_launch</span>
                 รันแบบจำลองความมั่งคั่ง
              </button>
            </div>
          </div>

          {/* 🏔️ Result Side */}
          <div className="lg:col-span-7">
            {result.isCalculated ? (
              <div className="space-y-6 md:space-y-8 animate-fadeIn">
                
                {/* 💰 Hero Result Card */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-10 -top-10 md:-right-20 md:-top-20 w-40 h-40 md:w-64 md:h-64 bg-white/10 rounded-full blur-[60px] md:blur-[80px]"></div>
                  <p className="text-emerald-100 font-black text-[9px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] mb-2 md:mb-3 opacity-80">
                    {calcType === 'PV_SINGLE' ? 'เงินต้นที่คุณต้องเริ่มออม' : `มูลค่าในอนาคตเมื่อครบ ${inputs.years} ปี`}
                  </p>
                  <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter pb-2 md:pb-4 pr-2 md:pr-12 leading-tight break-words">
                    ฿{result.futureValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 md:mt-4 px-3 md:px-4 py-1.5 md:py-2 bg-white/10 rounded-full w-fit backdrop-blur-md border border-white/10">
                    <span className="material-symbols-outlined text-xs md:text-sm">auto_graph</span>
                    <p className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-emerald-50">Wealth Compound Active</p>
                  </div>
                </div>

                {/* 📈 Chart Area */}
                <div className="bg-white/90 backdrop-blur-2xl p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border border-white h-[350px] md:h-[480px] flex flex-col">
                  <h4 className="font-black text-slate-800 mb-6 md:mb-8 flex items-center gap-2 md:gap-3 text-sm md:text-base">
                    <span className="material-symbols-outlined text-emerald-500 text-2xl md:text-3xl">analytics</span>
                    วิถีการเติบโตของเงินทุน (Projection)
                  </h4>
                  <ResponsiveContainer width="100%" height="75%">
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
                      <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'black', fontSize: '12px' }} formatter={(v) => `฿${v.toLocaleString()}`} />
                      <Area type="monotone" dataKey="value" stroke="#059669" strokeWidth={4} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                  
                  <button onClick={saveToGoogleSheets} disabled={isSubmitting} className={`w-full mt-4 md:mt-6 py-4 md:py-5 font-black rounded-2xl md:rounded-[2rem] transition-all flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg shadow-xl active:scale-95 ${isSubmitting ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}`}>
                    <span className="material-symbols-outlined text-xl md:text-2xl">{isSubmitting ? 'sync' : 'cloud_done'}</span>
                    {submitStatus || 'บันทึกแผนความมั่งคั่งลงคลังข้อมูล'}
                  </button>
                </div>
              </div>
            ) : (
              /* ⏳ Placeholder State */
              <div className="h-full min-h-[400px] md:min-h-[550px] bg-white/80 rounded-[2.5rem] md:rounded-[3.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center p-8 md:p-12 text-slate-300 text-center space-y-4 md:space-y-6">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-full flex items-center justify-center animate-bounce">
                   <span className="material-symbols-outlined text-6xl md:text-7xl opacity-30">account_balance_wallet</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xl md:text-2xl font-black uppercase tracking-widest text-slate-400">Simulation Ready</p>
                  <p className="text-xs md:text-base font-bold max-w-xs mx-auto text-slate-400 leading-relaxed">ระบุตัวแปรด้านซ้าย <br/>เพื่อสร้างกราฟเส้นทางการเงินของคุณ</p>
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

// ✅ ลด Padding ให้กรอกง่ายขึ้นในมือถือ
function InputField({ label, name, value, onChange, icon }) {
  return (
    <div className="space-y-1.5 pb-2">
      <label className="text-[9px] md:text-[10px] font-black text-emerald-600/60 uppercase tracking-widest ml-2 block pb-1 pr-2">{label}</label>
      <div className="relative flex items-center group">
        <div className="absolute left-3 md:left-4 w-8 h-8 md:w-10 md:h-10 bg-emerald-100 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-600 transition-all duration-300">
          <span className="material-symbols-outlined text-[18px] md:text-[20px]">{icon}</span>
        </div>
        {/* ลด pl-12 ในมือถือ (จากเดิม pl-16) เพื่อให้พื้นที่พิมพ์กว้างขึ้น */}
        <input 
          type="text" 
          name={name} 
          value={value === 0 ? '' : value} 
          onChange={onChange} 
          className="w-full pl-14 md:pl-16 pr-4 py-3 md:py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl md:rounded-[1.5rem] focus:ring-4 focus:ring-emerald-500/20 outline-none font-black text-emerald-900 text-base md:text-lg transition-all shadow-inner placeholder:text-emerald-200" 
          placeholder="0" 
        />
      </div>
    </div>
  );
}