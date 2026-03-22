import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Module3TVMCalculator({ user }) {
  const [calcType, setCalcType] = useState('FV_SINGLE');
  const [inputs, setInputs] = useState({
    amount: 0,
    rate: 5, // ดอกเบี้ยเริ่มต้น 5% ต่อปี
    compounds: 12, // จำนวนงวดต่อปี (12 = รายเดือน, 1 = รายปี)
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
        const result = await response.json();
        if (result.status === "success" && result.rawData) {
          const oldData = JSON.parse(result.rawData);
          setCalcType(oldData.calcType || 'FV_SINGLE');
          setInputs(oldData.inputs || { amount: 0, rate: 5, compounds: 12, years: 10 });
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
    const r = inputs.rate / 100; // ดอกเบี้ยต่อปี
    const k = inputs.compounds; // งวดต่อปี
    const n_years = inputs.years; // จำนวนปี
    const p = inputs.amount; // เงินต้นหรือเงินออม
    const i = r / k; // ดอกเบี้ยต่องวด

    let projection = [];
    let finalFV = 0;
    let finalInvested = 0;

    for (let year = 0; year <= n_years; year++) {
      let currentFV = 0;
      let currentInvested = 0;
      const totalPeriods = k * year;

      if (calcType === 'FV_SINGLE') {
        currentFV = p * Math.pow((1 + i), totalPeriods);
        currentInvested = p;
      } else if (calcType === 'PV_SINGLE') {
        const pv = p / Math.pow((1 + i), k * n_years);
        currentFV = pv * Math.pow((1 + i), totalPeriods);
        currentInvested = pv;
      } else if (calcType === 'FVA_ORD') {
        currentFV = year === 0 ? 0 : p * ((Math.pow((1 + i), totalPeriods) - 1) / i);
        currentInvested = p * k * year;
      } else if (calcType === 'FVA_DUE') {
        currentFV = year === 0 ? 0 : p * (1 + i) * ((Math.pow((1 + i), totalPeriods) - 1) / i);
        currentInvested = p * k * year;
      }

      projection.push({
        year: `ปีที่ ${year}`,
        value: Math.round(currentFV),
        invested: Math.round(currentInvested)
      });

      if (year === n_years) {
        finalFV = currentFV;
        finalInvested = currentInvested;
      }
    }

    setChartData(projection);
    setResult({
      futureValue: finalFV,
      totalInvested: finalInvested,
      totalInterest: finalFV - finalInvested,
      isCalculated: true
    });
  };

  const saveToGoogleSheets = async () => {
    setIsSubmitting(true);
    const payload = {
      action: "save",
      userId: user.id,
      moduleName: "Module 3: TVM Calculator",
      // ✅ บันทึกข้อมูลดิบ JSON เพื่อให้โหลดกลับมาได้
      actionData: JSON.stringify({ calcType, inputs }) 
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(payload) });
      setSubmitStatus('บันทึกแผนล่าสุดสำเร็จ! ✅');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (error) { setSubmitStatus('เกิดข้อผิดพลาด ❌'); }
    finally { setIsSubmitting(false); }
  };

  // ✅ 3. ส่วนแสดงสูตรคำนวณ (Math Formulas)
  const renderFormula = () => {
    const formulas = {
      'FV_SINGLE': {
        latex: "$$FV = PV(1 + i)^n$$",
        desc: "ใช้คำนวณหาเงินในอนาคตจากการฝากเงินก้อนเดียวทิ้งไว้"
      },
      'PV_SINGLE': {
        latex: "$$PV = \\frac{FV}{(1 + i)^n}$$",
        desc: "ใช้คำนวณว่าต้องเริ่มฝากเงินวันนี้เท่าไหร่เพื่อให้ได้เป้าหมายที่ต้องการ"
      },
      'FVA_ORD': {
        latex: "$$FVA_{ord} = PMT \\times \\left[ \\frac{(1 + i)^n - 1}{i} \\right]$$",
        desc: "ใช้คำนวณเงินออมรายงวด โดยฝากทุก 'สิ้นงวด'"
      },
      'FVA_DUE': {
        latex: "$$FVA_{due} = PMT \\times \\left[ \\frac{(1 + i)^n - 1}{i} \\right] \\times (1 + i)$$",
        desc: "ใช้คำนวณเงินออมรายงวด โดยฝากทุก 'ต้นงวด' (ได้ดอกเบี้ยเพิ่มอีก 1 งวด)"
      }
    };
    const current = formulas[calcType];
    return (
      <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 space-y-3">
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">สูตรที่ใช้คำนวณ</p>
        <div className="text-xl md:text-2xl text-slate-800 py-2 overflow-x-auto">{current.latex}</div>
        <p className="text-xs font-bold text-slate-500 italic">*{current.desc}</p>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-200">
          <p className="text-[10px] text-slate-400"><b>i (ดอกเบี้ยต่องวด)</b> = (Rate / 100) / {inputs.compounds}</p>
          <p className="text-[10px] text-slate-400"><b>n (จำนวนงวด)</b> = Years × {inputs.compounds}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen font-sans">
      
      {/* Header */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Time Value of Money</h2>
          <p className="text-slate-500 font-medium">ทำความเข้าใจ "ค่าของเงิน" และสูตรคณิตศาสตร์การเงิน</p>
        </div>
        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined text-4xl">functions</span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* คอลัมน์ซ้าย: Inputs & Formula */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">โหมดการคำนวณ</label>
              <select 
                value={calcType} 
                onChange={(e) => { setCalcType(e.target.value); setResult({ ...result, isCalculated: false }); }}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="FV_SINGLE">ฝากก้อนเดียว (Future Value)</option>
                <option value="PV_SINGLE">หาเงินต้น (Present Value)</option>
                <option value="FVA_ORD">ออมรายงวด สิ้นงวด (Ordinary Annuity)</option>
                <option value="FVA_DUE">ออมรายงวด ต้นงวด (Annuity Due)</option>
              </select>
            </div>

            {renderFormula()}

            <div className="space-y-4">
              <InputField label={calcType === 'PV_SINGLE' ? "เป้าหมายเงินในอนาคต" : "จำนวนเงิน (PV หรือ PMT)"} name="amount" value={inputs.amount} onChange={handleInputChange} icon="payments" />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="ดอกเบี้ยต่อปี (%)" name="rate" value={inputs.rate} onChange={handleInputChange} icon="percent" />
                <InputField label="ระยะเวลา (ปี)" name="years" value={inputs.years} onChange={handleInputChange} icon="calendar_month" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">ความถี่ของการทบต้น/งวด</label>
                <select name="compounds" value={inputs.compounds} onChange={handleInputChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none cursor-pointer">
                  <option value={12}>รายเดือน (12 งวด/ปี)</option>
                  <option value={4}>รายไตรมาส (4 งวด/ปี)</option>
                  <option value={1}>รายปี (1 งวด/ปี)</option>
                </select>
              </div>
            </div>

            <button onClick={calculateTVM} className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all">
              คำนวณผลลัพธ์
            </button>
          </div>
        </div>

        {/* คอลัมน์ขวา: Visualization */}
        <div className="lg:col-span-7">
          {result.isCalculated ? (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-blue-50 h-full flex flex-col space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
                  <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Future Value</p>
                  <h3 className="text-4xl font-black tracking-tighter">฿{result.futureValue.toLocaleString()}</h3>
                  <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-6xl opacity-10">rocket_launch</span>
                </div>
                <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
                  <p className="text-green-600 font-black text-[10px] uppercase mb-1">ดอกเบี้ยรับ (ความรวยที่เพิ่มขึ้น)</p>
                  <h3 className="text-3xl font-black text-green-700">฿{result.totalInterest.toLocaleString()}</h3>
                </div>
              </div>

              <div className="flex-grow w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={4} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <button onClick={saveToGoogleSheets} disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">{isSubmitting ? 'sync' : 'save_as'}</span>
                {submitStatus || 'บันทึกแผนล่าสุดเข้าฐานข้อมูล'}
              </button>
            </div>
          ) : (
            <div className="h-full bg-slate-100 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-slate-400">
              <span className="material-symbols-outlined text-7xl mb-4 opacity-20">calculate</span>
              <p className="font-bold text-lg">ใส่ตัวแปรและเลือกโหมดการคำนวณ</p>
              <p className="text-sm">เพื่อดูพลังของ "ดอกเบี้ยทบต้น" ผ่านกราฟการเติบโต</p>
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
          className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-slate-700 text-lg"
          placeholder="0.00"
        />
      </div>
    </div>
  );
}