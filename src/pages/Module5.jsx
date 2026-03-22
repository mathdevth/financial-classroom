import React, { useState, useEffect, useCallback } from 'react'; // ✅ เพิ่ม useCallback
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

  // ✅ 1. ลอจิกการคำนวณ (หุ้มด้วย useCallback เพื่อให้เรียกใช้ตอนโหลดข้อมูลได้)
  const calculateProjection = useCallback((currentInputs = inputs, currentAlloc = allocations) => {
    const totalAllocation = currentAlloc.emergency + currentAlloc.happiness + currentAlloc.wealth;
    if (totalAllocation !== 100) {
      if (isCalculated) alert(`สัดส่วนรวมต้องได้ 100% (ตอนนี้คือ ${totalAllocation}%)`);
      return;
    }

    let data = [];
    let currentSalary = currentInputs.startingSalary;
    let totalE = 0; let totalH = 0; let totalW = 0;
    
    const rateE = 0.02; // กองทุนฉุกเฉิน 2%
    const rateW = 0.08; // กองทุนมั่งคั่ง 8%

    for (let year = 1; year <= currentInputs.yearsToSimulate; year++) {
      let monthlyRem = currentSalary - currentInputs.monthlyExpense;
      if (monthlyRem < 0) monthlyRem = 0;
      let yearlyRem = monthlyRem * 12;

      let cE = yearlyRem * (currentAlloc.emergency / 100);
      let cH = yearlyRem * (currentAlloc.happiness / 100);
      let cW = yearlyRem * (currentAlloc.wealth / 100);

      let iE = (totalE + cE) * rateE;
      let iW = (totalW + cW) * rateW;
      
      totalE += cE + iE;
      totalH += cH;
      totalW += cW + iW;
      
      data.push({
        year: `ปีที่ ${year}`,
        "กองทุนฉุกเฉิน": Math.round(totalE),
        "กองทุนความสุข": Math.round(totalH),
        "กองทุนมั่งคั่ง": Math.round(totalW),
        totalWealth: Math.round(totalE + totalH + totalW)
      });

      currentSalary *= (1 + (currentInputs.salaryIncrease / 100));
    }

    setProjectionData(data);
    setIsCalculated(true);
  }, [inputs, allocations, isCalculated]);

  // ✅ 2. 🤖 ระบบ Smart Load (ป้องกัน Cache และชื่อภาษาไทย)
  useEffect(() => {
    const loadOldData = async () => {
      if (!user?.id) return;
      try {
        // เติม &t= ป้องกัน Cache และ encodeURIComponent ป้องกันชื่อโมดูลเพี้ยน
        const url = `${GOOGLE_SCRIPT_URL}?action=getLatestRecord&userId=${user.id}&moduleName=${encodeURIComponent("Module 5: Life Planner")}&t=${Date.now()}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.status === "success" && result.rawData) {
          const oldData = JSON.parse(result.rawData);
          if (oldData.inputs) setInputs(oldData.inputs);
          if (oldData.allocations) setAllocations(oldData.allocations);
          
          // ✅ สั่งคำนวณและโชว์กราฟทันทีหลังโหลดข้อมูลสำเร็จ
          calculateProjection(oldData.inputs, oldData.allocations);
          console.log("โหลดแผนชีวิตเดิมเรียบร้อย!");
        }
      } catch (e) { console.log("ยังไม่มีแผนเดิม"); }
    };
    loadOldData();
  }, [user.id, calculateProjection]);

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setInputs({ ...inputs, [e.target.name]: Number(value) });
  };

  const handleAllocationChange = (e) => {
    setAllocations({ ...allocations, [e.target.name]: Number(e.target.value) });
  };

  const saveToGoogleSheets = async () => {
    setIsSubmitting(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, { 
        method: "POST", mode: "no-cors", 
        body: JSON.stringify({
          action: "save", userId: user.id,
          moduleName: "Module 5: Life Planner",
          actionData: JSON.stringify({ inputs, allocations }) 
        }) 
      });
      setSubmitStatus('บันทึกสำเร็จ ✅');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (error) { setSubmitStatus('ผิดพลาด ❌'); }
    finally { setIsSubmitting(false); }
  };

  const renderLogicCard = () => (
    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 space-y-4 text-sm">
      <p className="font-black text-blue-600 uppercase tracking-widest text-[10px]">Financial Engine Logic</p>
      <div className="space-y-2 text-slate-600 font-medium">
        <p>1. <b>รายได้</b> เพิ่มตามอัตราเงินเดือนขึ้นรายปี</p>
        <p>2. <b>เงินออม</b> = รายได้ - รายจ่ายประจำ (ออม 100% ของส่วนเหลือ)</p>
        <p>3. <b>การเติบโต</b>: ฉุกเฉินโต 2%, มั่งคั่งโต 8% ต่อปี (ทบต้น)</p>
        <div className="pt-2 border-t border-blue-200">
           <p className="text-center font-serif italic py-1 text-slate-800">
             {'W_next = (W_now + Savings) × (1 + r)'}
           </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen font-sans animate-fadeIn">
      
      <section className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl flex items-center gap-6 relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px]"></div>
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg relative z-10 shrink-0">🏆</div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tight">Life Path Designer</h2>
          <p className="text-slate-400 font-medium italic">จำลองเส้นทางความมั่งคั่ง 30 ปีข้างหน้า</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
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
              <Slider label="กองทุนฉุกเฉิน (2%)" name="emergency" value={allocations.emergency} onChange={handleAllocationChange} color="blue" />
              <Slider label="กองทุนความสุข (ใช้สอย)" name="happiness" value={allocations.happiness} onChange={handleAllocationChange} color="orange" />
              <Slider label="กองทุนมั่งคั่ง (8%)" name="wealth" value={allocations.wealth} onChange={handleAllocationChange} color="green" />
              <div className={`text-center p-3 rounded-2xl text-xs font-black transition-all ${allocations.emergency + allocations.happiness + allocations.wealth === 100 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                รวม: {allocations.emergency + allocations.happiness + allocations.wealth}% {allocations.emergency + allocations.happiness + allocations.wealth !== 100 && '(ต้องครบ 100%)'}
              </div>
            </div>

            {renderLogicCard()}

            <button onClick={() => calculateProjection()} className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all text-lg">
              รันผลจำลองอนาคต
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          {isCalculated ? (
            <div className="animate-fadeIn space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-indigo-100 relative overflow-hidden">
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <h4 className="font-black text-slate-800">Wealth Stacked Area Chart</h4>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase">เป้าหมายปีที่ {inputs.yearsToSimulate}</p>
                    <p className="text-3xl font-black text-indigo-600">฿{projectionData.length > 0 ? projectionData[projectionData.length-1].totalWealth.toLocaleString() : 0}</p>
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

              <div className="bg-slate-900 text-white p-8 rounded-3xl flex justify-between items-center shadow-2xl border border-slate-800">
                <div className="flex-1">
                  <p className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-1">Success Projection</p>
                  <p className="text-sm font-bold text-slate-300">ความมั่งคั่งรวม ฿{projectionData.length > 0 ? projectionData[projectionData.length-1].totalWealth.toLocaleString() : 0} ในอีก {inputs.yearsToSimulate} ปี</p>
                </div>
                <button onClick={saveToGoogleSheets} disabled={isSubmitting} className="px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-2xl transition-all flex items-center gap-2 active:scale-95 shadow-lg shrink-0">
                  <span className="material-symbols-outlined">{isSubmitting ? 'sync' : 'cloud_done'}</span>
                  {submitStatus || 'บันทึกแผนล่าสุด'}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-100 rounded-[3.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-slate-400 text-center font-bold">
              <span className="material-symbols-outlined text-8xl mb-6 opacity-20">insights</span>
              <p>กรอกข้อมูลตัวแปรชีวิต <br/>เพื่อจำลองเส้นทางการเงินในอนาคต</p>
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