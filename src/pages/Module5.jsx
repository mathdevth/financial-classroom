import React, { useState } from 'react';

export default function Module5LifePlanner({ user }) {
  // 1. State สำหรับตัวแปรพื้นฐาน
  const [inputs, setInputs] = useState({
    startingSalary: 15000,
    salaryIncrease: 5,
    monthlyExpense: 11000,
    yearsToSimulate: 30
  });

  // 2. State สำหรับสัดส่วนการออม
  const [allocations, setAllocations] = useState({
    emergency: 40,
    happiness: 20,
    wealth: 40
  });

  const [projectionData, setProjectionData] = useState([]);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setInputs({ ...inputs, [e.target.name]: Number(value) });
  };

  const handleAllocationChange = (e) => {
    setAllocations({ ...allocations, [e.target.name]: Number(e.target.value) });
  };

  // 3. ลอจิกการคำนวณจำลองชีวิต (Cash Flow Simulation)
  const calculateProjection = () => {
    const totalAllocation = allocations.emergency + allocations.happiness + allocations.wealth;
    if (totalAllocation !== 100) {
      alert(`สัดส่วนรวมต้องได้ 100% (ตอนนี้คือ ${totalAllocation}%)`);
      return;
    }

    let data = [];
    let currentSalary = inputs.startingSalary;
    let totalE = 0; let totalH = 0; let totalW = 0;
    let totalInterest = 0;

    const rateE = 0.02; // กองทุนฉุกเฉิน 2%
    const rateH = 0.00; // กองทุนความสุข 0%
    const rateW = 0.08; // กองทุนมั่งคั่ง 8%

    for (let year = 1; year <= inputs.yearsToSimulate; year++) {
      let monthlyRem = currentSalary - inputs.monthlyExpense;
      if (monthlyRem < 0) monthlyRem = 0;
      let yearlyRem = monthlyRem * 12;

      let cE = yearlyRem * (allocations.emergency / 100);
      let cH = yearlyRem * (allocations.happiness / 100);
      let cW = yearlyRem * (allocations.wealth / 100);

      let iE = (totalE + cE) * rateE;
      let iW = (totalW + cW) * rateW;
      
      totalE += cE + iE;
      totalH += cH;
      totalW += cW + iW;
      
      let yearInt = iE + iW;
      totalInterest += yearInt;

      data.push({
        year,
        salary: currentSalary,
        remaining: monthlyRem,
        totalE, totalH, totalW,
        yearInt,
        totalInterest
      });

      currentSalary *= (1 + (inputs.salaryIncrease / 100));
    }

    setProjectionData(data);
    setIsCalculated(true);
  };

  // 4. ส่งข้อมูลเข้า Google Sheets
  const saveToGoogleSheets = async () => {
    if (!isCalculated) return alert("กรุณากดคำนวณก่อนครับ");
    setIsSubmitting(true);

    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";
    
    const lastYear = projectionData[projectionData.length - 1];
    const netWorth = lastYear.totalE + lastYear.totalH + lastYear.totalW;

    const payload = {
      action: "save",
      userId: user.id,
      moduleName: "Module 5: Life Planner",
      actionData: `ความมั่งคั่งปีที่ ${inputs.yearsToSimulate}: ฿${Math.round(netWorth).toLocaleString()} | ดอกเบี้ยรวม: ฿${Math.round(lastYear.totalInterest).toLocaleString()}`
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setSubmitStatus('บันทึกโปรเจกต์สำเร็จ! ✅');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (error) {
      setSubmitStatus('เกิดข้อผิดพลาด ❌');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen font-sans">
      
      {/* Header */}
      <section className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex items-center gap-6 relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-3xl flex items-center justify-center text-4xl shadow-lg relative z-10">
          🏆
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tight">จำลองแผนการเงินตลอดชีพ (Capstone)</h2>
          <p className="text-slate-400 font-medium italic">"ออกแบบเส้นทางความมั่งคั่งของคุณครูและนักเรียน ในระยะยาว 30 ปี"</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 border-b pb-4">
              <span className="material-symbols-outlined text-blue-600">rocket_launch</span>
              จุดเริ่มต้น
            </h3>
            
            <InputField label="เงินเดือนเริ่มต้น (บาท)" name="startingSalary" value={inputs.startingSalary} onChange={handleInputChange} />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="เงินเดือนขึ้น (%)" name="salaryIncrease" value={inputs.salaryIncrease} onChange={handleInputChange} />
              <InputField label="จำนวนปีจำลอง" name="yearsToSimulate" value={inputs.yearsToSimulate} onChange={handleInputChange} />
            </div>
            <InputField label="รายจ่ายประจำ (บาท/เดือน)" name="monthlyExpense" value={inputs.monthlyExpense} onChange={handleInputChange} />

            <div className="pt-6 border-t border-slate-50 space-y-4">
              <h4 className="text-sm font-black text-slate-800 uppercase">สัดส่วนการออม (ต้องรวมได้ 100%)</h4>
              <Slider label="ฉุกเฉิน (2%)" name="emergency" value={allocations.emergency} onChange={handleAllocationChange} color="blue" />
              <Slider label="ความสุข (0%)" name="happiness" value={allocations.happiness} onChange={handleAllocationChange} color="orange" />
              <Slider label="มั่งคั่ง (8%)" name="wealth" value={allocations.wealth} onChange={handleAllocationChange} color="green" />
              <div className="text-center p-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-500">
                รวม: {allocations.emergency + allocations.happiness + allocations.wealth}%
              </div>
            </div>

            <button onClick={calculateProjection} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all">
              สร้างตารางจำลองชีวิต
            </button>
          </div>
        </div>

        {/* Right: Visualization & Grid */}
        <div className="lg:col-span-8">
          {isCalculated ? (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl shadow-sm border-l-8 border-green-500">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ความมั่งคั่งในปีที่ {inputs.yearsToSimulate}</p>
                  <h3 className="text-4xl font-black text-slate-800">
                    ฿{Math.round(projectionData[projectionData.length - 1].totalE + projectionData[projectionData.length - 1].totalH + projectionData[projectionData.length - 1].totalW).toLocaleString()}
                  </h3>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border-l-8 border-blue-500">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ดอกเบี้ยสะสมทั้งหมด</p>
                  <h3 className="text-4xl font-black text-blue-600">
                    ฿{Math.round(projectionData[projectionData.length - 1].totalInterest).toLocaleString()}
                  </h3>
                </div>
              </div>

              {/* Table Grid */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto max-h-[450px]">
                  <table className="w-full text-right">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase sticky top-0">
                      <tr>
                        <th className="p-4 text-center">ปี</th>
                        <th className="p-4">เงินเดือน</th>
                        <th className="p-4 text-blue-600">เงินเก็บ/ด.</th>
                        <th className="p-4">กองทุนรวม</th>
                        <th className="p-4 text-green-600">ดอกเบี้ยปีนั้น</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-bold text-slate-600 divide-y divide-slate-50">
                      {projectionData.map(row => (
                        <tr key={row.year} className="hover:bg-blue-50/50 transition-colors">
                          <td className="p-4 text-center text-slate-300 font-black">{row.year}</td>
                          <td className="p-4">฿{Math.round(row.salary).toLocaleString()}</td>
                          <td className="p-4 text-blue-600 font-black">฿{Math.round(row.remaining).toLocaleString()}</td>
                          <td className="p-4 font-black text-slate-800">฿{Math.round(row.totalE + row.totalH + row.totalW).toLocaleString()}</td>
                          <td className="p-4 text-green-600">+฿{Math.round(row.yearInt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button onClick={saveToGoogleSheets} disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 active:scale-95 transition-all">
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกความมั่งคั่งลง Google Sheets'}
              </button>
              {submitStatus && <p className="text-center text-xs font-black text-green-600 animate-bounce">{submitStatus}</p>}
            </div>
          ) : (
            <div className="bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 h-full min-h-[500px] flex flex-col items-center justify-center text-slate-400 text-center p-12">
              <span className="material-symbols-outlined text-6xl mb-4">analytics</span>
              <h4 className="text-xl font-black text-slate-600 mb-2">ออกแบบเส้นทางชีวิตของคุณ</h4>
              <p className="max-w-xs text-sm font-medium leading-relaxed">กำหนดเป้าหมายการออมและรายได้ที่คอลัมน์ซ้ายมือ เพื่อดูว่าในอีก 30 ปีข้างหน้า พลังของดอกเบี้ยทบต้นจะสร้างความมั่งคั่งให้คุณได้เท่าไหร่</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-Components
function InputField({ label, name, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input type="text" name={name} value={value === 0 ? '' : value} onChange={onChange} className="w-full px-4 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-black text-slate-700 shadow-inner" placeholder="0" />
      <p className="text-[9px] font-black text-blue-500 text-right mr-1">= {Number(value).toLocaleString()}</p>
    </div>
  );
}

function Slider({ label, name, value, onChange, color }) {
  const accentColor = color === 'blue' ? 'accent-blue-600' : color === 'orange' ? 'accent-orange-500' : 'accent-green-600';
  const textColor = color === 'blue' ? 'text-blue-600' : color === 'orange' ? 'text-orange-500' : 'text-green-600';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-black uppercase">
        <span className="text-slate-500">{label}</span>
        <span className={textColor}>{value}%</span>
      </div>
      <input type="range" name={name} min="0" max="100" value={value} onChange={onChange} className={`w-full ${accentColor} h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer`} />
    </div>
  );
}