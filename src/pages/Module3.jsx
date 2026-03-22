import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Module3TVMCalculator({ user }) {
  const [calcType, setCalcType] = useState('FV_SINGLE');
  const [inputs, setInputs] = useState({
    amount: 0,
    rate: 5,
    compounds: 12,
    years: 10,
    months: 0 // ✅ เพิ่ม State จำนวนเดือน
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

  // ✅ คำนวณจำนวนงวดทั้งหมด (n) แบบ Real-time
  const totalPeriods = (inputs.years * inputs.compounds) + (inputs.months * (inputs.compounds / 12));

  const calculateTVM = useCallback((currentType = calcType, currentInputs = inputs) => {
    const r = currentInputs.rate / 100;
    const k = currentInputs.compounds;
    const p = currentInputs.amount;
    const i = r / k;
    
    // คำนวณจำนวนงวดรวม (แปลงเดือนเป็นส่วนของปีแล้วคูณความถี่งวด)
    const n_total = (currentInputs.years * k) + (currentInputs.months * (k / 12));

    let projection = [];
    let finalFV = 0;

    // วนลูปสร้างกราฟรายปี (หรือรายงวดถ้าสั้น)
    // เพื่อให้เห็นภาพ เราจะวนตามจำนวนปี + เดือนที่มี
    const totalIterations = Math.ceil(n_total / (k/12)); // จำนวนเดือนทั้งหมด / 12

    for (let m = 0; m <= (currentInputs.years * 12 + currentInputs.months); m += 12) {
      const current_n = (m / 12) * k;
      let currentFV = 0;

      if (currentType === 'FV_SINGLE') {
        currentFV = p * Math.pow((1 + i), current_n);
      } else if (currentType === 'PV_SINGLE') {
        const pv = p / Math.pow((1 + i), n_total);
        currentFV = pv * Math.pow((1 + i), current_n);
      } else if (currentType === 'FVA_ORD') {
        currentFV = m === 0 ? 0 : p * ((Math.pow((1 + i), current_n) - 1) / i);
      } else if (currentType === 'FVA_DUE') {
        currentFV = m === 0 ? 0 : p * (1 + i) * ((Math.pow((1 + i), current_n) - 1) / i);
      }

      projection.push({
        label: m === 0 ? 'เริ่มต้น' : `ปีที่ ${m/12}`,
        value: Math.round(currentFV)
      });
    }

    // คำนวณค่าสุดท้ายที่งวดที่ n จริงๆ (กรณีมีเศษเดือน)
    let finalValue = 0;
    if (currentType === 'FV_SINGLE') finalValue = p * Math.pow((1 + i), n_total);
    else if (currentType === 'PV_SINGLE') finalValue = p;
    else if (currentType === 'FVA_ORD') finalValue = p * ((Math.pow((1 + i), n_total) - 1) / i);
    else if (currentType === 'FVA_DUE') finalValue = p * (1 + i) * ((Math.pow((1 + i), n_total) - 1) / i);

    setChartData(projection);
    setResult({
      futureValue: finalValue,
      totalInvested: (currentType === 'FV_SINGLE' || currentType === 'PV_SINGLE') ? (currentType === 'FV_SINGLE' ? p : p / Math.pow(1+i, n_total)) : p * n_total,
      isCalculated: true
    });
  }, [calcType, inputs]);

  useEffect(() => {
    const loadOldData = async () => {
      if (!user?.id) return;
      try {
        const url = `${GOOGLE_SCRIPT_URL}?action=getLatestRecord&userId=${user.id}&moduleName=${encodeURIComponent("Module 3: TVM Calculator")}&t=${Date.now()}`;
        const response = await fetch(url);
        const resJson = await response.json();
        if (resJson.status === "success" && resJson.rawData) {
          const old = JSON.parse(resJson.rawData);
          setCalcType(old.calcType || 'FV_SINGLE');
          setInputs(old.inputs || { amount: 0, rate: 5, compounds: 12, years: 10, months: 0 });
          calculateTVM(old.calcType, old.inputs);
        }
      } catch (e) { console.log("No old data"); }
    };
    loadOldData();
  }, [user.id, calculateTVM]);

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
    const style = "flex items-center justify-center gap-2 text-xl md:text-2xl font-serif italic text-slate-800 py-4";
    const frac = "flex flex-col items-center mx-1 text-base md:text-lg";
    const line = "w-full h-[1.5px] bg-slate-800 my-0.5";

    if (calcType === 'FV_SINGLE') return <div className={style}><span>FV = PV (1 + i)<sup className="text-xs italic">n</sup></span></div>;
    if (calcType === 'PV_SINGLE') return <div className={style}><span>PV = </span><div className={frac}><span>FV</span><div className={line}></div><span>(1 + i)<sup className="text-xs italic">n</sup></span></div></div>;
    if (calcType === 'FVA_ORD') return <div className={style}><span>FVA = PMT × </span><div className={frac}><span>(1 + i)<sup className="text-xs italic">n</sup> - 1</span><div className={line}></div><span>i</span></div></div>;
    return <div className={style}><span>FVA = PMT × </span><div className={frac}><span>(1 + i)<sup className="text-xs italic">n</sup> - 1</span><div className={line}></div><span>i</span></div><span> × (1 + i)</span></div>;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Time Value of Money</h2>
          <p className="text-slate-500 font-medium italic">ใส่ปีและเดือน เพื่อคำนวณมูลค่าเงินตามเวลา</p>
        </div>
        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined text-4xl">functions</span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">โหมดการคำนวณ</label>
              <select value={calcType} onChange={(e) => { setCalcType(e.target.value); setResult({ ...result, isCalculated: false }); }} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-700 outline-none focus:ring-2 focus:ring-blue-500">
                <option value="FV_SINGLE">ฝากก้อนเดียว (Future Value)</option>
                <option value="PV_SINGLE">หาเงินต้น (Present Value)</option>
                <option value="FVA_ORD">ออมรายงวด (Ordinary Annuity)</option>
                <option value="FVA_DUE">ออมรายงวด ต้นงวด (Annuity Due)</option>
              </select>
            </div>

            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 space-y-2">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest text-center">สูตรที่ใช้คำนวณ</p>
              {renderVisualFormula()}
              <div className="pt-2 border-t border-blue-200 flex justify-between px-2">
                <span className="text-[10px] text-blue-600 font-black">i = (Rate/100) / {inputs.compounds}</span>
                <span className="text-[10px] text-blue-600 font-black italic underline">จำนวนงวด (n) = {totalPeriods.toFixed(2)} งวด</span>
              </div>
            </div>

            <div className="space-y-4">
              <InputField label={calcType === 'PV_SINGLE' ? "เป้าหมายเงินในอนาคต" : "จำนวนเงิน (PV หรือ PMT)"} name="amount" value={inputs.amount} onChange={handleInputChange} icon="payments" />
              <InputField label="ดอกเบี้ยต่อปี (%)" name="rate" value={inputs.rate} onChange={handleInputChange} icon="percent" />
              
              <div className="grid grid-cols-2 gap-4">
                <InputField label="ระยะเวลา (ปี)" name="years" value={inputs.years} onChange={handleInputChange} icon="calendar_month" />
                <InputField label="ระยะเวลา (เดือน)" name="months" value={inputs.months} onChange={handleInputChange} icon="more_time" />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">ความถี่ของงวด</label>
                <select name="compounds" value={inputs.compounds} onChange={handleInputChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none">
                  <option value={12}>รายเดือน (12 งวด/ปี)</option>
                  <option value={4}>รายไตรมาส (4 งวด/ปี)</option>
                  <option value={1}>รายปี (1 งวด/ปี)</option>
                </select>
              </div>
            </div>

            <button onClick={() => calculateTVM()} className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all text-lg">คำนวณผลลัพธ์</button>
          </div>
        </div>

        <div className="lg:col-span-7">
          {result.isCalculated ? (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-blue-50 h-full flex flex-col space-y-8 animate-fadeIn">
              <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Future Value (ปลายงวดที่ {totalPeriods.toFixed(1)})</p>
                <h3 className="text-5xl font-black tracking-tighter">฿{result.futureValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12">rocket_launch</span>
              </div>

              <div className="flex-grow w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{fontSize: 10, fontWeight: 'bold'}} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} formatter={(v) => `฿${v.toLocaleString()}`} />
                    <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={4} fill="#dbeafe" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <button onClick={saveToGoogleSheets} disabled={isSubmitting} className="w-full py-4 bg-slate-100 hover:bg-blue-50 text-slate-700 font-black rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95">
                <span className="material-symbols-outlined">{isSubmitting ? 'sync' : 'save'}</span>
                {submitStatus || 'บันทึกข้อมูลล่าสุด'}
              </button>
            </div>
          ) : (
            <div className="h-full bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-slate-400 text-center font-bold">
              <span className="material-symbols-outlined text-7xl mb-4 opacity-20">insights</span>
              <p>กรอกข้อมูล ปี และ เดือน <br/>เพื่อดูการเติบโตของเงินคุณในแต่ละงวด</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, icon }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-4 text-slate-400">{icon}</span>
        <input type="text" name={name} value={value === 0 ? '' : value} onChange={onChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-slate-700 text-lg shadow-inner" placeholder="0" />
      </div>
    </div>
  );
}