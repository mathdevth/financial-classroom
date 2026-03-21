import React, { useState } from 'react';

export default function Module3TVMCalculator({ user }) {
  // 1. State สำหรับการคำนวณ
  const [calcType, setCalcType] = useState('FV_SINGLE');
  const [inputs, setInputs] = useState({
    amount: 0,
    rate: 0,
    compounds: 12, // เริ่มต้นที่รายเดือน
    years: 0
  });

  const [result, setResult] = useState({
    futureValue: 0,
    presentValue: 0,
    totalInvested: 0,
    totalInterest: 0,
    isCalculated: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  // ฟังก์ชันจัดการ Input (กรองเฉพาะตัวเลข)
  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, ''); // อนุญาตจุดทศนิยม
    setInputs({ ...inputs, [e.target.name]: Number(value) });
  };

  // 2. ลอจิกการคำนวณ TVM
  const calculateTVM = () => {
    const r = inputs.rate / 100; 
    const k = inputs.compounds;
    const n = inputs.years;
    const p = inputs.amount;
    const i = r / k;
    const totalPeriods = k * n;

    let fv = 0;
    let totalInvested = 0;

    if (calcType === 'FV_SINGLE') {
      fv = p * Math.pow((1 + i), totalPeriods);
      totalInvested = p;
    } else if (calcType === 'PV_SINGLE') {
      // p ในโหมดนี้คือ S (มูลค่าอนาคตที่ต้องการ)
      fv = p;
      totalInvested = p / Math.pow((1 + i), totalPeriods);
    } else if (calcType === 'FVA_ORD') {
      fv = p * ((Math.pow((1 + i), totalPeriods) - 1) / i);
      totalInvested = p * totalPeriods;
    } else if (calcType === 'FVA_DUE') {
      fv = p * (1 + i) * ((Math.pow((1 + i), totalPeriods) - 1) / i);
      totalInvested = p * totalPeriods;
    }

    setResult({
      futureValue: fv,
      totalInvested: totalInvested,
      totalInterest: fv - totalInvested,
      isCalculated: true
    });
  };

  // 3. ส่งข้อมูลเข้า Google Sheets
  const saveToGoogleSheets = async () => {
    if (!result.isCalculated) return alert("กรุณากดคำนวณก่อนบันทึกข้อมูล");
    setIsSubmitting(true);

    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";
    
    const payload = {
      action: "save", // ✅ เพิ่ม action
      userId: user.id, // ✅ ใช้ id จริงจากระบบ Login
      moduleName: "Module 3: TVM Calculator",
      actionData: `โหมด: ${calcType} | เงินอนาคต: ฿${result.futureValue.toLocaleString()} | ดอกเบี้ย: ฿${result.totalInterest.toLocaleString()}`
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
      
      {/* Header Section */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">เครื่องคิดเลขการเงิน (TVM)</h2>
          <p className="text-slate-500 font-medium">ทำความเข้าใจ "ค่าของเงินตามเวลา" และพลังของดอกเบี้ยทบต้น</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* คอลัมน์ซ้าย: การตั้งค่าและ Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">เป้าหมายการคำนวณ</label>
              <select 
                value={calcType} 
                onChange={(e) => { setCalcType(e.target.value); setResult({...result, isCalculated: false}); }}
                className="w-full px-4 py-4 bg-blue-50 border-2 border-blue-100 text-blue-800 rounded-2xl font-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="FV_SINGLE">ฝากเงินก้อนเดียว (หามูลค่าอนาคต)</option>
                <option value="PV_SINGLE">หามูลค่าปัจจุบัน (ต้องเริ่มออมเท่าไหร่?)</option>
                <option value="FVA_ORD">ฝากรายงวด - สิ้นงวด (Ordinary Annuity)</option>
                <option value="FVA_DUE">ฝากรายงวด - ต้นงวด (Annuity Due)</option>
              </select>
            </div>

            <InputField label={getAmountLabel()} name="amount" value={inputs.amount} onChange={handleInputChange} />

            <div className="grid grid-cols-2 gap-4">
              <InputField label="ดอกเบี้ยต่อปี (%)" name="rate" value={inputs.rate} onChange={handleInputChange} />
              <InputField label="ระยะเวลา (ปี)" name="years" value={inputs.years} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">ความถี่ในการทบต้น (Compounding)</label>
              <select 
                name="compounds" value={inputs.compounds} onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="1">ทบต้นรายปี (k=1)</option>
                <option value="2">ทบต้นรายครึ่งปี (k=2)</option>
                <option value="4">ทบต้นรายไตรมาส (k=4)</option>
                <option value="12">ทบต้นรายเดือน (k=12)</option>
              </select>
            </div>

            <button 
              onClick={calculateTVM}
              className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all text-lg"
            >
              คำนวณผลลัพธ์
            </button>
          </div>
        </div>

        {/* คอลัมน์ขวา: ผลลัพธ์ */}
        <div className="lg:col-span-7">
          {result.isCalculated ? (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100 h-full flex flex-col justify-between animate-fadeIn relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
              
              <div className="relative z-10">
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs mb-2">มูลค่ารวมในอนาคต (Future Value)</p>
                <h3 className="text-6xl lg:text-7xl font-black text-green-600 tracking-tighter mb-8">
                  ฿{result.futureValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-black uppercase mb-1">เงินต้นสะสมทั้งหมด</p>
                    <p className="text-2xl font-black text-slate-700">฿{result.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                    <p className="text-[10px] text-green-600 font-black uppercase mb-1">ดอกเบี้ยรับรวม</p>
                    <p className="text-2xl font-black text-green-600">+฿{result.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                {/* สรุปบทเรียน AI Insight */}
                <div className="mt-8 p-6 bg-blue-900 text-white rounded-2xl shadow-xl border border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-blue-400">tips_and_updates</span>
                    <span className="font-black text-xs uppercase tracking-widest text-blue-300">TVM Insight</span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed">
                    คุณ{user.name} ครับ สังเกตไหมว่าถ้าเราเพิ่มระยะเวลา (n) ขึ้นอีกเพียงเล็กน้อย หรือเพิ่มความถี่ในการทบต้น (k) 
                    จะทำให้ดอกเบี้ยทบต้นทำงานได้อย่างมหาศาล นี่คือพลังของ "เวลา" ในคณิตศาสตร์การเงินครับ
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 relative z-10">
                <button 
                  onClick={saveToGoogleSheets}
                  disabled={isSubmitting}
                  className={`w-full py-4 font-black rounded-2xl transition-all border-2 flex items-center justify-center gap-2 ${
                    isSubmitting ? 'border-slate-200 text-slate-400' : 'border-green-500 text-green-600 hover:bg-green-50'
                  }`}
                >
                  <span className="material-symbols-outlined">{isSubmitting ? 'sync' : 'cloud_upload'}</span>
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกประวัติลง Google Sheets'}
                </button>
                {submitStatus && <p className="text-center text-xs font-black text-green-600 mt-3 animate-bounce">{submitStatus}</p>}
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 p-12 rounded-3xl border-2 border-dashed border-slate-200 h-full flex flex-col items-center justify-center text-slate-400 text-center">
              <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-5xl">calculate</span>
              </div>
              <h4 className="text-xl font-black text-slate-600 mb-2">พร้อมคำนวณแล้วหรือยัง?</h4>
              <p className="max-w-xs font-medium text-sm">ระบุข้อมูลทางการเงินที่คอลัมน์ซ้ายมือ และกดคำนวณเพื่อดูพลังของดอกเบี้ยทบต้น</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Sub-Component สำหรับ Input Field
function InputField({ label, name, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <input 
          type="text" 
          name={name}
          value={value === 0 ? '' : value}
          onChange={onChange}
          placeholder="0.00"
          className="w-full px-5 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-slate-700 text-lg"
        />
      </div>
      <p className="text-[10px] font-black text-blue-500 text-right mr-2 mt-1">
        = {Number(value).toLocaleString()}
      </p>
    </div>
  );
}