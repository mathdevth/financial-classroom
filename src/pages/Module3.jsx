import React, { useState } from 'react';

export default function Module3TVMCalculator() {
  // 1. State สำหรับตัวเลือกประเภทการคำนวณ
  // FV_SINGLE = เงินก้อนเดียว (หามูลค่าอนาคต)
  // PV_SINGLE = เงินก้อนเดียว (หามูลค่าปัจจุบัน)
  // FVA_ORD = ค่างวดสิ้นงวด (Ordinary Annuity)
  // FVA_DUE = ค่างวดต้นงวด (Annuity Due)
  const [calcType, setCalcType] = useState('FV_SINGLE');

  // 2. State สำหรับตัวแปรนำเข้า (Inputs)
  const [inputs, setInputs] = useState({
    amount: 100000, // สามารถเป็น P (เงินต้น), S (เงินอนาคต), หรือ R (ค่างวด) ขึ้นอยู่กับโหมด
    rate: 5,        // อัตราดอกเบี้ยต่อปี (r) เป็น %
    compounds: 12,  // จำนวนครั้งที่ทบต้นต่อปี (k)
    years: 10       // ระยะเวลาเป็นปี (n)
  });

  // State สำหรับผลลัพธ์
  const [result, setResult] = useState({
    futureValue: 0,
    presentValue: 0,
    totalInvested: 0,
    totalInterest: 0,
    isCalculated: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  // 3. ฟังก์ชันจัดการการเปลี่ยนแปลง Input
  const handleInputChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: Number(e.target.value) });
  };

  // 4. ลอจิกการคำนวณคณิตศาสตร์การเงิน (TVM Core Logic)
  const calculateTVM = () => {
    const r = inputs.rate / 100; // แปลง % เป็นทศนิยม
    const k = inputs.compounds;
    const n = inputs.years;
    const amount = inputs.amount;
    
    const i = r / k;             // อัตราดอกเบี้ยต่องวด
    const totalPeriods = k * n;  // จำนวนงวดทั้งหมด

    let calculatedFV = 0;
    let calculatedPV = 0;
    let totalInvestedAmount = 0;

    // เลือกใช้สูตรตามประเภทการคำนวณ
    if (calcType === 'FV_SINGLE') {
      // สูตรมูลค่าอนาคตเงินก้อนเดียว: S = P(1 + r/k)^(kn)
      calculatedFV = amount * Math.pow((1 + i), totalPeriods);
      calculatedPV = amount;
      totalInvestedAmount = amount;

    } else if (calcType === 'PV_SINGLE') {
      // สูตรมูลค่าปัจจุบันเงินก้อนเดียว: P = S(1 + r/k)^(-kn)
      calculatedPV = amount * Math.pow((1 + i), -totalPeriods);
      calculatedFV = amount;
      totalInvestedAmount = calculatedPV;

    } else if (calcType === 'FVA_ORD') {
      // สูตรค่างวดสิ้นงวด: FV = R[((1+i)^n - 1) / i]
      calculatedFV = amount * ((Math.pow((1 + i), totalPeriods) - 1) / i);
      totalInvestedAmount = amount * totalPeriods;

    } else if (calcType === 'FVA_DUE') {
      // สูตรค่างวดต้นงวด: FV = R(1+i)[((1+i)^n - 1) / i]
      calculatedFV = amount * (1 + i) * ((Math.pow((1 + i), totalPeriods) - 1) / i);
      totalInvestedAmount = amount * totalPeriods;
    }

    // หักลบหาดอกเบี้ยทั้งหมดที่ได้รับ (หรือต้องจ่าย)
    const interestEarned = calculatedFV - totalInvestedAmount;

    setResult({
      futureValue: calculatedFV,
      presentValue: calculatedPV,
      totalInvested: totalInvestedAmount,
      totalInterest: interestEarned,
      isCalculated: true
    });
  };

  // 5. ส่งข้อมูลเข้า Google Sheets
  const saveToGoogleSheets = async () => {
    if (!result.isCalculated) return alert("กรุณากดคำนวณก่อนบันทึกข้อมูล");
    setIsSubmitting(true);
    setSubmitStatus('กำลังบันทึก...');

    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/ใส่_URL_ของคุณที่นี่/exec";
    const payload = {
      userId: "Student_001",
      moduleName: "Module 3: TVM Calculator",
      actionData: `โหมด: ${calcType} | ดอกเบี้ยที่ได้: ${result.totalInterest.toFixed(2)} บาท`
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

  // 6. Helper Function เปลี่ยนชื่อ Label ตามโหมดที่เลือก
  const getAmountLabel = () => {
    switch(calcType) {
      case 'FV_SINGLE': return 'เงินต้นก้อนเดียว (P)';
      case 'PV_SINGLE': return 'เป้าหมายเงินในอนาคต (S)';
      case 'FVA_ORD': return 'เงินฝากทุกสิ้นงวด (R)';
      case 'FVA_DUE': return 'เงินฝากทุกต้นงวด (R)';
      default: return 'จำนวนเงิน';
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-3xl font-extrabold text-blue-900 mb-2">เครื่องคิดเลขการเงิน (TVM)</h2>
        <p className="text-slate-600">วิเคราะห์มูลค่าเงินตามเวลา และพลังของดอกเบี้ยทบต้น (Compound Interest)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">ต้องการคำนวณอะไร?</label>
              <select 
                value={calcType} 
                onChange={(e) => { setCalcType(e.target.value); setResult({...result, isCalculated: false}); }}
                className="w-full px-4 py-3 bg-blue-50 border-blue-200 text-blue-800 rounded-lg font-bold focus:ring-2 focus:ring-blue-500"
              >
                <option value="FV_SINGLE">หามูลค่าอนาคต (ฝากเงินก้อนเดียว)</option>
                <option value="PV_SINGLE">หามูลค่าปัจจุบัน (ต้องมีเงินต้นเท่าไหร่?)</option>
                <option value="FVA_ORD">หามูลค่าอนาคต (ฝากเท่ากันทุกสิ้นงวด)</option>
                <option value="FVA_DUE">หามูลค่าอนาคต (ฝากเท่ากันทุกต้นงวด)</option>
              </select>
            </div>

            <div className="space-y-2 pt-4">
              <label className="text-sm font-bold text-slate-700">{getAmountLabel()}</label>
              <input 
                type="number" name="amount" value={inputs.amount} onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-100 border-none rounded focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">ดอกเบี้ยต่อปี (%)</label>
                <input 
                  type="number" name="rate" value={inputs.rate} onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-100 border-none rounded focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">ระยะเวลา (ปี)</label>
                <input 
                  type="number" name="years" value={inputs.years} onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-100 border-none rounded focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">ทบต้นกี่ครั้งต่อปี (k)</label>
              <select 
                name="compounds" value={inputs.compounds} onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-100 border-none rounded focus:ring-2 focus:ring-blue-500 font-bold"
              >
                <option value="1">1 ครั้ง (รายปี)</option>
                <option value="2">2 ครั้ง (รายครึ่งปี)</option>
                <option value="4">4 ครั้ง (รายไตรมาส)</option>
                <option value="12">12 ครั้ง (รายเดือน)</option>
              </select>
            </div>

            <button 
              onClick={calculateTVM}
              className="w-full py-4 mt-4 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all active:scale-95"
            >
              คำนวณผลลัพธ์
            </button>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7">
          {result.isCalculated ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col justify-between space-y-8 animate-fade-in">
              
              <div>
                <p className="text-slate-500 font-bold uppercase tracking-widest mb-2">มูลค่าในอนาคต (Future Value)</p>
                <h3 className="text-5xl lg:text-6xl font-extrabold text-green-600 tracking-tighter">
                  ฿{result.futureValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">เงินต้นทั้งหมด</p>
                  <p className="text-2xl font-bold text-slate-800">฿{result.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                  <p className="text-xs text-green-700 font-bold uppercase mb-1">ดอกเบี้ยที่ได้รับ</p>
                  <p className="text-2xl font-bold text-green-700">+฿{result.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              {/* ปุ่มบันทึกข้อมูล */}
              <div className="pt-6 border-t border-slate-100">
                <button 
                  onClick={saveToGoogleSheets}
                  disabled={isSubmitting}
                  className={`w-full py-3 font-bold rounded-lg transition-all border-2 ${
                    isSubmitting ? 'border-slate-300 text-slate-400 bg-slate-100' : 'border-blue-600 text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกประวัติลงฐานข้อมูล (Google Sheets)'}
                </button>
                {submitStatus && <p className="text-center text-sm font-bold text-green-600 mt-2">{submitStatus}</p>}
              </div>
            </div>
          ) : (
            <div className="bg-slate-200/50 p-8 rounded-xl border border-slate-200 border-dashed h-full flex flex-col items-center justify-center text-slate-400">
              <span className="text-6xl mb-4">🧮</span>
              <p className="font-bold text-lg">ระบุตัวแปรและกดคำนวณเพื่อดูผลลัพธ์</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}