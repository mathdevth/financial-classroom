import React, { useState, useEffect, useCallback } from 'react'; // ✅ เพิ่ม useCallback
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

export default function Module2TaxSimulator({ user }) {
  const [activeTab, setActiveTab] = useState('income');
  
  const [incomes, setIncomes] = useState({
    m40_1: 0, m40_2: 0, m40_3: 0, m40_4: 0, 
    m40_5: 0, m40_6: 0, m40_7: 0, m40_8: 0
  });

  const [deductions, setDeductions] = useState({
    spouse: false,
    parentsCount: 0,
    childrenOld: 0, 
    childrenNew: 0, 
    lifeInsurance: 0,
    healthInsurance: 0,
    socialSecurity: 0,
    rmf: 0,
    ssf: 0,
    pension: 0,
    donationGeneral: 0,
    donationEdu: 0,
    homeLoanInterest: 0
  });

  const [result, setResult] = useState({ isCalculated: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  // ✅ 1. ฟังก์ชันคำนวณ (หุ้มด้วย useCallback เพื่อให้เรียกซ้ำใน useEffect ได้)
  const calculateTax = useCallback((currentIncomes = incomes, currentDeductions = deductions) => {
    // --- STEP 1: หักค่าใช้จ่าย ---
    const exp1_2 = Math.min((currentIncomes.m40_1 + currentIncomes.m40_2) * 0.5, 100000);
    const exp3 = Math.min(currentIncomes.m40_3 * 0.5, 100000);
    const exp5 = currentIncomes.m40_5 * 0.3;
    const exp6 = currentIncomes.m40_6 * 0.6;
    const exp7 = currentIncomes.m40_7 * 0.6;
    const exp8 = currentIncomes.m40_8 * 0.6;

    const totalIncome = Object.values(currentIncomes).reduce((a, b) => a + b, 0);
    const totalExpense = exp1_2 + exp3 + exp5 + exp6 + exp7 + exp8;

    // --- STEP 2: หักค่าลดหย่อน ---
    const dedPersonal = 60000;
    const dedSpouse = currentDeductions.spouse ? 60000 : 0;
    const dedParents = currentDeductions.parentsCount * 30000;
    const dedChildren = (currentDeductions.childrenOld * 30000) + (currentDeductions.childrenNew * 60000);
    const dedSocial = Math.min(currentDeductions.socialSecurity, 9000);
    const dedLifeHealth = Math.min(currentDeductions.lifeInsurance + currentDeductions.healthInsurance, 100000);
    
    const investLimit = totalIncome * 0.3;
    const dedInvest = Math.min(currentDeductions.rmf + currentDeductions.ssf + currentDeductions.pension, 500000, investLimit);
    const dedHome = Math.min(currentDeductions.homeLoanInterest, 100000);

    const totalDeductionBeforeDonation = dedPersonal + dedSpouse + dedParents + dedChildren + dedSocial + dedLifeHealth + dedInvest + dedHome;

    let netBeforeDonation = totalIncome - totalExpense - totalDeductionBeforeDonation;
    if (netBeforeDonation < 0) netBeforeDonation = 0;

    const dedDonationEdu = Math.min(currentDeductions.donationEdu, netBeforeDonation * 0.1);
    const dedDonationGeneral = Math.min(currentDeductions.donationGeneral, (netBeforeDonation - dedDonationEdu) * 0.1);

    const netIncome = netBeforeDonation - dedDonationEdu - dedDonationGeneral;
    const totalActualDeduction = totalDeductionBeforeDonation + dedDonationEdu + dedDonationGeneral;

    // --- STEP 3: คำนวณภาษี ---
    let tax = 0;
    let tempNet = netIncome;
    let marginalRate = 0; 

    const brackets = [
      { min: 0, l: 150000, r: 0 }, 
      { min: 150000, l: 150000, r: 0.05 }, 
      { min: 300000, l: 200000, r: 0.10 },
      { min: 500000, l: 250000, r: 0.15 }, 
      { min: 750000, l: 250000, r: 0.20 }, 
      { min: 1000000, l: 1000000, r: 0.25 },
      { min: 2000000, l: 3000000, r: 0.30 }, 
      { min: 5000000, l: Infinity, r: 0.35 }
    ];

    for (const b of brackets) {
      if (tempNet <= 0) break;
      const taxable = Math.min(tempNet, b.l);
      tax += taxable * b.r;
      if (taxable > 0) marginalRate = b.r; 
      tempNet -= taxable;
    }

    setResult({
      totalIncome, totalExpense, totalDeduction: totalActualDeduction,
      netIncome, taxToPay: tax, isCalculated: true,
      breakdown: { personal: dedPersonal, family: dedSpouse + dedParents + dedChildren, insurance: dedSocial + dedLifeHealth, investment: dedInvest, realEstate: dedHome, donation: dedDonationEdu + dedDonationGeneral },
      advisor: { show: tax > 0, marginalRate: marginalRate * 100, potentialSavingPer10k: 10000 * marginalRate }
    });
  }, [incomes, deductions]);

  // ✅ 2. 🤖 ระบบ Smart Load (ปรับปรุงเพื่อความแม่นยำ)
  useEffect(() => {
    const loadOldData = async () => {
      if (!user?.id) return;
      try {
        // เติม &t= เพื่อป้องกัน Browser Cache และ encodeURIComponent ป้องกันตัวอักษรพิเศษ
        const url = `${GOOGLE_SCRIPT_URL}?action=getLatestRecord&userId=${user.id}&moduleName=${encodeURIComponent("Module 2: Full Tax")}&t=${Date.now()}`;
        const response = await fetch(url);
        const resJson = await response.json();
        
        if (resJson.status === "success" && resJson.rawData) {
          const oldData = JSON.parse(resJson.rawData);
          if (oldData.incomes) setIncomes(oldData.incomes);
          if (oldData.deductions) setDeductions(oldData.deductions);
          
          // โหลดเสร็จแล้ว สั่งคำนวณและวาร์ปไปหน้าสรุปทันที
          calculateTax(oldData.incomes, oldData.deductions);
          setActiveTab('summary');
          console.log("โหลดและคำนวณข้อมูลภาษีเดิมเรียบร้อย!");
        }
      } catch (e) { console.warn("No previous record found"); }
    };
    loadOldData();
  }, [user.id, calculateTax]);

  const saveToSheets = async () => {
    setIsSubmitting(true);
    const fullData = { incomes, deductions };
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST", mode: "no-cors",
        body: JSON.stringify({
          action: "save", userId: user.id,
          moduleName: "Module 2: Full Tax",
          actionData: JSON.stringify(fullData) 
        })
      });
      setSubmitStatus('บันทึกแผนล่าสุดสำเร็จ ✅');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (e) { setSubmitStatus('ผิดพลาด ❌'); }
    finally { setIsSubmitting(false); }
  };

  // ส่วนแสดงผลที่เหลือ... (คงเดิม)
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 bg-slate-50 min-h-screen font-sans">
      <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-200 gap-2">
        {['income', 'deduction', 'summary'].map(t => (
          <button 
            key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${activeTab === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            {t === 'income' ? '1. รายได้' : t === 'deduction' ? '2. ลดหย่อน' : '3. สรุปผลภาษี'}
          </button>
        ))}
      </div>

      {activeTab === 'income' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-xl font-black text-slate-800 border-b pb-4">ประเภทเงินได้ 40(1) - 40(4)</h3>
            <Input label="40(1) เงินเดือน/โบนัส" value={incomes.m40_1} onChange={(v)=>setIncomes({...incomes, m40_1: v})} />
            <Input label="40(2) รับเหมาแรงงาน/นายหน้า" value={incomes.m40_2} onChange={(v)=>setIncomes({...incomes, m40_2: v})} />
            <Input label="40(3) ค่าลิขสิทธิ์/กู๊ดวิลล์" value={incomes.m40_3} onChange={(v)=>setIncomes({...incomes, m40_3: v})} />
            <Input label="40(4) ดอกเบี้ย/เงินปันผล" value={incomes.m40_4} onChange={(v)=>setIncomes({...incomes, m40_4: v})} />
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-xl font-black text-slate-800 border-b pb-4">ประเภทเงินได้ 40(5) - 40(8)</h3>
            <Input label="40(5) ค่าเช่าทรัพย์สิน" value={incomes.m40_5} onChange={(v)=>setIncomes({...incomes, m40_5: v})} />
            <Input label="40(6) วิชาชีพอิสระ (แพทย์/กม.)" value={incomes.m40_6} onChange={(v)=>setIncomes({...incomes, m40_6: v})} />
            <Input label="40(7) รับเหมา (ค่าแรง+ของ)" value={incomes.m40_7} onChange={(v)=>setIncomes({...incomes, m40_7: v})} />
            <Input label="40(8) ธุรกิจ/ขายของออนไลน์" value={incomes.m40_8} onChange={(v)=>setIncomes({...incomes, m40_8: v})} />
          </div>
          <button onClick={() => setActiveTab('deduction')} className="md:col-span-2 py-4 bg-slate-800 text-white font-black rounded-2xl hover:bg-black transition-all shadow-lg active:scale-[0.98]">ไปขั้นตอนถัดไป: เลือกค่าลดหย่อน</button>
        </div>
      )}

      {activeTab === 'deduction' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <h4 className="font-black text-blue-600 border-b pb-2">กลุ่ม 1: ครอบครัว</h4>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">คู่สมรส (ไม่มีรายได้)</span>
                {deductions.spouse && <span className="text-[10px] text-blue-500 font-bold animate-fadeIn">= 60,000 บาทต่อปี</span>}
              </div>
              <input type="checkbox" checked={deductions.spouse} onChange={(e)=>setDeductions({...deductions, spouse: e.target.checked})} className="w-6 h-6 accent-blue-600 cursor-pointer" />
            </div>
            <Input label="จำนวนพ่อแม่ (อายุ 60+)" value={deductions.parentsCount} onChange={(v)=>setDeductions({...deductions, parentsCount: v})} multiplier={30000} />
            <Input label="ลูก (เกิดก่อน 2561)" value={deductions.childrenOld} onChange={(v)=>setDeductions({...deductions, childrenOld: v})} multiplier={30000} />
            <Input label="ลูก (คนที่ 2+ เกิดหลัง 2561)" value={deductions.childrenNew} onChange={(v)=>setDeductions({...deductions, childrenNew: v})} multiplier={60000} />
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <h4 className="font-black text-green-600 border-b pb-2">กลุ่ม 2: ประกัน & ออม</h4>
            <Input label="ประกันชีวิต/สุขภาพ" value={deductions.lifeInsurance} onChange={(v)=>setDeductions({...deductions, lifeInsurance: v})} />
            <Input label="ประกันสังคม (เพดาน 9,000)" value={deductions.socialSecurity} onChange={(v)=>setDeductions({...deductions, socialSecurity: v})} />
            <Input label="กองทุน RMF / SSF" value={deductions.rmf} onChange={(v)=>setDeductions({...deductions, rmf: v, ssf: v})} />
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <h4 className="font-black text-orange-600 border-b pb-2">กลุ่ม 3-4: บริจาค & อสังหาฯ</h4>
            <Input label="ดอกเบี้ยบ้าน" value={deductions.homeLoanInterest} onChange={(v)=>setDeductions({...deductions, homeLoanInterest: v})} />
            <Input label="บริจาคทั่วไป" value={deductions.donationGeneral} onChange={(v)=>setDeductions({...deductions, donationGeneral: v})} />
            <Input label="บริจาคเพื่อการศึกษา/รพ." value={deductions.donationEdu} onChange={(v)=>setDeductions({...deductions, donationEdu: v})} />
          </div>
          <button onClick={() => calculateTax()} className="md:col-span-3 py-5 bg-blue-600 text-white font-black rounded-3xl shadow-xl hover:bg-blue-700 active:scale-[0.98]">คำนวณภาษีสุทธิ</button>
        </div>
      )}

      {activeTab === 'summary' && result.isCalculated && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left">
                <p className="text-blue-400 font-black uppercase tracking-widest text-[10px] mb-2">ภาษีที่ต้องชำระทั้งสิ้น</p>
                <h2 className="text-6xl md:text-7xl font-black tracking-tighter">฿{result.taxToPay.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
              </div>
              <button onClick={saveToSheets} disabled={isSubmitting} className="px-10 py-5 bg-blue-600 rounded-2xl font-black hover:bg-blue-500 transition-all shadow-xl flex items-center gap-3 active:scale-95">
                <span className="material-symbols-outlined">{isSubmitting ? 'sync' : 'save'}</span>
                {isSubmitting ? 'กำลังบันทึก...' : submitStatus || 'บันทึกแผนล่าสุด'}
              </button>
            </div>
          </div>

          {result.advisor.show && (
            <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-[2px] rounded-[2.5rem] shadow-2xl">
              <div className="bg-white rounded-[2.45rem] p-8 md:p-10 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-24 h-24 bg-indigo-100 rounded-3xl flex items-center justify-center shrink-0 shadow-inner">
                    <span className="material-symbols-outlined text-5xl text-indigo-600 animate-bounce">psychology</span>
                  </div>
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">AI Tax Advisor</span>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">คำแนะนำจากครู AI</h3>
                    </div>
                    <p className="text-slate-600 font-bold leading-relaxed">
                      "คุณ {user.name} ครับ ตอนนี้ฐานภาษีของคุณอยู่ที่ <span className="text-indigo-600 text-xl font-black">{result.advisor.marginalRate}%</span> นะครับ 
                      นั่นแปลว่าหากคุณหาค่าลดหย่อนเพิ่มได้ทุกๆ <span className="underline">10,000 บาท</span> คุณจะได้รับเงินคืนถึง 
                      <span className="text-green-600 text-xl font-black ml-2">฿{result.advisor.potentialSavingPer10k.toLocaleString()}</span> เลยนะ!"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard label="รวมรายได้ทั้งหมด" value={result.totalIncome} color="slate" />
            <SummaryCard label="หักค่าใช้จ่าย (Auto)" value={result.totalExpense} color="red" />
            <SummaryCard label="ยอดลดหย่อนที่ใช้สิทธิได้" value={result.totalDeduction} color="orange" />
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
              <span className="material-symbols-outlined text-orange-500">receipt_long</span>
              รายละเอียดการหักค่าลดหย่อน
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <BreakdownItem label="ลดหย่อนส่วนตัว (พื้นฐาน)" value={result.breakdown.personal} icon="person" />
              <BreakdownItem label="ครอบครัว" value={result.breakdown.family} icon="family_restroom" />
              <BreakdownItem label="ประกัน" value={result.breakdown.insurance} icon="health_and_safety" />
              <BreakdownItem label="กองทุนและการลงทุน" value={result.breakdown.investment} icon="trending_up" />
              <BreakdownItem label="ดอกเบี้ยที่อยู่อาศัย" value={result.breakdown.realEstate} icon="home" />
              <BreakdownItem label="เงินบริจาค" value={result.breakdown.donation} icon="volunteer_activism" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components
function Input({ label, value, onChange, multiplier = 1 }) {
  const displayAmount = value * multiplier;
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-black text-slate-600 tracking-wide ml-1">{label}</label>
      <div className="relative flex items-center">
        <input type="text" value={value === 0 ? '' : value} onChange={(e) => onChange(Number(e.target.value.replace(/[^0-9]/g, '')))} className="w-full pl-4 pr-16 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-slate-700 transition-all shadow-inner" placeholder="0" />
        <span className="absolute right-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">{multiplier > 1 ? "คน" : "บาท/ปี"}</span>
      </div>
      {value > 0 && <p className="text-[10px] text-blue-600 font-black text-right pr-1">= {displayAmount.toLocaleString()} บาทต่อปี</p>}
    </div>
  );
}

function BreakdownItem({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
        <span className="text-xs font-bold text-slate-600">{label}</span>
      </div>
      <span className="text-sm font-black text-slate-800">฿{value.toLocaleString()}</span>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  const colors = { slate: 'border-slate-200 text-slate-800', red: 'border-red-100 text-red-600', orange: 'border-orange-100 text-orange-600' };
  return (
    <div className={`bg-white p-6 rounded-3xl border-b-4 shadow-sm ${colors[color]}`}>
      <p className="text-[10px] font-black uppercase opacity-60 mb-1">{label}</p>
      <h4 className="text-2xl font-black">฿{value.toLocaleString()}</h4>
    </div>
  );
}