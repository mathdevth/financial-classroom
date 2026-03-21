import React, { useState } from 'react';

export default function Module5LifePlanner() {
  // 1. State สำหรับตัวแปรนำเข้า (ข้อมูลพื้นฐาน)
  const [inputs, setInputs] = useState({
    startingSalary: 15000,   // เงินเดือนเริ่มต้น
    salaryIncrease: 5,       // อัตราเงินเดือนขึ้น (% ต่อปี)
    monthlyExpense: 11000,   // รายจ่ายจำเป็นต่อเดือน
    yearsToSimulate: 30      // ระยะเวลาจำลองแผน (ปี)
  });

  // 2. State สำหรับสัดส่วนการออม (รวมกันต้องได้ 100%)
  const [allocations, setAllocations] = useState({
    emergency: 40,  // เผื่อฉุกเฉิน (ผลตอบแทนจำลอง 2% ต่อปี)
    happiness: 20,  // เพื่อความสุข (ผลตอบแทนจำลอง 0% ต่อปี - เน้นใช้จ่าย)
    wealth: 40      // เน้นผลตอบแทนสูง (ผลตอบแทนจำลอง 8% ต่อปี)
  });

  // 3. State สำหรับเก็บข้อมูลตารางรายปี และ สถานะการคำนวณ
  const [projectionData, setProjectionData] = useState([]);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  // ฟังก์ชันจัดการการเปลี่ยนแปลง Input
  const handleInputChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: Number(e.target.value) });
  };

  const handleAllocationChange = (e) => {
    setAllocations({ ...allocations, [e.target.name]: Number(e.target.value) });
  };

  // 4. ลอจิกหลัก: วนลูปคำนวณแผนการเงินตลอดชีพ
  const calculateProjection = () => {
    // เช็กว่าสัดส่วนรวมกันได้ 100% หรือไม่
    const totalAllocation = allocations.emergency + allocations.happiness + allocations.wealth;
    if (totalAllocation !== 100) {
      alert(`สัดส่วนการออมรวมกันต้องได้ 100% (ตอนนี้รวมได้ ${totalAllocation}%)`);
      return;
    }

    let data = [];
    let currentSalary = inputs.startingSalary;
    
    // ยอดเงินสะสมในแต่ละกองทุน
    let totalEmergency = 0;
    let totalHappiness = 0;
    let totalWealth = 0;
    let totalInterestAccumulated = 0;

    // อัตราผลตอบแทนสมมติของแต่ละกองทุน
    const rateEmergency = 0.02; // 2%
    const rateHappiness = 0.00; // 0% (ถือเป็นเงินพักไว้รอใช้จ่าย)
    const rateWealth = 0.08;    // 8%

    for (let year = 1; year <= inputs.yearsToSimulate; year++) {
      // คำนวณเงินเหลือต่อเดือน
      let monthlyRemaining = currentSalary - inputs.monthlyExpense;
      if (monthlyRemaining < 0) monthlyRemaining = 0; // ป้องกันกรณีรายจ่ายสูงกว่ารายได้
      
      let yearlyRemaining = monthlyRemaining * 12;

      // แบ่งเงินเข้ากองทุนต่างๆ ตาม %
      let contribE = yearlyRemaining * (allocations.emergency / 100);
      let contribH = yearlyRemaining * (allocations.happiness / 100);
      let contribW = yearlyRemaining * (allocations.wealth / 100);

      // คำนวณดอกเบี้ยของปีนี้ (เงินต้นสะสมปีก่อน + เงินที่เติมปีนี้) * อัตราผลตอบแทน
      let interestE = (totalEmergency + contribE) * rateEmergency;
      let interestW = (totalWealth + contribW) * rateWealth;
      let interestH = (totalHappiness + contribH) * rateHappiness;

      // อัปเดตยอดเงินสะสมรวม
      totalEmergency += contribE + interestE;
      totalHappiness += contribH + interestH;
      totalWealth += contribW + interestW;

      let yearlyInterest = interestE + interestW + interestH;
      totalInterestAccumulated += yearlyInterest;

      // เก็บข้อมูลของปีนี้ลง Array
      data.push({
        year: year,
        salary: currentSalary,
        remaining: monthlyRemaining,
        totalEmergency: totalEmergency,
        totalHappiness: totalHappiness,
        totalWealth: totalWealth,
        yearlyInterest: yearlyInterest,
        totalInterestAccumulated: totalInterestAccumulated
      });

      // อัปเดตเงินเดือนสำหรับปีถัดไป (ทบต้นตาม % ที่ขึ้น)
      currentSalary = currentSalary * (1 + (inputs.salaryIncrease / 100));
    }

    setProjectionData(data);
    setIsCalculated(true);
  };

  // 5. ส่งข้อมูลเข้า Google Sheets
  const saveToGoogleSheets = async () => {
    if (!isCalculated) return alert("กรุณากดจำลองแผนการเงินก่อนบันทึกข้อมูล");
    setIsSubmitting(true);
    setSubmitStatus('กำลังบันทึก...');

    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/ใส่_URL_ของคุณที่นี่/exec";
    
    // ดึงข้อมูลปีสุดท้ายมาสรุปผล
    const lastYearData = projectionData[projectionData.length - 1];
    const totalNetWorth = lastYearData.totalEmergency + lastYearData.totalHappiness + lastYearData.totalWealth;

    const payload = {
      userId: "Student_001",
      moduleName: "Module 5: Life Financial Planner",
      actionData: `ความมั่งคั่งปีที่ ${inputs.yearsToSimulate}: ${Math.round(totalNetWorth)} บาท | ดอกเบี้ยสะสม: ${Math.round(lastYearData.totalInterestAccumulated)} บาท`
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setSubmitStatus('บันทึกความสำเร็จ! ✅');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (error) {
      setSubmitStatus('เกิดข้อผิดพลาด ❌');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="bg-slate-900 p-8 rounded-xl shadow-lg border border-slate-800 flex items-center gap-6">
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-3xl shadow-inner text-white">
          <span className="material-symbols-outlined text-4xl">emoji_events</span>
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-white mb-1">จำลองแผนการเงินตลอดชีพ (Capstone)</h2>
          <p className="text-slate-400">สร้างตารางกระแสเงินสดจำลองการทำงาน แบ่งเงินออม และดูพลังของดอกเบี้ยในระยะยาว</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Area: Inputs & Allocations */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* ข้อมูลรายได้-รายจ่าย */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-blue-900 border-b pb-2">1. จุดเริ่มต้นของคุณ</h3>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">เงินเดือนเริ่มต้น (บาท)</label>
              <input 
                type="number" name="startingSalary" value={inputs.startingSalary} onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-100 border-none rounded focus:ring-2 focus:ring-blue-500 font-bold text-blue-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">เงินเดือนขึ้น (ต่อปี)</label>
                <div className="relative">
                  <input 
                    type="number" name="salaryIncrease" value={inputs.salaryIncrease} onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-100 border-none rounded focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">ระยะเวลา (ปี)</label>
                <input 
                  type="number" name="yearsToSimulate" value={inputs.yearsToSimulate} onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-100 border-none rounded focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <label className="text-sm font-bold text-slate-700">รายจ่ายจำเป็น (บาท/เดือน)</label>
              <input 
                type="number" name="monthlyExpense" value={inputs.monthlyExpense} onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-100 border-none rounded focus:ring-2 focus:ring-blue-500 font-bold text-red-600"
              />
            </div>
          </div>

          {/* สัดส่วนการออม */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-bold text-blue-900">2. สัดส่วนแบ่งเงินออม</h3>
              <span className={`text-sm font-bold px-2 py-1 rounded ${
                (allocations.emergency + allocations.happiness + allocations.wealth) === 100 
                ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                รวม: {allocations.emergency + allocations.happiness + allocations.wealth}%
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                  <span>กองทุนสำรองฉุกเฉิน (เป้า 2% ต่อปี)</span>
                  <span className="text-blue-600">{allocations.emergency}%</span>
                </label>
                <input 
                  type="range" name="emergency" min="0" max="100" 
                  value={allocations.emergency} onChange={handleAllocationChange}
                  className="w-full accent-blue-600"
                />
              </div>
              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                  <span>กองทุนความสุข (ใช้จ่าย 0%)</span>
                  <span className="text-orange-500">{allocations.happiness}%</span>
                </label>
                <input 
                  type="range" name="happiness" min="0" max="100" 
                  value={allocations.happiness} onChange={handleAllocationChange}
                  className="w-full accent-orange-500"
                />
              </div>
              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                  <span>กองทุนความมั่งคั่ง (เป้า 8% ต่อปี)</span>
                  <span className="text-green-600">{allocations.wealth}%</span>
                </label>
                <input 
                  type="range" name="wealth" min="0" max="100" 
                  value={allocations.wealth} onChange={handleAllocationChange}
                  className="w-full accent-green-600"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={calculateProjection}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-lg shadow-md hover:from-blue-700 hover:to-blue-900 transition-all active:scale-95 text-lg"
          >
            สร้างตารางจำลองชีวิต
          </button>
        </div>

        {/* Right Area: Data Grid & Results */}
        <div className="lg:col-span-8">
          {isCalculated ? (
            <div className="space-y-6 animate-fade-in">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-xl border-l-4 border-green-500 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">ความมั่งคั่งรวม (ปีที่ {inputs.yearsToSimulate})</p>
                  <h3 className="text-3xl font-black text-green-700">
                    ฿{(projectionData[projectionData.length - 1].totalEmergency + projectionData[projectionData.length - 1].totalHappiness + projectionData[projectionData.length - 1].totalWealth).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </h3>
                </div>
                <div className="bg-white p-6 rounded-xl border-l-4 border-blue-500 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">ดอกเบี้ยสะสมทั้งหมด</p>
                  <h3 className="text-3xl font-black text-blue-700">
                    ฿{projectionData[projectionData.length - 1].totalInterestAccumulated.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </h3>
                </div>
              </div>

              {/* Data Grid Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-right border-collapse">
                    <thead className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider sticky top-0 shadow-sm z-10">
                      <tr>
                        <th className="p-4 text-center border-b border-slate-200">ปีที่</th>
                        <th className="p-4 border-b border-slate-200">เงินเดือน</th>
                        <th className="p-4 border-b border-slate-200 text-blue-700">เหลือเก็บ/ด.</th>
                        <th className="p-4 border-b border-slate-200">กองทุนฉุกเฉิน</th>
                        <th className="p-4 border-b border-slate-200">กองทุนความสุข</th>
                        <th className="p-4 border-b border-slate-200 text-green-700">กองทุนมั่งคั่ง</th>
                        <th className="p-4 border-b border-slate-200 bg-blue-50 text-blue-800">ดอกเบี้ยปีนั้น</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-medium">
                      {projectionData.map((row) => (
                        <tr key={row.year} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 text-center font-bold text-slate-800">{row.year}</td>
                          <td className="p-4 text-slate-600">฿{Math.round(row.salary).toLocaleString()}</td>
                          <td className="p-4 text-blue-700 font-bold">฿{Math.round(row.remaining).toLocaleString()}</td>
                          <td className="p-4 text-slate-600">฿{Math.round(row.totalEmergency).toLocaleString()}</td>
                          <td className="p-4 text-slate-600">฿{Math.round(row.totalHappiness).toLocaleString()}</td>
                          <td className="p-4 text-green-700 font-bold">฿{Math.round(row.totalWealth).toLocaleString()}</td>
                          <td className="p-4 bg-blue-50/50 text-blue-800">฿{Math.round(row.yearlyInterest).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Save Action */}
              <div className="flex justify-end pt-2">
                <div className="w-full md:w-1/2">
                  <button 
                    onClick={saveToGoogleSheets}
                    disabled={isSubmitting}
                    className={`w-full py-4 font-bold rounded-lg transition-all border-2 ${
                      isSubmitting ? 'border-slate-300 text-slate-500 bg-slate-100' : 'border-slate-800 text-slate-800 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    {isSubmitting ? 'กำลังส่งข้อมูล...' : 'บันทึก Capstone Project'}
                  </button>
                  {submitStatus && <p className="text-center text-sm font-bold text-green-600 mt-2">{submitStatus}</p>}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-200/50 p-8 rounded-xl border border-slate-200 border-dashed h-full min-h-[500px] flex flex-col items-center justify-center text-slate-400">
              <span className="material-symbols-outlined text-7xl mb-4 opacity-50">table_chart</span>
              <p className="font-bold text-xl text-slate-500">ตารางจำลองกระแสเงินสดจะแสดงที่นี่</p>
              <p className="text-sm mt-2 text-slate-400">กำหนดตัวแปรด้านซ้ายแล้วกดปุ่ม "สร้างตาราง"</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}