import React, { useState } from 'react';

export default function Module2TaxSimulator({ user }) {
  // 1. สร้าง State เก็บค่าตัวแปรต่างๆ จากฟอร์ม
  const [incomes, setIncomes] = useState({
    salaryYearly: 0, // เงินได้ประเภทที่ 1 (ต่อปี)
    otherIncome: 0,  // เงินได้ประเภทที่ 8 (ขายของออนไลน์ ฯลฯ)
  });

  const [deductions, setDeductions] = useState({
    lifeInsurance: 0,
    rmf: 0,
  });

  // State สำหรับเก็บผลลัพธ์การคำนวณ
  const [result, setResult] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalDeduction: 0,
    netIncome: 0,
    taxToPay: 0,
    isCalculated: false
  });

  // State สำหรับสถานะการส่งข้อมูล
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  // 2. ฟังก์ชันอัปเดตค่าเมื่อผู้ใช้พิมพ์ตัวเลข
  const handleIncomeChange = (e) => {
    setIncomes({ ...incomes, [e.target.name]: Number(e.target.value) });
  };

  const handleDeductionChange = (e) => {
    setDeductions({ ...deductions, [e.target.name]: Number(e.target.value) });
  };

  // 3. ลอจิกการคำนวณภาษี (Logic & Formulas)
  const calculateTax = () => {
    // 3.1 รวมรายได้
    const totalInc = incomes.salaryYearly + incomes.otherIncome;

    // 3.2 หักค่าใช้จ่าย: ประเภทที่ 1 หัก 50% แต่ไม่เกิน 100,000 บาท
    const salaryExpense = Math.min(incomes.salaryYearly * 0.5, 100000);
    const totalExp = salaryExpense; // สมมติว่าประเภท 8 ยังไม่หักค่าใช้จ่ายในเวอร์ชันพื้นฐานนี้

    // 3.3 หักค่าลดหย่อน: ส่วนตัว 60,000 + ประกันชีวิต (สูงสุด 100,000) + RMF
    const personalDeduction = 60000;
    const validLifeInsurance = Math.min(deductions.lifeInsurance, 100000);
    const totalDed = personalDeduction + validLifeInsurance + deductions.rmf;

    // 3.4 หารายได้สุทธิ
    let netInc = totalInc - totalExp - totalDed;
    if (netInc < 0) netInc = 0;

    // 3.5 คำนวณภาษีแบบขั้นบันได
    let tax = 0;
    let remainingNetIncome = netInc;

    // ตารางขั้นบันได: [เงินได้สูงสุดในขั้นนี้, อัตราภาษี]
    const brackets = [
      { limit: 150000, rate: 0.0 }, // 0 - 150,000 (ยกเว้น)
      { limit: 150000, rate: 0.05 }, // 150,001 - 300,000 (150,000 ส่วนนี้)
      { limit: 200000, rate: 0.10 }, // 300,001 - 500,000 (200,000 ส่วนนี้)
      { limit: 250000, rate: 0.15 }, // 500,001 - 750,000 (250,000 ส่วนนี้)
      { limit: 250000, rate: 0.20 }, // 750,001 - 1,000,000
      { limit: 1000000, rate: 0.25 }, // 1,000,001 - 2,000,000
      { limit: 3000000, rate: 0.30 }, // 2,000,001 - 5,000,000
      { limit: Infinity, rate: 0.35 } // มากกว่า 5,000,000
    ];

    for (let i = 0; i < brackets.length; i++) {
      if (remainingNetIncome <= 0) break;
      
      const taxableAmountInBracket = Math.min(remainingNetIncome, brackets[i].limit);
      tax += taxableAmountInBracket * brackets[i].rate;
      remainingNetIncome -= taxableAmountInBracket;
    }

    setResult({
      totalIncome: totalInc,
      totalExpense: totalExp,
      totalDeduction: totalDed,
      netIncome: netInc,
      taxToPay: tax,
      isCalculated: true
    });
  };

  // 4. ฟังก์ชันส่งข้อมูลเข้า Google Sheets
  const saveToGoogleSheets = async () => {
    if (!result.isCalculated) {
      alert("กรุณากดคำนวณภาษีก่อนบันทึกข้อมูล");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('กำลังบันทึก...');

    // ⚠️ นำ URL จาก Google Apps Script มาใส่ตรงนี้
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/ใส่_URL_ของคุณที่นี่/exec";

    const payload = {
      userId: "Student_001", // อนาคตเปลี่ยนเป็นดึงจากระบบ Login ได้
      moduleName: "Module 2: Tax Simulator",
      actionData: `รายได้สุทธิ: ${result.netIncome} | ภาษีที่ต้องจ่าย: ${result.taxToPay}`
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // ใช้ no-cors เพื่อเลี่ยงปัญหา Cross-Origin ในการยิงเข้า Google Scripts
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      setSubmitStatus('บันทึกข้อมูลสำเร็จ! ✅');
      setTimeout(() => setSubmitStatus(''), 3000); // เคลียร์ข้อความหลัง 3 วินาที
    } catch (error) {
      console.error("Error:", error);
      setSubmitStatus('เกิดข้อผิดพลาดในการบันทึก ❌');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- ส่วนแสดงผล UI (ดัดแปลงจาก HTML เดิมของคุณ) ---
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      
      {/* Header & Result Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="lg:col-span-2">
          <span className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-2 block">
            สรุปภาษีที่ต้องชำระ (จำลอง)
          </span>
          <h2 className="text-5xl md:text-6xl font-extrabold text-blue-900 tracking-tighter">
            ฿{result.taxToPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <p className="text-slate-500 mt-4 text-lg">
            คำนวณจากรายได้สุทธิ ฿{result.netIncome.toLocaleString()} (หลังหักค่าใช้จ่ายและค่าลดหย่อนแล้ว)
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={calculateTax}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all active:scale-95"
          >
            คำนวณผลลัพธ์
          </button>
          <button 
            onClick={saveToGoogleSheets}
            disabled={isSubmitting}
            className={`w-full py-3 font-bold rounded-lg transition-all border-2 ${
              isSubmitting ? 'border-slate-300 text-slate-400 bg-slate-100' : 'border-green-600 text-green-700 hover:bg-green-50'
            }`}
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกประวัติลงฐานข้อมูล'}
          </button>
          {submitStatus && <p className="text-center text-sm font-bold text-green-600 animate-pulse">{submitStatus}</p>}
        </div>
      </section>

      {/* Inputs Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* รายได้ */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b pb-2">1. รายได้ (Income)</h3>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">เงินเดือน/รายได้ประจำ ทั้งปี (บาท)</label>
            <input 
              type="number" name="salaryYearly" 
              value={incomes.salaryYearly || ''} onChange={handleIncomeChange}
              className="w-full px-4 py-3 bg-slate-100 border-none rounded focus:ring-2 focus:ring-blue-500 font-bold"
              placeholder="เช่น 360000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">รายได้อื่นๆ / ขายของออนไลน์ ทั้งปี (บาท)</label>
            <input 
              type="number" name="otherIncome" 
              value={incomes.otherIncome || ''} onChange={handleIncomeChange}
              className="w-full px-4 py-3 bg-slate-100 border-none rounded focus:ring-2 focus:ring-blue-500 font-bold"
              placeholder="เช่น 50000"
            />
          </div>
        </div>

        {/* ลดหย่อน */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b pb-2">2. ค่าลดหย่อนเพิ่มเติม (Deductions)</h3>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">เบี้ยประกันชีวิต (ลดหย่อนได้สูงสุด 1 แสนบาท)</label>
            <input 
              type="number" name="lifeInsurance" 
              value={deductions.lifeInsurance || ''} onChange={handleDeductionChange}
              className="w-full px-4 py-3 bg-slate-100 border-none rounded focus:ring-2 focus:ring-blue-500 font-bold"
              placeholder="เช่น 15000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">ซื้อกองทุน RMF (บาท)</label>
            <input 
              type="number" name="rmf" 
              value={deductions.rmf || ''} onChange={handleDeductionChange}
              className="w-full px-4 py-3 bg-slate-100 border-none rounded focus:ring-2 focus:ring-blue-500 font-bold"
              placeholder="เช่น 10000"
            />
          </div>
        </div>
      </div>

      {/* Breakdown Info */}
      {result.isCalculated && (
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-blue-900">
          <h3 className="font-bold mb-4">สรุปที่มาของรายได้สุทธิ:</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>รวมรายได้พึงประเมิน:</span> <span>฿{result.totalIncome.toLocaleString()}</span></li>
            <li className="flex justify-between"><span>หักค่าใช้จ่ายเหมา (สูงสุด 1 แสน):</span> <span className="text-red-600">- ฿{result.totalExpense.toLocaleString()}</span></li>
            <li className="flex justify-between"><span>หักค่าลดหย่อน (ส่วนตัว 6 หมื่น + สิทธิอื่นๆ):</span> <span className="text-red-600">- ฿{result.totalDeduction.toLocaleString()}</span></li>
            <li className="flex justify-between font-bold text-lg pt-2 border-t border-blue-200">
              <span>รายได้สุทธิเพื่อนำไปคิดภาษี:</span> <span>฿{result.netIncome.toLocaleString()}</span>
            </li>
          </ul>
        </div>
      )}

    </div>
  );
}