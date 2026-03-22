import React, { useState, useEffect } from 'react';
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

  const [chartData, setChartData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  // ✅ 1. ระบบดึงข้อมูลเก่า (Smart Load)
  useEffect(() => {
    const loadOldData = async () => {
      try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getLatestRecord&userId=${user.id}&moduleName=Module 4: วางแผนเกษียณ`);
        const result = await response.json();
        if (result.status === "success" && result.rawData) {
          const oldData = JSON.parse(result.rawData);
          setPlanInputs(oldData); 
          console.log("โหลดแผนเกษียณเก่าเรียบร้อย!");
        }
      } catch (e) { console.log("ยังไม่มีแผนเกษียณเก่า"); }
    };
    loadOldData();
  }, [user.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    setPlanInputs({ ...planInputs, [name]: Number(sanitizedValue) });
  };

  // ✅ 2. ลอจิกการคำนวณ + ภูเขาเงินออม
  const calculateRetirement = () => {
    const { currentAge, retireAge, lifeExpectancy, monthlyExpense, returnRate } = planInputs;
    const yearsToSave = retireAge - currentAge;
    const yearsInRetirement = lifeExpectancy - retireAge;

    if (yearsToSave <= 0 || yearsInRetirement <= 0) {
      alert("ตรวจสอบข้อมูล: อายุปัจจุบันต้องน้อยกว่าอายุเกษียณ และอายุเกษียณต้องน้อยกว่าอายุขัย");
      return;
    }

    const targetFund = monthlyExpense * 12 * yearsInRetirement;
    const r = returnRate / 100;
    const i = r / 12;
    const n = yearsToSave * 12;
    let monthlySaving = i === 0 ? targetFund / n : (targetFund * i) / (Math.pow(1 + i, n) - 1);

    let projection = [];
    let currentBalance = 0;
    const yearlySaving = monthlySaving * 12;
    const yearlyExpense = monthlyExpense * 12;

    for (let age = currentAge; age <= retireAge; age++) {
      projection.push({ age, fund: Math.round(currentBalance), phase: 'สะสมเงิน' });
      currentBalance = (currentBalance + yearlySaving) * (1 + r);
    }

    for (let age = retireAge + 1; age <= lifeExpectancy; age++) {
      currentBalance = (currentBalance - yearlyExpense) * (1 + r);
      if (currentBalance < 0) currentBalance = 0;
      projection.push({ age, fund: Math.round(currentBalance), phase: 'ใช้เงิน' });
    }

    setChartData(projection);
    setResult({
      yearsToSave, yearsInRetirement, targetFund,
      monthlySavingNeeded: monthlySaving,
      isCalculated: true
    });
  };

  const saveToGoogleSheets = async () => {
    setIsSubmitting(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST", mode: "no-cors",
        body: JSON.stringify({
          action: "save", userId: user.id,
          moduleName: "Module 4: วางแผนเกษียณ",
          actionData: JSON.stringify(planInputs) 
        })
      });
      setSubmitStatus('บันทึกแผนล่าสุดสำเร็จ! ✅');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (error) { setSubmitStatus('ล้มเหลว ❌'); }
    finally { setIsSubmitting(false); }
  };

  // ✅ 3. ส่วนแสดงสูตร (แก้ไข Double Backslash และห่อด้วยปีกกาแล้ว)
  const renderLogic = () => (
    <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 space-y-4">
      <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Logic: เงินก้อนเกษียณมาจากไหน?</p>
      <div className="space-y-3">
        <div className="text-sm font-bold text-slate-700">
          1. หาเป้าหมายเงินก้อน (Target Fund):
          <p className="text-lg py-1">{"$$Fund = Expense \\\\times 12 \\\\times Years$$"}</p>
        </div>
        <div className="text-sm font-bold text-slate-700">
          2. หาเงินออมต่อเดือน (Monthly PMT):
          <p className="text-lg py-1">{"$$PMT = \\\\frac{Fund \\\\times i}{(1 + i)^n - 1}$$"}</p>
        </div>
      </div>
      <p className="text-[10px] text-slate-500 italic">**การคำนวณนี้เป็นแบบประมาณการเบื้องต้น (ยังไม่รวมปัจจัยเรื่องเงินเฟ้อ)</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen font-sans">
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6 relative overflow-hidden">
        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center text-4xl shadow-inner shrink-0 animate-pulse">🏖️</div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Retirement Planner</h2>
          <p className="text-slate-500 font-medium italic">วางแผนภูเขาเงินออม เพื่อชีวิตหลังเกษียณที่ออกแบบได้</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="อายุปัจจุบัน" name="currentAge" value={planInputs.currentAge} onChange={handleInputChange} />
              <InputField label="อายุเกษียณ" name="retireAge" value={planInputs.retireAge} onChange={handleInputChange} />
            </div>
            <InputField label="อายุขัยคาดหวัง" name="lifeExpectancy" value={planInputs.lifeExpectancy} onChange={handleInputChange} />
            <InputField label="ค่าใช้จ่ายหลังเกษียณ (บาท/เดือน)" name="monthlyExpense" value={planInputs.monthlyExpense} onChange={handleInputChange} />
            <InputField label="ผลตอบแทนที่คาดหวัง (% ต่อปี)" name="returnRate" value={planInputs.returnRate} onChange={handleInputChange} />

            {renderLogic()}

            <button onClick={calculateRetirement} className="w-full py-5 bg-orange-500 text-white font-black rounded-3xl shadow-xl hover:bg-orange-600 active:scale-95 transition-all">
              วิเคราะห์ภูเขาเงินออม
            </button>
          </div>
        </div>

        <div className="lg:col-span-7">
          {result.isCalculated ? (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-orange-50 h-full flex flex-col space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
                  <p className="text-orange-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">เป้าหมายเงินกองทุน</p>
                  <h3 className="text-4xl font-black tracking-tighter">฿{result.targetFund.toLocaleString()}</h3>
                </div>
                <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
                  <p className="text-orange-600 font-black text-[10px] uppercase mb-1">ต้องออมเพิ่มต่อเดือน</p>
                  <h3 className="text-3xl font-black text-orange-700">฿{Math.ceil(result.monthlySavingNeeded).toLocaleString()}</h3>
                </div>
              </div>

              <div className="flex-grow w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorFund" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="age" tick={{fontSize: 10, fontWeight: 'bold'}} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <ReferenceLine x={planInputs.retireAge} stroke="#ef4444" strokeDasharray="3 3">
                      <Label value="จุดเกษียณ" position="top" fill="#ef4444" fontSize={10} fontWeight="bold" />
                    </ReferenceLine>
                    <Area type="monotone" dataKey="fund" stroke="#f97316" strokeWidth={4} fill="url(#colorFund)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <button onClick={saveToGoogleSheets} disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">{isSubmitting ? 'sync' : 'save_as'}</span>
                {submitStatus || 'บันทึกแผนเกษียณล่าสุด'}
              </button>
            </div>
          ) : (
            <div className="h-full bg-slate-100 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-slate-400">
              <span className="material-symbols-outlined text-7xl mb-4 opacity-20">landscape</span>
              <p className="font-bold text-lg">ระบุอายุและเป้าหมายชีวิต</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
      <input 
        type="text" name={name} value={value === 0 ? '' : value} onChange={onChange}
        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-black text-slate-700 text-lg shadow-inner"
        placeholder="0"
      />
      <p className="text-[10px] font-black text-orange-500 text-right mr-1">= {Number(value).toLocaleString()}</p>
    </div>
  );
}