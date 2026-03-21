import React, { useState } from 'react';
// 1. นำเข้า Component สำหรับทำกราฟ
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';

export default function Module4RetirementPlanner({ user }) {
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

  // State สำหรับเก็บข้อมูลกราฟ
  const [chartData, setChartData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setPlanInputs({ ...planInputs, [e.target.name]: Number(value) });
  };

  // 2. ลอจิกการคำนวณ + สร้างข้อมูลกราฟ Retirement Mountain
  const calculateRetirement = () => {
    const { currentAge, retireAge, lifeExpectancy, monthlyExpense, returnRate } = planInputs;
    const yearsToSave = retireAge - currentAge;
    const yearsInRetirement = lifeExpectancy - retireAge;

    if (yearsToSave <= 0 || yearsInRetirement <= 0) {
      alert("กรุณาตรวจสอบข้อมูลอายุ (อายุปัจจุบัน < อายุเกษียณ < อายุขัย)");
      return;
    }

    // คำนวณเงินก้อนสุดท้ายที่ต้องมี (FV ของรายจ่าย)
    const targetFundFV = monthlyExpense * 12 * yearsInRetirement;

    // คำนวณเงินออมรายเดือน
    const r = returnRate / 100;
    const i = r / 12;
    const n = yearsToSave * 12;
    let monthlySaving = i === 0 ? targetFundFV / n : (targetFundFV * i) / (Math.pow(1 + i, n) - 1);

    // --- สร้างข้อมูลกราฟ ---
    let projection = [];
    let currentBalance = 0;
    const yearlySaving = monthlySaving * 12;
    const yearlyExpense = monthlyExpense * 12;

    // ช่วงที่ 1: ช่วงสะสมเงิน (Saving)
    for (let age = currentAge; age <= retireAge; age++) {
      projection.push({
        age: age,
        fund: Math.round(currentBalance),
        phase: 'สะสมเงิน'
      });
      // เพิ่มเงินออมรายปี + ผลตอบแทนทบต้น
      currentBalance = (currentBalance + yearlySaving) * (1 + r);
    }

    // ช่วงที่ 2: ช่วงใช้เงิน (Spending)
    // สมมติว่าหลังเกษียณเงินที่เหลือยังคงได้รับผลตอบแทนบางส่วน (ในที่นี้ใช้ r เดียวกันเพื่อความง่าย)
    for (let age = retireAge + 1; age <= lifeExpectancy; age++) {
      currentBalance = (currentBalance - yearlyExpense) * (1 + r);
      if (currentBalance < 0) currentBalance = 0;
      projection.push({
        age: age,
        fund: Math.round(currentBalance),
        phase: 'ใช้เงินหลังเกษียณ'
      });
    }

    setChartData(projection);
    setResult({
      yearsToSave,
      yearsInRetirement,
      targetFund: targetFundFV,
      monthlySavingNeeded: monthlySaving,
      isCalculated: true
    });
  };

  const saveToGoogleSheets = async () => {
    if (!result.isCalculated) return alert("กรุณากดคำนวณก่อนครับ");
    setIsSubmitting(true);
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";
    
    const payload = {
      action: "save",
      userId: user.id,
      moduleName: "Module 4: วางแผนเกษียณ",
      actionData: `เป้าหมาย: ฿${result.targetFund.toLocaleString()} | ออมเพิ่ม: ฿${Math.ceil(result.monthlySavingNeeded).toLocaleString()}/ด.`
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(payload) });
      setSubmitStatus('บันทึกแผนสำเร็จ! ✅');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (error) {
      setSubmitStatus('ล้มเหลว ❌');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen font-sans">
      
      {/* Header */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6 relative overflow-hidden">
        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center text-4xl shadow-inner shrink-0">🏖️</div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">วางแผนเกษียณอายุ (Retirement Planner)</h2>
          <p className="text-slate-500 font-medium italic">"เกษียณสำราญด้วยพลังแห่งการวางแผนและกราฟภูเขาเงินออม"</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* คอลัมน์ซ้าย: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="อายุปัจจุบัน" name="currentAge" value={planInputs.currentAge} onChange={handleInputChange} />
              <InputField label="อายุเกษียณ" name="retireAge" value={planInputs.retireAge} onChange={handleInputChange} />
            </div>
            <InputField label="อายุขัยคาดหวัง" name="lifeExpectancy" value={planInputs.lifeExpectancy} onChange={handleInputChange} />
            <InputField label="ค่าใช้จ่ายหลังเกษียณ (บาท/เดือน)" name="monthlyExpense" value={planInputs.monthlyExpense} onChange={handleInputChange} />
            <InputField label="ผลตอบแทนคาดหวัง (%)" name="returnRate" value={planInputs.returnRate} onChange={handleInputChange} />

            <button onClick={calculateRetirement} className="w-full py-5 bg-orange-500 text-white font-black rounded-2xl shadow-lg hover:bg-orange-600 active:scale-95 transition-all text-lg">
              วิเคราะห์แผนเกษียณ
            </button>
          </div>
        </div>

        {/* คอลัมน์ขวา: กราฟและสรุปผล */}
        <div className="lg:col-span-8">
          {result.isCalculated ? (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-orange-100 h-full flex flex-col space-y-8 animate-fadeIn relative">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden">
                  <p className="text-orange-400 font-black uppercase text-[10px] tracking-widest mb-1">เป้าหมายเงินกองทุน</p>
                  <h3 className="text-3xl font-black">฿{result.targetFund.toLocaleString()}</h3>
                </div>
                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex flex-col justify-center">
                  <p className="text-[10px] font-black text-orange-800 uppercase">ต้องออมเพิ่มต่อเดือน</p>
                  <h3 className="text-3xl font-black text-orange-600">฿{Math.ceil(result.monthlySavingNeeded).toLocaleString()}</h3>
                </div>
              </div>

              {/* ส่วนแสดงกราฟภูเขาเงินออม */}
              <div className="flex-grow min-h-[350px] w-full pt-4">
                <p className="text-xs font-black text-slate-400 mb-6 uppercase tracking-widest text-center">กราฟจำลองการสะสมและการใช้เงิน (Retirement Mountain)</p>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFund" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="age" label={{ value: 'อายุ (ปี)', position: 'insideBottom', offset: -5, fontSize: 10, fontWeight: 'bold' }} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [`฿${value.toLocaleString()}`, 'ยอดเงินคงเหลือ']}
                    />
                    {/* เส้นมาร์กจุดเกษียณ */}
                    <ReferenceLine x={planInputs.retireAge} stroke="#ef4444" strokeDasharray="3 3">
                      <Label value="เกษียณ" position="top" fill="#ef4444" fontSize={10} fontWeight="bold" />
                    </ReferenceLine>
                    <Area type="monotone" dataKey="fund" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorFund)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-2">
                <button onClick={saveToGoogleSheets} disabled={isSubmitting} className={`w-full py-4 font-black rounded-2xl transition-all border-2 flex items-center justify-center gap-2 ${isSubmitting ? 'bg-slate-50 text-slate-300' : 'border-green-600 text-green-700 hover:bg-green-50'}`}>
                  <span className="material-symbols-outlined">{isSubmitting ? 'sync' : 'save'}</span>
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกแผนเกษียณลง Google Sheets'}
                </button>
                {submitStatus && <p className="text-center text-xs font-black text-green-600 mt-3 animate-bounce">{submitStatus}</p>}
              </div>

            </div>
          ) : (
            <div className="bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 h-full min-h-[450px] flex flex-col items-center justify-center text-slate-400 p-12 text-center font-bold">
              <span className="material-symbols-outlined text-6xl mb-4 opacity-20">landscape</span>
              <p>ระบุอายุและค่าใช้จ่ายเพื่อดู "ภูเขาเงินออม" ของคุณ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-Component Input Field
function InputField({ label, name, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type="text" name={name} value={value === 0 ? '' : value} onChange={onChange}
        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-black text-slate-700 text-lg"
        placeholder="0"
      />
      <p className="text-[10px] font-black text-orange-500 text-right mr-1">= {Number(value).toLocaleString()}</p>
    </div>
  );
}