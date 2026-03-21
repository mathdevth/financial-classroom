import React, { useState } from 'react';

export default function Module4RetirementPlanner({ user }) {
  // 1. State สำหรับเก็บข้อมูลการวางแผน
  const [planInputs, setPlanInputs] = useState({
    currentAge: 25,        // อายุปัจจุบัน
    retireAge: 60,         // อายุที่ต้องการเกษียณ
    lifeExpectancy: 80,    // อายุขัยที่คาดหวัง
    monthlyExpense: 20000, // ค่าใช้จ่ายต่อเดือนหลังเกษียณ (บาท)
    returnRate: 5          // อัตราผลตอบแทนคาดหวังต่อปี (%)
  });

  // State สำหรับเก็บผลลัพธ์
  const [result, setResult] = useState({
    yearsToSave: 0,
    yearsInRetirement: 0,
    targetFund: 0,
    monthlySavingNeeded: 0,
    isCalculated: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  // 2. ฟังก์ชันอัปเดตค่า Input
  const handleInputChange = (e) => {
    setPlanInputs({ ...planInputs, [e.target.name]: Number(e.target.value) });
  };

  // 3. ลอจิกการคำนวณเป้าหมายและเงินออมรายเดือน
  const calculateRetirement = () => {
    // จำนวนปีที่เหลือให้เก็บเงิน
    const yearsToSave = planInputs.retireAge - planInputs.currentAge;
    // จำนวนปีที่จะใช้ชีวิตหลังเกษียณ
    const yearsInRetirement = planInputs.lifeExpectancy - planInputs.retireAge;

    // ตรวจสอบความสมเหตุสมผลของอายุ
    if (yearsToSave <= 0 || yearsInRetirement <= 0) {
      alert("กรุณาตรวจสอบอายุให้ถูกต้อง (อายุปัจจุบัน < อายุเกษียณ < อายุขัย)");
      return;
    }

    // 3.1 หาเป้าหมายเงินเกษียณ (FV) = ค่าใช้จ่ายต่อเดือน * 12 เดือน * จำนวนปีหลังเกษียณ
    const targetFundFV = planInputs.monthlyExpense * 12 * yearsInRetirement;

    // 3.2 หาค่างวดที่ต้องออมต่อเดือน (R)
    // ใช้สมการ: R = (FV * i) / ((1 + i)^n - 1)
    const i = (planInputs.returnRate / 100) / 12; // ดอกเบี้ยต่องวด (เดือน)
    const n = yearsToSave * 12;                   // จำนวนงวดทั้งหมด (เดือน)

    let monthlySaving = 0;
    if (i === 0) {
      // กรณีไม่นำเงินไปลงทุนเลย (ดอกเบี้ย 0%)
      monthlySaving = targetFundFV / n;
    } else {
      // กรณีมีการลงทุน
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

  // 4. ฟังก์ชันส่งข้อมูลเข้า Google Sheets
  const saveToGoogleSheets = async () => {
    if (!result.isCalculated) return alert("กรุณากดคำนวณแผนเกษียณก่อนบันทึกข้อมูล");
    setIsSubmitting(true);
    setSubmitStatus('กำลังบันทึก...');

    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";
    const payload = {
      userId: "Student_001",
      moduleName: "Module 4: Retirement Planner",
      actionData: `เป้าหมาย: ${result.targetFund} | ต้องออมเดือนละ: ${Math.round(result.monthlySavingNeeded)} บาท`
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setSubmitStatus('บันทึกข้อมูลสำเร็จ! ✅');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (error) {
      setSubmitStatus('เกิดข้อผิดพลาด ❌');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl shadow-inner">
          🏖️
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-blue-900 mb-1">วางแผนเกษียณอายุ</h2>
          <p className="text-slate-600">คำนวณเป้าหมายเงินก้อนใหญ่ และเงินออมต่อเดือนที่คุณต้องเตรียมไว้</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Form Inputs */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 border-b pb-2">ข้อมูลส่วนตัวและเป้าหมาย</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">อายุปัจจุบัน (ปี)</label>
              <input 
                type="number" name="currentAge" value={planInputs.currentAge} onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-100 border-none rounded focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">ต้องการเกษียณตอนอายุ (ปี)</label>
              <input 
                type="number" name="retireAge" value={planInputs.retireAge} onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-100 border-none rounded focus:ring-2 focus:ring-blue-500 font-bold text-blue-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">คาดว่าจะมีอายุขัยถึง (ปี)</label>
            <input 
              type="number" name="lifeExpectancy" value={planInputs.lifeExpectancy} onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-100 border-none rounded focus:ring-2 focus:ring-blue-500 font-bold"
            />
          </div>

          <div className="space-y-2 pt-4">
            <label className="text-sm font-bold text-slate-600">ค่าใช้จ่ายที่ต้องการใช้หลังเกษียณ (บาท/เดือน)</label>
            <input 
              type="number" name="monthlyExpense" value={planInputs.monthlyExpense} onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-100 border-none rounded focus:ring-2 focus:ring-blue-500 font-bold text-orange-600 text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">ผลตอบแทนการลงทุนคาดหวัง (% ต่อปี)</label>
            <input 
              type="number" name="returnRate" value={planInputs.returnRate} onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-100 border-none rounded focus:ring-2 focus:ring-blue-500 font-bold"
            />
            <p className="text-xs text-slate-400">คำแนะนำ: ฝากประจำ ~1.5%, พันธบัตร ~3%, หุ้น ~8%</p>
          </div>

          <button 
            onClick={calculateRetirement}
            className="w-full py-4 mt-6 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all active:scale-95"
          >
            วิเคราะห์แผนเกษียณ
          </button>
        </div>

        {/* Right Column: Results */}
        <div className="space-y-6">
          {result.isCalculated ? (
            <div className="space-y-6 animate-fade-in">
              {/* Card 1: Target Fund */}
              <div className="bg-blue-900 text-white p-8 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-blue-200 font-bold uppercase tracking-widest text-sm mb-2">เป้าหมายเงินกองทุนเกษียณ</p>
                  <h3 className="text-4xl lg:text-5xl font-extrabold tracking-tighter mb-4">
                    ฿{result.targetFund.toLocaleString()}
                  </h3>
                  <p className="text-sm text-blue-100 leading-relaxed">
                    คุณมีเวลาเตรียมตัวอีก <span className="font-bold text-yellow-300">{result.yearsToSave} ปี</span> เพื่อใช้จ่ายเดือนละ ฿{planInputs.monthlyExpense.toLocaleString()} ไปอีก {result.yearsInRetirement} ปีหลังเกษียณ
                  </p>
                </div>
                {/* Decorative shape */}
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-600/50 rounded-full blur-3xl"></div>
              </div>

              {/* Card 2: Monthly Saving Action */}
              <div className="bg-white p-8 rounded-xl shadow-sm border-l-4 border-orange-500 flex flex-col justify-center">
                <p className="text-slate-500 font-bold text-sm mb-2">จำนวนเงินที่ต้องออม (ต่อเดือน)</p>
                <div className="flex items-end gap-2 mb-4">
                  <h3 className="text-4xl font-extrabold text-orange-600 tracking-tighter">
                    ฿{Math.ceil(result.monthlySavingNeeded).toLocaleString()}
                  </h3>
                  <span className="text-slate-500 pb-1 font-bold">/ เดือน</span>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <p className="text-xs text-orange-800 font-medium">
                    * คำนวณด้วยผลตอบแทนทบต้น <span className="font-bold">{planInputs.returnRate}% ต่อปี</span> หากคุณเริ่มออมช้ากว่านี้ ค่างวดต่อเดือนจะสูงขึ้นอย่างก้าวกระโดด
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button 
                  onClick={saveToGoogleSheets}
                  disabled={isSubmitting}
                  className={`w-full py-4 font-bold rounded-lg transition-all shadow-sm ${
                    isSubmitting ? 'bg-slate-200 text-slate-500' : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
                  }`}
                >
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกเป้าหมาย (Google Sheets)'}
                </button>
                {submitStatus && <p className="text-center text-sm font-bold text-green-600 mt-3">{submitStatus}</p>}
              </div>
            </div>
          ) : (
            <div className="bg-slate-200/50 p-8 rounded-xl border border-slate-200 border-dashed h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400">
              <span className="text-6xl mb-4 text-slate-300">⏳</span>
              <p className="font-bold text-lg text-slate-500">กรอกข้อมูลเพื่อดูอนาคตของคุณ</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}