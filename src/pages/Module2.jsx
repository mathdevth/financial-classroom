import React, { useState } from 'react';

export default function Module2TaxSimulator({ user }) {
  // 1. State สำหรับรายได้แยกตามประเภทมาตรา 40
  const [incomes, setIncomes] = useState({
    m40_1: 0, // เงินเดือน/โบนัส
    m40_2: 0, // รับเหมา/นายหน้า
    m40_3: 0, // ค่าลิขสิทธิ์
    m40_8: 0, // ธุรกิจ/ขายของออนไลน์
  });

  const [deductions, setDeductions] = useState({
    lifeInsurance: 0,
    rmf_ssf: 0,
    socialSecurity: 0,
  });

  const [result, setResult] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalDeduction: 0,
    netIncome: 0,
    taxToPay: 0,
    isCalculated: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  // ฟังก์ชันจัดการการพิมพ์ (จำกัดเฉพาะตัวเลข)
  const handleInputChange = (e, setter, state) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // กรองเฉพาะตัวเลข
    setter({ ...state, [e.target.name]: Number(value) });
  };

  // 3. คำนวณภาษีตามกฎหมายไทย
  const calculateTax = () => {
    // 3.1 รวมรายได้ทั้งหมด
    const totalInc = incomes.m40_1 + incomes.m40_2 + incomes.m40_3 + incomes.m40_8;

    // 3.2 หักค่าใช้จ่าย (Expenses)
    // มาตรา 40(1) และ 40(2) หักรวมกันได้ 50% แต่ไม่เกิน 100,000 บาท
    const exp1_2 = Math.min((incomes.m40_1 + incomes.m40_2) * 0.5, 100000);
    // มาตรา 40(3) หักได้ 50% ไม่เกิน 100,000 บาท
    const exp3 = Math.min(incomes.m40_3 * 0.5, 100000);
    // มาตรา 40(8) สมมติหักเหมาแบบธุรกิจทั่วไป 60%
    const exp8 = incomes.m40_8 * 0.6;
    
    const totalExp = exp1_2 + exp3 + exp8;

    // 3.3 หักค่าลดหย่อน (Deductions)
    const personalDeduction = 60000; // ลดหย่อนส่วนตัวพื้นฐาน
    const validLifeIns = Math.min(deductions.lifeInsurance, 100000);
    const totalDed = personalDeduction + validLifeIns + deductions.rmf_ssf + deductions.socialSecurity;

    // 3.4 รายได้สุทธิ
    let netInc = totalInc - totalExp - totalDed;
    if (netInc < 0) netInc = 0;

    // 3.5 ภาษีขั้นบันได
    let tax = 0;
    let tempNet = netInc;
    const brackets = [
      { limit: 150000, rate: 0 },
      { limit: 150000, rate: 0.05 },
      { limit: 200000, rate: 0.10 },
      { limit: 250000, rate: 0.15 },
      { limit: 250000, rate: 0.20 },
      { limit: 1000000, rate: 0.25 },
      { limit: 3000000, rate: 0.30 },
      { limit: Infinity, rate: 0.35 }
    ];

    for (const b of brackets) {
      if (tempNet <= 0) break;
      const taxable = Math.min(tempNet, b.limit);
      tax += taxable * b.rate;
      tempNet -= taxable;
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

  const saveToGoogleSheets = async () => {
    if (!result.isCalculated) return alert("กรุณากดคำนวณก่อนครับ");
    setIsSubmitting(true);
    
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

    const payload = {
      action: "save", // ✅ เพิ่ม action เพื่อให้ script รู้ว่าต้องบันทึก
      userId: user.id, // ✅ ใช้ id จริงจาก User
      moduleName: "Module 2: คำนวณภาษี",
      actionData: `รายได้สุทธิ: ฿${result.netIncome.toLocaleString()} | ภาษีที่ต้องจ่าย: ฿${result.taxToPay.toLocaleString()}`
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setSubmitStatus('บันทึกสำเร็จ ✅');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (error) {
      setSubmitStatus('บันทึกล้มเหลว ❌');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-slate-50 min-h-screen font-sans">
      
      {/* ส่วนแสดงผลลัพธ์ (สวยงาม มีคอมม่า) */}
      <section className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <span className="text-blue-600 font-black text-xs uppercase tracking-widest mb-2 block">ประมาณการภาษีที่ต้องชำระ</span>
          <h2 className="text-6xl font-black text-slate-900 tracking-tighter">
            ฿{result.taxToPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h2>
          <p className="text-slate-400 mt-2 font-bold uppercase text-[10px]">รายได้สุทธิที่นำมาคำนวณ: ฿{result.netIncome.toLocaleString()}</p>
        </div>
        <div className="flex flex-col gap-3 w-full md:w-64 relative z-10">
          <button onClick={calculateTax} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all">คำนวณผลลัพธ์</button>
          <button onClick={saveToGoogleSheets} disabled={isSubmitting} className="w-full py-3 bg-white border-2 border-green-500 text-green-600 font-black rounded-2xl hover:bg-green-50 active:scale-95 transition-all disabled:opacity-50">
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกลงฐานข้อมูล'}
          </button>
          {submitStatus && <p className="text-center text-xs font-black text-green-600 animate-bounce">{submitStatus}</p>}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* คอลัมน์ซ้าย: รายได้ (ละเอียดยิบ) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 border-b pb-4">
            <span className="material-symbols-outlined text-blue-600">payments</span>
            ประเภทเงินได้ (Annual Income)
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <InputField label="40(1) เงินเดือน / โบนัส ทั้งปี" name="m40_1" value={incomes.m40_1} onChange={(e) => handleInputChange(e, setIncomes, incomes)} />
            <InputField label="40(2) ค่ารับเหมาแรงงาน / นายหน้า" name="m40_2" value={incomes.m40_2} onChange={(e) => handleInputChange(e, setIncomes, incomes)} />
            <InputField label="40(3) ค่าลิขสิทธิ์ / สิทธิบัตร" name="m40_3" value={incomes.m40_3} onChange={(e) => handleInputChange(e, setIncomes, incomes)} />
            <InputField label="40(8) ธุรกิจ / ขายของออนไลน์ / อื่นๆ" name="m40_8" value={incomes.m40_8} onChange={(e) => handleInputChange(e, setIncomes, incomes)} />
          </div>
        </div>

        {/* คอลัมน์ขวา: ค่าลดหย่อน */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 border-b pb-4">
            <span className="material-symbols-outlined text-green-600">redeem</span>
            ค่าลดหย่อน (Deductions)
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <InputField label="เบี้ยประกันชีวิต (สูงสุด 100,000)" name="lifeInsurance" value={deductions.lifeInsurance} onChange={(e) => handleInputChange(e, setDeductions, deductions)} />
            <InputField label="กองทุน RMF / SSF" name="rmf_ssf" value={deductions.rmf_ssf} onChange={(e) => handleInputChange(e, setDeductions, deductions)} />
            <InputField label="เงินสมทบประกันสังคม" name="socialSecurity" value={deductions.socialSecurity} onChange={(e) => handleInputChange(e, setDeductions, deductions)} />
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-[11px] font-bold text-slate-400 uppercase">ลดหย่อนพื้นฐานอัตโนมัติ</p>
              <p className="text-sm font-black text-slate-600">ค่าลดหย่อนส่วนตัว: ฿60,000</p>
            </div>
          </div>
        </div>
      </div>

      {/* สรุปรายละเอียดขั้นบันได */}
      {result.isCalculated && (
        <section className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl animate-fadeIn">
          <h3 className="text-xl font-black mb-6 border-b border-slate-800 pb-4">รายละเอียดการคำนวณ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div className="space-y-3">
              <div className="flex justify-between"><span>รวมรายได้ทั้งหมด:</span> <span className="font-bold">฿{result.totalIncome.toLocaleString()}</span></div>
              <div className="flex justify-between text-red-400"><span>หักค่าใช้จ่ายตามประเภทรายได้:</span> <span>- ฿{result.totalExpense.toLocaleString()}</span></div>
              <div className="flex justify-between text-red-400"><span>หักค่าลดหย่อนทั้งหมด:</span> <span>- ฿{result.totalDeduction.toLocaleString()}</span></div>
            </div>
            <div className="p-6 bg-blue-600/20 rounded-2xl border border-blue-500/30">
              <p className="text-xs font-bold text-blue-400 uppercase mb-1">รายได้สุทธิเพื่อคำนวณภาษี</p>
              <p className="text-3xl font-black">฿{result.netIncome.toLocaleString()}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Sub-Component สำหรับ Input (มีคอมม่าแสดงกำกับ)
function InputField({ label, name, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">{label}</label>
      <div className="relative">
        <input 
          type="text" 
          name={name}
          value={value === 0 ? '' : value}
          onChange={onChange}
          placeholder="0"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-slate-700"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">บาท</span>
      </div>
      <p className="text-[10px] font-bold text-blue-500 text-right mr-2 mt-1">
        = {value.toLocaleString()} ฿
      </p>
    </div>
  );
}