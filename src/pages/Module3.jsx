import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Module3TVMCalculator({ user }) {
  const [calcType, setCalcType] = useState('FV_SINGLE');
  const [inputs, setInputs] = useState({
    amount: 0,
    rate: 5,
    compounds: 12,
    years: 10
  });

  const [result, setResult] = useState({
    futureValue: 0,
    totalInvested: 0,
    totalInterest: 0,
    isCalculated: false
  });

  const [chartData, setChartData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  // ✅ 1. ระบบดึงข้อมูลเก่า (Smart Load)
  useEffect(() => {
    const loadOldData = async () => {
      try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getLatestRecord&userId=${user.id}&moduleName=Module 3: TVM Calculator`);
        const resJson = await response.json();
        if (resJson.status === "success" && resJson.rawData) {
          const old = JSON.parse(resJson.rawData);
          setCalcType(old.calcType || 'FV_SINGLE');
          setInputs(old.inputs || { amount: 0, rate: 5, compounds: 12, years: 10 });
        }
      } catch (e) { console.log("ยังไม่มีข้อมูลเก่า"); }
    };
    loadOldData();
  }, [user.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    setInputs({ ...inputs, [name]: Number(sanitizedValue) });
  };

  // ✅ 2. ลอจิกการคำนวณ TVM
  const calculateTVM = () => {
    const r = inputs.rate / 100;
    const k = inputs.compounds;
    const n_years = inputs.years;
    const p = inputs.amount;
    const i = r / k;

    let projection = [];
    let finalFV = 0;

    for (let year = 0; year <= n_years; year++) {
      let currentFV = 0;
      const n_total = k * year;

      if (calcType === 'FV_SINGLE') {
        currentFV = p * Math.pow((1 + i), n_total);
      } else if (calcType === 'PV_SINGLE') {
        const pv = p / Math.pow((1 + i), k * n_years);
        currentFV = pv * Math.pow((1 + i), n_total);
      } else if (calcType === 'FVA_ORD') {
        currentFV = year === 0 ? 0 : p * ((Math.pow((1 + i), n_total) - 1) / i);
      } else if (calcType === 'FVA_DUE') {
        currentFV = year === 0 ? 0 : p * (1 + i) * ((Math.pow((1 + i), n_total) - 1) / i);
      }

      projection.push({
        year: `ปีที่ ${year}`,
        value: Math.round(currentFV)
      });

      if (year === n_years) finalFV = currentFV;
    }

    setChartData(projection);
    setResult({
      futureValue: finalFV,
      totalInvested: (calcType === 'FV_SINGLE' || calcType === 'PV_SINGLE') ? (calcType === 'FV_SINGLE' ? p : p / Math.pow(1+i, k*n_years)) : p * k * n_years,
      isCalculated: true
    });
  };

  const saveToGoogleSheets = async () => {
    setIsSubmitting(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, { 
        method: "POST", 
        mode: "no-cors", 
        body: JSON.stringify({ 
          action: "save", 
          userId: user.id, 
          moduleName: "Module 3: TVM Calculator", 
          actionData: JSON.stringify({ calcType, inputs }) 
        }) 
      });
      setSubmitStatus('บันทึกสำเร็จ! ✅');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (e) { setSubmitStatus('เกิดข้อผิดพลาด ❌'); }
    finally { setIsSubmitting(false); }
  };

  // ✅ 3. ส่วนแสดงสูตรคณิตศาสตร์แบบ Visual (แก้ไขใช้ <sup> เพื่อยกตัวเลข n ขึ้นบน)
  const renderVisualFormula = () => {
    const style = "flex items-center justify-center gap-2 text-xl md:text-2xl font-serif italic text-slate-800 py-4";
    const frac = "flex flex-col items-center mx-1 text-base md:text-lg";
    const line = "w-full h-[1.5px] bg-slate-800 my-0.5";

    if (calcType === 'FV_SINGLE') {
      return (
        <div className={style}>
          {/* ✅ ใช้ <sup> เพื่อยก n ขึ้นบนอย่างถูกต้อง */}
          <span>FV = PV (1 + i)<sup className="text-xs italic">n</sup></span>
        </div>
      );
    }
    if (calcType === 'PV_SINGLE') {
      return (
        <div className={style}>
          <span>PV = </span>
          <div className={frac}>
            <span>FV</span>
            <div className={line}></div>
            {/* ✅ ใช้ <sup> เพื่อยก n ขึ้นบนอย่างถูกต้อง */}
            <span>(1 + i)<sup className="text-xs italic">n</sup></span>
          </div>
        </div>
      );
    }
    if (calcType === 'FVA_ORD') {
      return (
        <div className={style}>
          <span>FVA = PMT × </span>
          <div className={frac}>
            {/* ✅ ใช้ <sup> เพื่อยก n ขึ้นบนอย่างถูกต้อง */}
            <span>(1 + i)<sup className="text-xs italic">n</sup> - 1</span>
            <div className={line}></div>
            <span>i</span>
          </div>
        </div>
      );
    }
    return (
      <div className={style}>
        <span>FVA = PMT × </span>
        <div className={frac}>
          {/* ✅ ใช้ <sup> เพื่อยก n ขึ้นบนอย่างถูกต้อง */}
          <span>(1 + i)<sup className="text-xs italic">n</sup> - 1</span>
          <div className={line}></div>
          <span>i</span>
        </div>
        <span> × (1 + i)</span>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Time Value of Money</h2>
          <p className="text-slate-500 font-medium italic">คำนวณและจำลองการเติบโตของมูลค่าเงิน</p>
        </div>
        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined text-4xl font-bold">functions</span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">โหมดการคำนวณ</label>
              <select 
                value={calcType} 
                onChange={(e) => { setCalcType(e.target.value); setResult({ ...result, isCalculated: false }); }}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="FV_SINGLE">ฝากก้อนเดียว (Future Value)</option>
                <option value="PV_SINGLE">หาเงินต้น (Present Value)</option>
                <option value="FVA_ORD">ออมรายงวด (Ordinary Annuity)</option>
                <option value="FVA_DUE">ออมรายงวด ต้นงวด (Annuity Due)</option>
              </select>
            </div>

            {/* สูตรคณิตศาสตร์แบบจัดวางด้วย HTML */}
            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 space-y-2">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest text-center">สูตรที่ใช้คำนวณ</p>
              {renderVisualFormula()}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-200 text-[10px] text-slate-400 font-bold text-center italic">
                <span>i = ดอกเบี้ยต่องวด</span>
                <span>n = จำนวนงวดทั้งหมด</span>
              </div>
            </div>

            <div className="space-y-4">
              <InputField label={calcType === 'PV_SINGLE' ? "เป้าหมายเงินในอนาคต" : "จำนวนเงิน (PV หรือ PMT)"} name="amount" value={inputs.amount} onChange={handleInputChange} icon="payments" />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="ดอกเบี้ยต่อปี (%)" name="rate" value={inputs.rate} onChange={handleInputChange} icon="percent" />
                <InputField label="ระยะเวลา (ปี)" name="years" value={inputs.years} onChange={handleInputChange} icon="calendar_month" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">ความถี่ของงวด</label>
                <select name="compounds" value={inputs.compounds} onChange={handleInputChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none cursor-pointer">
                  <option value={12}>รายเดือน (12 งวด/ปี)</option>
                  <option value={4}>รายไตรมาส (4 งวด/ปี)</option>
                  <option value={1}>รายปี (1 งวด/ปี)</option>
                </select>
              </div>
            </div>

            <button onClick={calculateTVM} className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all text-lg">คำนวณผลลัพธ์</button>
          </div>
        </div>

        <div className="lg:col-span-7">
          {result.isCalculated ? (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-blue-50 h-full flex flex-col space-y-8 animate-fadeIn">
              <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">ผลลัพธ์การคำนวณ</p>
                <h3 className="text-5xl font-black tracking-tighter">฿{result.futureValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12">rocket_launch</span>
              </div>

              <div className="flex-grow w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" tick={{fontSize: 10, fontWeight: 'bold'}} />
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
            <div className="h-full bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-slate-400 text-center">
              <span className="material-symbols-outlined text-7xl mb-4 opacity-20">insights</span>
              <p className="font-bold text-lg">ระบุตัวแปรเพื่อสร้างกราฟ</p>
              <p className="text-sm">เรียนรู้พลังของดอกเบี้ยทบต้นผ่านเส้นโค้งความมั่งคั่ง</p>
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
        <input 
          type="text" name={name} value={value === 0 ? '' : value} onChange={onChange}
          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-slate-700 text-lg shadow-inner"
          placeholder="0.00"
        />
      </div>
    </div>
  );
}