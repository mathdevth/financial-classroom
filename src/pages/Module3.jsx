import React, { useState } from 'react';
// 1. นำเข้า Component สำหรับทำกราฟ
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Module3TVMCalculator({ user }) {
  const [calcType, setCalcType] = useState('FV_SINGLE');
  const [inputs, setInputs] = useState({
    amount: 0,
    rate: 0,
    compounds: 12,
    years: 0
  });

  const [result, setResult] = useState({
    futureValue: 0,
    totalInvested: 0,
    totalInterest: 0,
    isCalculated: false
  });

  // State สำหรับเก็บข้อมูลรายปีเพื่อวาดกราฟ
  const [chartData, setChartData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setInputs({ ...inputs, [e.target.name]: Number(value) });
  };

  // 2. ลอจิกการคำนวณ TVM + สร้างข้อมูลกราฟ
  const calculateTVM = () => {
    const r = inputs.rate / 100;
    const k = inputs.compounds;
    const n = inputs.years;
    const p = inputs.amount;
    const i = r / k;

    let projection = [];
    let finalFV = 0;
    let finalInvested = 0;

    // วนลูปคำนวณรายปีเพื่อทำกราฟ (Year 0 ถึง Year n)
    for (let year = 0; year <= n; year++) {
      let currentFV = 0;
      let currentInvested = 0;
      const totalPeriods = k * year;

      if (calcType === 'FV_SINGLE') {
        currentFV = p * Math.pow((1 + i), totalPeriods);
        currentInvested = p;
      } else if (calcType === 'PV_SINGLE') {
        // ในโหมดหา PV: p คือเป้าหมายในอนาคต ดังนั้นกราฟจะแสดงการย้อนกลับ หรือแสดงการโตไปหาเป้าหมาย
        // เพื่อให้ดูง่าย เราจะจำลองการโตจากเงินต้น PV ไปหาเป้าหมาย p
        const pv = inputs.amount / Math.pow((1 + (inputs.rate/100)/k), k * n);
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

      if (year === n) {
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
    if (!result.isCalculated) return alert("กรุณากดคำนวณก่อนบันทึกข้อมูล");
    setIsSubmitting(true);
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";
    
    const payload = {
      action: "save",
      userId: user.id,
      moduleName: "Module 3: TVM Calculator",
      actionData: `โหมด: ${calcType} | เงินสุดท้าย: ฿${result.futureValue.toLocaleString()} | ดอกเบี้ย: ฿${result.totalInterest.toLocaleString()}`
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setSubmitStatus('บันทึกประวัติสำเร็จ! ✅');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (error) {
      setSubmitStatus('เกิดข้อผิดพลาด ❌');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAmountLabel = () => {
    switch(calcType) {
      case 'FV_SINGLE': return 'เงินต้นก้อนแรก (Present Value)';
      case 'PV_SINGLE': return 'เป้าหมายเงินในอนาคต (Future Value)';
      default: return 'เงินฝากต่อหนึ่งงวด (Payment)';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen font-sans">
      
      {/* Header */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">เครื่องคิดเลขการเงิน (TVM)</h2>
          <p className="text-slate-500 font-medium">วิเคราะห์มูลค่าเงินตามเวลาผ่าน "เส้นกราฟการเติบโต"</p>
        </div>
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl">trending_up</span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* คอลัมน์ซ้าย: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">เป้าหมายการคำนวณ</label>
              <select 
                value={calcType} 
                onChange={(e) => { setCalcType(e.target.value); setResult({...result, isCalculated: false}); }}
                className="w-full px-4 py-4 bg-blue-50 border-2 border-blue-100 text-blue-800 rounded-2xl font-black focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="FV_SINGLE">ฝากเงินก้อนเดียว (หาเงินในอนาคต)</option>
                <option value="PV_SINGLE">หามูลค่าปัจจุบัน (ย้อนกลับหาต้นทุน)</option>
                <option value="FVA_ORD">ฝากรายงวด (สิ้นงวด)</option>
                <option value="FVA_DUE">ฝากรายงวด (ต้นงวด)</option>
              </select>
            </div>

            <InputField label={getAmountLabel()} name="amount" value={inputs.amount} onChange={handleInputChange} />

            <div className="grid grid-cols-2 gap-4">
              <InputField label="ดอกเบี้ย (%)" name="rate" value={inputs.rate} onChange={handleInputChange} />
              <InputField label="ระยะเวลา (ปี)" name="years" value={inputs.years} onChange={handleInputChange} />
            </div>

            <button onClick={calculateTVM} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all text-lg">
              คำนวณและสร้างกราฟ
            </button>
          </div>
        </div>

        {/* คอลัมน์ขวา: กราฟและผลลัพธ์ */}
        <div className="lg:col-span-8">
          {result.isCalculated ? (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100 h-full flex flex-col space-y-8 animate-fadeIn relative">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">มูลค่าสุดท้าย (FV)</p>
                  <h3 className="text-5xl font-black text-green-600 tracking-tighter">
                    ฿{result.futureValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase">ดอกเบี้ยรับรวม</p>
                  <p className="text-xl font-black text-blue-600">+฿{result.totalInterest.toLocaleString()}</p>
                </div>
              </div>

              {/* ส่วนแสดงกราฟ */}
              <div className="flex-grow min-h-[300px] w-full pt-4">
                <p className="text-xs font-black text-slate-400 mb-4 uppercase tracking-widest text-center">กราฟการเติบโตของเงินสะสม (รวมดอกเบี้ยทบต้น)</p>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                      formatter={(value) => [`฿${value.toLocaleString()}`, 'มูลค่าเงิน']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button onClick={saveToGoogleSheets} disabled={isSubmitting} className={`w-full py-4 font-black rounded-2xl transition-all border-2 flex items-center justify-center gap-2 ${isSubmitting ? 'bg-slate-50 text-slate-300 border-slate-100' : 'border-green-500 text-green-600 hover:bg-green-50'}`}>
                  <span className="material-symbols-outlined">cloud_upload</span>
                  {isSubmitting ? 'กำลังซิงค์...' : 'บันทึกประวัติลงฐานข้อมูล'}
                </button>
                {submitStatus && <p className="text-center text-xs font-black text-green-600 mt-3 animate-bounce">{submitStatus}</p>}
              </div>

            </div>
          ) : (
            <div className="bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 h-full flex flex-col items-center justify-center text-slate-400 p-12 text-center">
              <span className="material-symbols-outlined text-6xl mb-4 opacity-20">show_chart</span>
              <h4 className="text-xl font-black text-slate-600 mb-2">ระบุตัวแปรเพื่อวาดกราฟ</h4>
              <p className="max-w-xs text-sm font-medium">ลองปรับ "ระยะเวลา" ให้สูงขึ้น เพื่อดูว่าเส้นกราฟจะพุ่งชันขึ้นอย่างไรเมื่อดอกเบี้ยทบต้นทำงาน</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-Component Input (มีคอมม่าแสดงกำกับ)
function InputField({ label, name, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type="text" name={name} value={value === 0 ? '' : value} onChange={onChange}
        className="w-full px-5 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-slate-700 text-lg"
        placeholder="0.00"
      />
      <p className="text-[10px] font-black text-blue-500 text-right mr-1">= {Number(value).toLocaleString()}</p>
    </div>
  );
}