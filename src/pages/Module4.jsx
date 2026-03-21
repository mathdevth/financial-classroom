import React, { useState } from 'react';

export default function Module4RetirementPlanner({ user }) {
  // 1. State สำหรับเก็บข้อมูลการวางแผน
  const [planInputs, setPlanInputs] = useState({
    currentAge: 25,
    retireAge: 60,
    lifeExpectancy: 80,
    monthlyExpense: 20000,
    returnRate: 5 
  });

  const [result, setResult] = useState({
    yearsToSave: 0,
    yearsInRetirement: 0,
    targetFund: 0,
    monthlySavingNeeded: 0,
    isCalculated: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  // ฟังก์ชันจัดการ Input (กรองเฉพาะตัวเลข)
  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setPlanInputs({ ...planInputs, [e.target.name]: Number(value) });
  };

  // 2. ลอจิกการคำนวณแผนเกษียณ
  const calculateRetirement = () => {
    const yearsToSave = planInputs.retireAge - planInputs.currentAge;
    const yearsInRetirement = planInputs.lifeExpectancy - planInputs.retireAge;

    if (yearsToSave <= 0 || yearsInRetirement <= 0) {
      alert("กรุณาตรวจสอบข้อมูลอายุ (อายุปัจจุบัน < อายุเกษียณ < อายุขัย)");
      return;
    }

    // คำนวณเงินก้อนที่ต้องมี (Target Fund)
    const targetFundFV = planInputs.monthlyExpense * 12 * yearsInRetirement;

    // คำนวณเงินออมรายเดือน (ใช้สูตร PMT สำหรับ FV)
    const r = planInputs.returnRate / 100;
    const i = r / 12;
    const n = yearsToSave * 12;

    let monthlySaving = 0;
    if (i === 0) {
      monthlySaving = targetFundFV / n;
    } else {
      monthlySaving = (targetFundFV * i) / (Math.pow(1 + i, n) - 1);
    }

    setResult({
      yearsToSave,
      yearsInRetirement,
      targetFund: targetFundFV,
      monthlySavingNeeded: monthlySaving,
      isCalculated: true
    });
  };

  // 3. ส่งข้อมูลเข้า Google Sheets
  const saveToGoogleSheets = async () => {
    if (!result.isCalculated) return alert("กรุณากดคำนวณก่อนครับ");
    setIsSubmitting(true);

    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";
    
    const payload = {
      action: "save", // ✅ เพิ่ม action เพื่อบันทึกข้อมูล
      userId: user.id, // ✅ ใช้ id จริง
      moduleName: "Module 4: วางแผนเกษียณ",
      actionData: `เป้าหมาย: ฿${result.targetFund.toLocaleString()} | ออมเดือนละ: ฿${Math.ceil(result.monthlySavingNeeded).toLocaleString()}`
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setSubmitStatus('บันทึกแผนสำเร็จ! ✅');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (error) {
      setSubmitStatus('บันทึกล้มเหลว ❌');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen font-sans">
      
      {/* Header */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6 relative overflow-hidden">
        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center text-4xl shadow-inner shrink-0">
          🏖️
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">วางแผนเกษียณอายุ (Retirement Planner)</h2>
          <p className="text-slate-500 font-medium italic">"เกษียณสำราญ ไม่เป็นภาระลูกหลาน ด้วยพลังของการวางแผน"</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* คอลัมน์ซ้าย: ข้อมูลนำเข้า */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-xl font-black text-slate-800 border-b pb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500">event_note</span>
              ข้อมูลส่วนตัว
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <InputField label="อายุปัจจุบัน (ปี)" name="currentAge" value={planInputs.currentAge} onChange={handleInputChange} />
              <InputField label="อายุที่เกษียณ (ปี)" name="retireAge" value={planInputs.retireAge} onChange={handleInputChange} />
            </div>

            <InputField label="คาดการณ์อายุขัย (ปี)" name="lifeExpectancy" value={planInputs.lifeExpectancy} onChange={handleInputChange} />

            <div className="space-y-4 pt-4 border-t border-slate-50">
              <InputField label="ค่าใช้จ่ายหลังเกษียณ (บาท/เดือน)" name="monthlyExpense" value={planInputs.monthlyExpense} />
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">ผลตอบแทนคาดหวัง (% ต่อปี)</label>
                <input 
                  type="number" name="returnRate" value={planInputs.returnRate} onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-black text-blue-600"
                />
              </div>
            </div>

            <button 
              onClick={calculateRetirement}
              className="w-full py-5 bg-orange-500 text-white font-black rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-95 transition-all text-lg"
            >
              วิเคราะห์อนาคต
            </button>
          </div>
        </div>

        {/* คอลัมน์ขวา: ผลลัพธ์ที่คำนวณได้ */}
        <div className="lg:col-span-7">
          {result.isCalculated ? (
            <div className="space-y-6 animate-fadeIn">
              
              {/* บัตรเงินก้อนเป้าหมาย */}
              <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="relative z-10">
                  <p className="text-orange-400 font-black uppercase tracking-widest text-xs mb-2">เป้าหมายเงินกองทุนเกษียณ</p>
                  <h3 className="text-5xl lg:text-6xl font-black tracking-tighter mb-4">
                    ฿{result.targetFund.toLocaleString()}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    ต้องใช้เงินก้อนนี้ไปอีก {result.yearsInRetirement} ปี หลังหยุดทำงาน
                  </div>
                </div>
              </div>

              {/* บัตรเงินออมรายเดือน */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border-l-8 border-orange-500 flex flex-col justify-center relative overflow-hidden">
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">จำนวนเงินที่คุณต้องออมเพิ่ม</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <h3 className="text-5xl font-black text-orange-600 tracking-tighter">
                    ฿{Math.ceil(result.monthlySavingNeeded).toLocaleString()}
                  </h3>
                  <span className="text-slate-400 font-black text-xl uppercase">/ เดือน</span>
                </div>
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                  <p className="text-xs text-orange-800 font-bold leading-relaxed">
                    💡 หากเริ่มออมตั้งแต่วันนี้ที่อายุ {planInputs.currentAge} ปี คุณจะมีเวลาสะสมพลังดอกเบี้ยทบต้นถึง {result.yearsToSave} ปี!
                  </p>
                </div>
              </div>

              {/* AI Insight */}
              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-blue-600">psychology</span>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Retirement Insight</span>
                </div>
                <p className="text-sm font-medium text-slate-700 leading-relaxed">
                  คุณ{user.name} ครับ หากลองเพิ่มผลตอบแทนเพียง <span className="text-blue-600 font-black">1%</span> หรือเลื่อนเกษียณออกไปอีก <span className="text-blue-600 font-black">2 ปี</span> 
                  จะช่วยลดภาระเงินออมรายเดือนของคุณลงได้อย่างมหาศาลครับ ลองปรับแผนดูนะครับ!
                </p>
              </div>

              <div className="pt-2">
                <button 
                  onClick={saveToGoogleSheets}
                  disabled={isSubmitting}
                  className={`w-full py-4 font-black rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 ${
                    isSubmitting ? 'bg-slate-200 text-slate-400' : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
                  }`}
                >
                  <span className="material-symbols-outlined">{isSubmitting ? 'sync' : 'save'}</span>
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกเป้าหมายการเกษียณ'}
                </button>
                {submitStatus && <p className="text-center text-xs font-black text-green-600 mt-4 animate-bounce">{submitStatus}</p>}
              </div>

            </div>
          ) : (
            <div className="bg-slate-100 p-12 rounded-3xl border-2 border-dashed border-slate-200 h-full min-h-[450px] flex flex-col items-center justify-center text-slate-400 text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <span className="material-symbols-outlined text-5xl text-orange-300">history_edu</span>
              </div>
              <h4 className="text-xl font-black text-slate-600 mb-2">ออกแบบอนาคตของคุณ</h4>
              <p className="max-w-xs font-medium text-sm leading-relaxed">ระบุข้อมูลอายุและค่าใช้จ่ายที่ต้องการที่คอลัมน์ซ้ายมือ เพื่อคำนวณเงินก้อนที่คุณต้องมีในวันเกษียณ</p>
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
          placeholder="0"
          className="w-full px-5 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-slate-700 text-lg shadow-inner"
        />
      </div>
      <p className="text-[10px] font-black text-blue-500 text-right mr-2 mt-1">
        = {Number(value).toLocaleString()}
      </p>
    </div>
  );
}