import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Module5LifePlanner({ user }) {
  const [inputs, setInputs] = useState({
    startingSalary: 15000,
    salaryIncrease: 5,
    monthlyExpense: 11000,
    yearsToSimulate: 30
  });

  const [allocations, setAllocations] = useState({
    emergency: 40,
    happiness: 20,
    wealth: 40
  });

  const [projectionData, setProjectionData] = useState([]);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  // ✅ 1. ระบบดึงข้อมูลแผนล่าสุด (Smart Load)
  useEffect(() => {
    const loadOldData = async () => {
      try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getLatestRecord&userId=${user.id}&moduleName=Module 5: Life Planner`);
        const result = await response.json();
        if (result.status === "success" && result.rawData) {
          const oldData = JSON.parse(result.rawData);
          if (oldData.inputs) setInputs(oldData.inputs);
          if (oldData.allocations) setAllocations(oldData.allocations);
          console.log("โหลดแผนชีวิตเก่าเรียบร้อย!");
        }
      } catch (e) { console.log("ยังไม่มีแผนเดิม"); }
    };
    loadOldData();
  }, [user.id]);

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setInputs({ ...inputs, [e.target.name]: Number(value) });
  };

  const handleAllocationChange = (e) => {
    setAllocations({ ...allocations, [e.target.name]: Number(e.target.value) });
  };

  // ✅ 2. ลอจิกการคำนวณจำลองอนาคต
  const calculateProjection = () => {
    const totalAllocation = allocations.emergency + allocations.happiness + allocations.wealth;
    if (totalAllocation !== 100) {
      alert(`สัดส่วนรวมต้องได้ 100% (ตอนนี้คือ ${totalAllocation}%)`);
      return;
    }

    let data = [];
    let currentSalary = inputs.startingSalary;
    let totalE = 0; let totalH = 0; let totalW = 0;
    
    // อัตราผลตอบแทนคาดหวังในแต่ละกองทุน
    const rateE = 0.02; // กองทุนฉุกเฉิน (เงินฝาก/ตลาดเงิน) 2%
    const rateW = 0.08; // กองทุนมั่งคั่ง (หุ้น/กองทุนรวม) 8%

    for (let year = 1; year <= inputs.yearsToSimulate; year++) {
      let monthlyRem = currentSalary - inputs.monthlyExpense;
      if (monthlyRem < 0) monthlyRem = 0;
      let yearlyRem = monthlyRem * 12;

      // เงินสมทบเข้าแต่ละกองทุนตามสัดส่วน
      let cE = yearlyRem * (allocations.emergency / 100);
      let cH = yearlyRem * (allocations.happiness / 100);
      let cW = yearlyRem * (allocations.wealth / 100);

      // คิดดอกเบี้ยทบต้น (Compound Interest)
      let iE = (totalE + cE) * rateE;
      let iW = (totalW + cW) * rateW;
      
      totalE += cE + iE;
      totalH += cH; // กองทุนความสุขมักจะถูกใช้ไป จึงไม่คิดดอกเบี้ยทบต้นสะสมมากนักในโมเดลนี้
      totalW += cW + iW;
      
      data.push({
        year: `ปีที่ ${year}`,
        salary: Math.round(currentSalary),
        remaining: Math.round(monthlyRem),
        "กองทุนฉุกเฉิน": Math.round(totalE),
        "กองทุนความสุข": Math.round(totalH),
        "กองทุนมั่งคั่ง": Math.round(totalW),
        totalWealth: Math.round(totalE + totalH + totalW),
        yearInt: Math.round(iE + iW)
      });

      // เงินเดือนเพิ่มขึ้นทุกปี
      currentSalary *= (1 + (inputs.salaryIncrease / 100));
    }

    setProjectionData(data);
    setIsCalculated(true);
  };

  const saveToGoogleSheets = async () => {
    setIsSubmitting(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, { 
        method: "POST", mode: "no-cors", 
        body: JSON.stringify({
          action: "save", userId: user.id,
          moduleName: "Module 5: Life Planner",
          // ✅ บันทึกข้อมูลดิบ JSON เพื่อใช้ดึงกลับมาทำใหม่
          actionData: JSON.stringify({ inputs, allocations }) 
        }) 
      });
      setSubmitStatus('บันทึกสำเร็จ ✅');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (error) { setSubmitStatus('ผิดพลาด ❌'); }
    finally { setIsSubmitting(false); }
  };

  // ✅ 3. ส่วนแสดงตรรกะการเติบโต
  const renderLogicCard = () => (
    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 space-y-4 text-sm">
      <p className="font-black text-blue-600 uppercase tracking-widest text-[10px]">Financial Engine Logic</p>
      <div className="space-y-2 text-slate-600 font-medium">
        <p>1. <b>รายได้เพิ่ม</b> ตามอัตราเงินเดือนขึ้นรายปี</p>
        <p>2. <b>เงินออม</b> = รายได้ - รายจ่ายประจำ (ออม 100% ของส่วนเหลือ)</p>
        <p>3. <b>การเติบโต</b>: ฉุกเฉินโต 2%, มั่งคั่งโต 8% ต่อปี (ทบต้น)</p>
        <div className="pt-2 border-t border-blue-200 text-[10px] italic">
          $$W_{next} = (W_{now} + Contribution) \times (1 + r)$$
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen font-sans">
      
      {/* Header */}
      <section className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl flex items-center gap-6 relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px]"></div>
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg relative z-10 shrink-0">🏆</div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tight tracking-tighter">Life Path Designer</h2>
          <p className="text-slate-400 font-medium">โมดูลที่ 5: ออกแบบเส้นทางความมั่งคั่ง 30 ปี</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Input & Allocation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-lg font-black text-slate-800 border-b pb-4">ตั้งค่าตัวแปรชีวิต</h3>
            
            <InputField label="เงินเดือนเริ่มต้น (บาท)" name="startingSalary" value={inputs.startingSalary} onChange={handleInputChange} />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="เงินเดือนขึ้น (%)" name="salaryIncrease" value={inputs.salaryIncrease} onChange={handleInputChange} />
              <InputField label="ระยะเวลา (ปี)" name="yearsToSimulate" value={inputs.yearsToSimulate} onChange={handleInputChange} />
            </div>
            <InputField label="รายจ่ายประจำ (บาท/เดือน)" name="monthlyExpense" value={inputs.monthlyExpense} onChange={handleInputChange} />

            <div className="pt-4 border-t border-slate-50 space-y-5">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">สัดส่วนการกระจายเงินเก็บ</h4>
              <Slider label="กองทุนฉุกเฉิน (ดอกเบี้ย 2%)" name="emergency" value={allocations.emergency} onChange={handleAllocationChange} color="blue" />
              <Slider label="กองทุนความสุข (ใช้สอย)" name="happiness" value={allocations.happiness} onChange={handleAllocationChange} color="orange" />
              <Slider label="กองทุนมั่งคั่ง (ลงทุน 8%)" name="wealth" value={allocations.wealth} onChange={handleAllocationChange} color="green" />
              <div className={`text-center p-3 rounded-2xl text-xs font-black transition-all ${allocations.emergency + allocations.happiness + allocations.wealth === 100 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                รวมทั้งหมด: {allocations.emergency + allocations.happiness + allocations.wealth}% {allocations.emergency + allocations.happiness + allocations.wealth !== 100 && '(ต้องครบ 100%)'}
              </div>
            </div>

            {renderLogicCard()}

            <button onClick={calculateProjection} className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all text-lg">
              รันผลจำลองอนาคต
            </button>
          </div>
        </div>

        {/* Right: Visualization */}
        <div className="lg:col-span-7 space-y-6">
          {isCalculated ? (
            <div className="animate-fadeIn space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-indigo-100 relative overflow-hidden">
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <h4 className="font-black text-slate-800">กราฟความมั่งคั่งแบบกองรวม (Stacked Area)</h4>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase">เป้าหมายปีที่ {inputs.yearsToSimulate}</p>
                    <p className="text-3xl font-black text-indigo-600">฿{projectionData[projectionData.length-1].totalWealth.toLocaleString()}</p>
                  </div>
                </div>

                <div className="h-[400px] w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData}>
                      <defs>
                        <linearGradient id="colorE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/></linearGradient>
                        <linearGradient id="colorH" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/></linearGradient>
                        <linearGradient id="colorW" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} formatter={(v) => `฿${v.toLocaleString()}`} />
                      <Legend verticalAlign="top" height={36} />
                      <Area stackId="1" type="monotone" dataKey="กองทุนฉุกเฉิน" stroke="#3b82f6" fill="url(#colorE)" />
                      <Area stackId="1" type="monotone" dataKey="กองทุนความสุข" stroke="#f59e0b" fill="url(#colorH)" />
                      <Area stackId="1" type="monotone" dataKey="กองทุนมั่งคั่ง" stroke="#10b981" fill="url(#colorW)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-8 rounded-3xl flex justify-between items-center shadow-2xl">
                <div>
                  <p className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-1">สรุปแผนของคุณ</p>
                  <p className="text-sm font-bold text-slate-300">คุณจะมีความมั่งคั่งรวม ฿{projectionData[projectionData.length-1].totalWealth.toLocaleString()} ในอีก {inputs.yearsToSimulate} ปี</p>
                </div>
                <button onClick={saveToGoogleSheets} disabled={isSubmitting} className="px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-2xl transition-all flex items-center gap-2 active:scale-95 shadow-lg">
                  <span className="material-symbols-outlined">{isSubmitting ? 'sync' : 'cloud_done'}</span>
                  {submitStatus || 'บันทึกแผนชีวิต'}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-100 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-slate-400 text-center">
              <span className="material-symbols-outlined text-8xl mb-6 opacity-20">rocket_launch</span>
              <h4 className="text-2xl font-black text-slate-600 mb-2">ออกแบบอนาคตของคุณ</h4>
              <p className="max-w-xs text-sm font-medium leading-relaxed italic">"การออมที่ดีที่สุด คือการออมที่เริ่มตั้งแต่วันที่เงินเดือนเดือนแรกออก"</p>
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
      <input type="text" name={name} value={value === 0 ? '' : value} onChange={onChange} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-black text-slate-700 outline-none transition-all shadow-inner" placeholder="0" />
      <p className="text-[9px] font-black text-indigo-500 text-right mr-1">= {Number(value).toLocaleString()}</p>
    </div>
  );
}

function Slider({ label, name, value, onChange, color }) {
  const accentColor = color === 'blue' ? 'accent-blue-600' : color === 'orange' ? 'accent-orange-500' : 'accent-green-600';
  const textColor = color === 'blue' ? 'text-blue-600' : color === 'orange' ? 'text-orange-500' : 'text-green-600';
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
        <span className="text-slate-500">{label}</span>
        <span className={`${textColor} bg-white px-2 py-0.5 rounded-lg border shadow-sm`}>{value}%</span>
      </div>
      <input type="range" name={name} min="0" max="100" value={value} onChange={onChange} className={`w-full ${accentColor} h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer`} />
    </div>
  );
}