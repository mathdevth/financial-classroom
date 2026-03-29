import React, { useState, useCallback } from 'react';
import HistoryModal from '../components/HistoryModal'; 

export default function Module2TaxSimulator({ user }) {
  const [activeTab, setActiveTab] = useState('income');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [incomes, setIncomes] = useState({
    m40_1: 0, m40_2: 0, m40_3: 0, m40_4: 0, 
    m40_5: 0, m40_6: 0, m40_7: 0, m40_8: 0
  });

  const [deductions, setDeductions] = useState({
    spouse: false, parentsCount: 0, childrenOld: 0, childrenNew: 0, 
    lifeInsurance: 0, healthInsurance: 0, socialSecurity: 0,
    rmf: 0, ssf: 0, pension: 0, donationGeneral: 0, 
    donationEdu: 0, homeLoanInterest: 0
  });

  const [result, setResult] = useState({ isCalculated: false, taxSteps: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  const calculateTax = () => {
    const exp1_2 = Math.min((incomes.m40_1 + incomes.m40_2) * 0.5, 100000);
    const exp3 = Math.min(incomes.m40_3 * 0.5, 100000);
    const exp5 = incomes.m40_5 * 0.3;
    const exp6 = incomes.m40_6 * 0.6;
    const exp7 = incomes.m40_7 * 0.6;
    const exp8 = incomes.m40_8 * 0.6;

    const totalIncome = Object.values(incomes).reduce((a, b) => a + b, 0);
    const totalExpense = exp1_2 + exp3 + exp5 + exp6 + exp7 + exp8;

    const dedPersonal = 60000;
    const dedSpouse = deductions.spouse ? 60000 : 0;
    const dedParents = deductions.parentsCount * 30000;
    const dedChildren = (deductions.childrenOld * 30000) + (deductions.childrenNew * 60000);
    const dedSocial = Math.min(deductions.socialSecurity, 9000);
    const dedLifeHealth = Math.min(deductions.lifeInsurance + deductions.healthInsurance, 100000);
    const dedInvest = Math.min(deductions.rmf + deductions.ssf + deductions.pension, 500000, totalIncome * 0.3);
    const dedHome = Math.min(deductions.homeLoanInterest, 100000);

    const totalDeductionBeforeDonation = dedPersonal + dedSpouse + dedParents + dedChildren + dedSocial + dedLifeHealth + dedInvest + dedHome;
    let netBeforeDonation = Math.max(0, totalIncome - totalExpense - totalDeductionBeforeDonation);

    const dedDonationEdu = Math.min(deductions.donationEdu, netBeforeDonation * 0.1);
    const dedDonationGeneral = Math.min(deductions.donationGeneral, (netBeforeDonation - dedDonationEdu) * 0.1);

    const netIncome = netBeforeDonation - dedDonationEdu - dedDonationGeneral;

    let remainingNet = netIncome;
    let totalTax = 0;
    const steps = [];
    const brackets = [
      { range: '0 - 150,000', rate: 0, limit: 150000 },
      { range: '150,001 - 300,000', rate: 5, limit: 150000 },
      { range: '300,001 - 500,000', rate: 10, limit: 200000 },
      { range: '500,001 - 750,000', rate: 15, limit: 250000 },
      { range: '750,001 - 1,000,000', rate: 20, limit: 250000 },
      { range: '1,000,001 - 2,000,000', rate: 25, limit: 1000000 },
      { range: '2,000,001 - 5,000,000', rate: 30, limit: 3000000 },
      { range: 'เกิน 5,000,000', rate: 35, limit: Infinity }
    ];

    brackets.forEach(b => {
      if (remainingNet > 0) {
        const taxableInThisBracket = Math.min(remainingNet, b.limit);
        const taxInThisBracket = taxableInThisBracket * (b.rate / 100);
        steps.push({ ...b, amount: taxableInThisBracket, tax: taxInThisBracket });
        totalTax += taxInThisBracket;
        remainingNet -= taxableInThisBracket;
      } else {
        steps.push({ ...b, amount: 0, tax: 0 });
      }
    });

    setResult({
      totalIncome, totalExpense, totalDeduction: totalDeductionBeforeDonation + dedDonationEdu + dedDonationGeneral,
      netIncome, taxToPay: totalTax, isCalculated: true,
      taxSteps: steps,
      advisor: { 
        show: totalTax > 0, 
        marginalRate: steps.findLast(s => s.amount > 0)?.rate || 0,
        potentialSavingPer10k: 10000 * (steps.findLast(s => s.amount > 0)?.rate / 100 || 0)
      }
    });
    setActiveTab('summary');
  };

  const saveToSheets = async () => {
    setIsSubmitting(true);
    const fullData = { incomes, deductions, taxToPay: result.taxToPay };
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST", mode: "no-cors",
        body: JSON.stringify({
          action: "save", userId: user.id,
          moduleName: "Module 2: Full Tax",
          actionData: JSON.stringify(fullData) 
        })
      });
      setSubmitStatus('บันทึกสำเร็จ! ✅');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (e) { setSubmitStatus('ล้มเหลว ❌'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-10 px-4 md:px-10 font-sans animate-fadeIn relative overflow-hidden">
      
      {/* 🔮 Background Decor */}
      <div className="absolute top-0 right-0 w-[30rem] md:w-[40rem] h-[30rem] md:h-[40rem] bg-blue-100/40 rounded-full blur-[80px] md:blur-[120px] -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-[25rem] md:w-[35rem] h-[25rem] md:h-[35rem] bg-cyan-50/50 rounded-full blur-[80px] md:blur-[100px] -ml-32 -mb-32"></div>

      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 relative z-10">
        
        {/* Header Section */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/60 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-white shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl md:rounded-3xl flex items-center justify-center text-white text-4xl md:text-5xl shadow-xl shadow-blue-500/20 shrink-0">
              <span className="material-symbols-outlined text-4xl md:text-5xl">receipt_long</span>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight pb-1 md:pb-4 pr-2 md:pr-4 leading-tight">Tax Simulator</h2>
              <p className="text-slate-500 font-bold italic text-xs md:text-base">คำนวณและวางแผนลดหย่อนภาษีเงินได้บุคคลธรรมดา</p>
            </div>
          </div>
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm w-full md:w-auto"
          >
            <span className="material-symbols-outlined text-blue-500">history</span>
            ประวัติการคำนวณ
          </button>
        </section>

        {/* Tab Navigation - Premium Glass Style */}
        <div className="flex flex-col sm:flex-row bg-white/60 backdrop-blur-xl p-2 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-white gap-2">
          {['income', 'deduction', 'summary'].map(t => (
            <button 
              key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-3 md:py-4 rounded-[1.2rem] md:rounded-[1.5rem] font-black text-xs md:text-sm transition-all duration-300 ${activeTab === t ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
            >
              {t === 'income' ? '1. รายได้' : t === 'deduction' ? '2. ลดหย่อน' : '3. สรุปผลภาษี'}
            </button>
          ))}
        </div>

        {/* Tab Content: Income */}
        {activeTab === 'income' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 animate-fadeIn">
            <FormSection title="รายได้กลุ่ม 40(1) - 40(4)" icon="payments">
              <Input label="40(1) เงินเดือน/โบนัส" value={incomes.m40_1} onChange={(v)=>setIncomes({...incomes, m40_1: v})} icon="work" />
              <Input label="40(2) นายหน้า/งานอิสระ" value={incomes.m40_2} onChange={(v)=>setIncomes({...incomes, m40_2: v})} icon="person_search" />
              <Input label="40(3) ค่าลิขสิทธิ์/สิทธิบัตร" value={incomes.m40_3} onChange={(v)=>setIncomes({...incomes, m40_3: v})} icon="copyright" />
              <Input label="40(4) ดอกเบี้ย/เงินปันผล" value={incomes.m40_4} onChange={(v)=>setIncomes({...incomes, m40_4: v})} icon="account_balance" />
            </FormSection>
            <FormSection title="รายได้กลุ่ม 40(5) - 40(8)" icon="storefront">
              <Input label="40(5) ค่าเช่าทรัพย์สิน" value={incomes.m40_5} onChange={(v)=>setIncomes({...incomes, m40_5: v})} icon="home_work" />
              <Input label="40(6) วิชาชีพอิสระ (กฎหมาย/แพทย์)" value={incomes.m40_6} onChange={(v)=>setIncomes({...incomes, m40_6: v})} icon="medical_services" />
              <Input label="40(7) รับเหมา (รวมค่าของ)" value={incomes.m40_7} onChange={(v)=>setIncomes({...incomes, m40_7: v})} icon="construction" />
              <Input label="40(8) ธุรกิจ/พาณิชย์/ขายของ" value={incomes.m40_8} onChange={(v)=>setIncomes({...incomes, m40_8: v})} icon="shopping_cart" />
            </FormSection>
            <button onClick={() => setActiveTab('deduction')} className="lg:col-span-2 py-5 md:py-6 bg-slate-900 text-white font-black rounded-[1.5rem] md:rounded-[2rem] shadow-xl hover:bg-blue-600 hover:scale-[1.02] transition-all active:scale-95 text-lg md:text-xl tracking-tight flex items-center justify-center gap-3 md:gap-4 mt-2">
               ถัดไป: เลือกค่าลดหย่อน <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        )}

        {/* Tab Content: Deduction */}
        {activeTab === 'deduction' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-fadeIn">
            <FormSection title="กลุ่มครอบครัว" icon="family_restroom">
              <div className="flex items-center justify-between p-4 md:p-5 bg-slate-50 border border-slate-100 rounded-2xl mb-2">
                <span className="text-xs md:text-sm font-black text-slate-700">คู่สมรส (ไม่มีรายได้)</span>
                <input type="checkbox" checked={deductions.spouse} onChange={(e)=>setDeductions({...deductions, spouse: e.target.checked})} className="w-5 h-5 md:w-6 md:h-6 accent-blue-600 cursor-pointer" />
              </div>
              <Input label="จำนวนพ่อแม่ (อายุ 60+)" value={deductions.parentsCount} onChange={(v)=>setDeductions({...deductions, parentsCount: v})} multiplier="คน" icon="elderly" />
              <Input label="ลูก (เกิดก่อน 2561)" value={deductions.childrenOld} onChange={(v)=>setDeductions({...deductions, childrenOld: v})} multiplier="คน" icon="child_care" />
              <Input label="ลูก (เกิดหลัง 2561)" value={deductions.childrenNew} onChange={(v)=>setDeductions({...deductions, childrenNew: v})} multiplier="คน" icon="baby_changing_station" />
            </FormSection>
            
            <FormSection title="ประกัน & การลงทุน" icon="verified">
              <Input label="ประกันชีวิต/สุขภาพ" value={deductions.lifeInsurance} onChange={(v)=>setDeductions({...deductions, lifeInsurance: v})} icon="health_and_safety" />
              <Input label="ประกันสังคม" value={deductions.socialSecurity} onChange={(v)=>setDeductions({...deductions, socialSecurity: v})} icon="groups" />
              <Input label="RMF / SSF / บำนาญ" value={deductions.rmf} onChange={(v)=>setDeductions({...deductions, rmf: v})} icon="savings" />
            </FormSection>

            <FormSection title="บริจาค & อื่นๆ" icon="volunteer_activism">
              <Input label="ดอกเบี้ยเงินกู้บ้าน" value={deductions.homeLoanInterest} onChange={(v)=>setDeductions({...deductions, homeLoanInterest: v})} icon="cottage" />
              <Input label="บริจาคทั่วไป" value={deductions.donationGeneral} onChange={(v)=>setDeductions({...deductions, donationGeneral: v})} icon="redeem" />
              <Input label="บริจาคเพื่อการศึกษา" value={deductions.donationEdu} onChange={(v)=>setDeductions({...deductions, donationEdu: v})} icon="school" />
            </FormSection>

            <button onClick={calculateTax} className="md:col-span-2 lg:col-span-3 py-5 md:py-6 bg-slate-900 text-white font-black rounded-[1.5rem] md:rounded-[2rem] shadow-xl hover:bg-emerald-600 hover:scale-[1.02] transition-all active:scale-95 text-lg md:text-2xl tracking-tight flex items-center justify-center gap-3 md:gap-4 mt-2">
               <span className="material-symbols-outlined">calculate</span> คำนวณผลภาษีสุทธิ
            </button>
          </div>
        )}

        {/* Tab Content: Summary */}
        {activeTab === 'summary' && result.isCalculated && (
          <div className="space-y-8 md:space-y-10 animate-fadeIn">
            
            {/* 💰 Hero Result Card */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute -right-10 -top-10 md:-right-20 md:-top-20 w-40 h-40 md:w-64 md:h-64 bg-white/10 rounded-full blur-[60px] md:blur-[80px]"></div>
               <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 md:gap-8 relative z-10">
                  <div className="text-left space-y-2">
                    <p className="text-blue-200 font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[9px] md:text-[11px] opacity-80 pb-1 md:pb-2">ภาษีที่ต้องชำระทั้งสิ้น</p>
                    {/* ✅ ปรับ break-words ให้ไม่ทะลุกรอบในมือถือ */}
                    <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter pb-2 md:pb-4 pr-4 md:pr-12 leading-tight break-words">
                      ฿{result.taxToPay.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </h2>
                  </div>
                  <button onClick={saveToSheets} disabled={isSubmitting} className={`w-full lg:w-auto px-6 md:px-10 py-4 md:py-5 font-black rounded-2xl md:rounded-3xl shadow-2xl transition-all flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg ${isSubmitting ? 'bg-white/20 text-white' : 'bg-white text-blue-700 hover:scale-105 active:scale-95'}`}>
                    <span className="material-symbols-outlined">{isSubmitting ? 'sync' : 'cloud_done'}</span>
                    {submitStatus || 'บันทึกแผนภาษี'}
                  </button>
               </div>
            </div>

            {/* 🤖 AI Advisor Section */}
            {result.advisor.show && (
              <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 border border-blue-100 shadow-xl flex flex-col sm:flex-row gap-6 md:gap-8 items-center group hover:border-blue-300 transition-all duration-500">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-blue-50 rounded-2xl md:rounded-[2rem] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl md:text-5xl text-blue-600 animate-pulse">psychology</span>
                </div>
                <div className="space-y-2 md:space-y-3 text-center sm:text-left">
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">AI Tax Advisor</h3>
                  <p className="text-slate-500 font-bold leading-relaxed text-sm md:text-lg">
                    "คุณ {user.name} ครับ ฐานภาษีของคุณอยู่ที่ <span className="text-blue-600 font-black px-1 pr-2">{result.advisor.marginalRate}%</span> 
                    ถ้าหาค่าลดหย่อนเพิ่มได้ 10,000 บาท จะประหยัดเงินได้ถึง 
                    <span className="text-emerald-600 font-black pl-1 md:pl-2 pr-2 md:pr-4">฿{result.advisor.potentialSavingPer10k.toLocaleString()}</span> ครับ!"
                  </p>
                </div>
              </div>
            )}

            {/* 📊 Step Table Section */}
            <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] md:rounded-[3.5rem] border border-white shadow-2xl overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 md:gap-3">
                <span className="material-symbols-outlined text-blue-600 text-2xl md:text-3xl">analytics</span>
                <h3 className="font-black text-slate-800 text-lg md:text-xl tracking-tight">รายละเอียดภาษีแบบขั้นบันได</h3>
              </div>
              
              {/* ✅ ตาราง Responsive: เลื่อนซ้ายขวาได้ในมือถือ */}
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead className="bg-slate-50/50 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 md:px-10 py-4 md:py-6">ช่วงเงินได้สุทธิ</th>
                      <th className="px-6 md:px-10 py-4 md:py-6 text-center">อัตราภาษี</th>
                      <th className="px-6 md:px-10 py-4 md:py-6 text-right">เงินได้ในขั้น</th>
                      <th className="px-6 md:px-10 py-4 md:py-6 text-right">ภาษีที่เกิดขึ้น</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs md:text-sm font-bold">
                    {result.taxSteps.map((step, idx) => (
                      <tr key={idx} className={`border-b border-slate-50 transition-colors ${step.amount > 0 ? 'bg-blue-50/30' : 'opacity-40'}`}>
                        <td className="px-6 md:px-10 py-4 md:py-5 text-slate-600 truncate">{step.range}</td>
                        <td className="px-6 md:px-10 py-4 md:py-5 text-center">
                          <span className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full font-black text-[9px] md:text-[11px] ${step.amount > 0 ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                            {step.rate}%
                          </span>
                        </td>
                        <td className="px-6 md:px-10 py-4 md:py-5 text-right text-slate-500">฿{step.amount.toLocaleString()}</td>
                        <td className={`px-6 md:px-10 py-4 md:py-5 text-right font-black pr-6 md:pr-12 ${step.amount > 0 ? 'text-slate-800' : 'text-slate-300'}`}>
                          ฿{step.tax.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-900 text-white">
                    <tr>
                      <td colSpan="3" className="px-6 md:px-10 py-5 md:py-6 text-right font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-[9px] md:text-[11px] opacity-70">รวมภาษีทั้งสิ้น</td>
                      <td className="px-6 md:px-10 py-5 md:py-6 text-right text-lg md:text-2xl font-black pr-6 md:pr-12 tracking-tight">฿{result.taxToPay.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              <SummaryCard label="รวมรายได้ทั้งหมด" value={result.totalIncome} color="blue" />
              <SummaryCard label="หักค่าใช้จ่ายตามกฎหมาย" value={result.totalExpense} color="rose" />
              <SummaryCard label="ยอดลดหย่อนที่ใช้สิทธิ" value={result.totalDeduction} color="emerald" />
            </div>
          </div>
        )}
      </div>

      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} userId={user.id} moduleName="Module 2: Full Tax" GOOGLE_SCRIPT_URL={GOOGLE_SCRIPT_URL} />
    </div>
  );
}

// ✅ Form Section Component (ลด Padding ในมือถือ)
function FormSection({ title, icon, children }) {
  return (
    <div className="bg-white/80 backdrop-blur-2xl p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border border-white space-y-4 md:space-y-6">
      <h3 className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center gap-2 md:gap-3 border-b border-slate-50 pb-4 md:pb-6">
        <span className="material-symbols-outlined text-blue-500 text-lg md:text-xl">{icon}</span>
        {title}
      </h3>
      <div className="space-y-4 md:space-y-6">{children}</div>
    </div>
  );
}

// ✅ Input Component (Refined for Mobile)
function Input({ label, value, onChange, multiplier = "บาท/ปี", icon }) {
  return (
    <div className="space-y-1 md:space-y-1.5 pb-2 pr-2 md:pr-4">
      <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 md:ml-3 block pb-1 leading-tight">{label}</label>
      <div className="relative flex items-center group">
        <div className="absolute left-3 md:left-4 w-8 h-8 md:w-10 md:h-10 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-400 group-focus-within:bg-blue-50 group-focus-within:text-blue-500 transition-all duration-300">
          <span className="material-symbols-outlined text-[18px] md:text-[20px]">{icon}</span>
        </div>
        {/* ลด pl-12 และขนาดย่อในมือถือ */}
        <input 
          type="text" 
          value={value === 0 ? '' : value} 
          onChange={(e) => onChange(Number(e.target.value.replace(/[^0-9]/g, '')))} 
          className="w-full pl-12 md:pl-16 pr-12 md:pr-16 py-3 md:py-4 bg-slate-50 border border-slate-100 rounded-2xl md:rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-200 outline-none font-black text-slate-800 text-base md:text-lg transition-all shadow-inner placeholder:text-slate-200" 
          placeholder="0" 
        />
        <span className="absolute right-4 md:right-6 text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest">{multiplier}</span>
      </div>
    </div>
  );
}

// ✅ Summary Card (Refined Spacing)
function SummaryCard({ label, value, color }) {
  const colorMap = { 
    blue: 'border-blue-100 text-blue-700 bg-blue-50/30', 
    rose: 'border-rose-100 text-rose-600 bg-rose-50/30', 
    emerald: 'border-emerald-100 text-emerald-600 bg-emerald-50/30' 
  };
  return (
    <div className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-b-8 shadow-xl transition-transform hover:-translate-y-1 duration-500 ${colorMap[color]}`}>
      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 md:mb-2 pb-1 leading-tight">{label}</p>
      <h4 className="text-2xl md:text-3xl font-black pr-2 md:pr-6 tracking-tighter truncate">฿{value.toLocaleString()}</h4>
    </div>
  );
}