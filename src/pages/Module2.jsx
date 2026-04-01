import React, { useState, useCallback } from 'react';
import HistoryModal from '../components/HistoryModal'; 

export default function Module2TaxSimulator({ user }) {
  const [activeTab, setActiveTab] = useState('income');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [incomes, setIncomes] = useState({
    m40_1: 0, m40_2: 0, m40_3: 0, m40_4: 0, 
    m40_5: 0, m40_6: 0, m40_7: 0, m40_8: 0
  });

  const [incomeTypes, setIncomeTypes] = useState({
    m40_5_type: 'house' 
  });

  const [deductions, setDeductions] = useState({
    // กลุ่ม 1
    spouse: false, parentsCount: 0, childrenOld: 0, childrenNew: 0, 
    // กลุ่ม 2
    socialSecurity: 0, lifeInsurance: 0, healthInsurance: 0, parentsHealth: 0,
    rmf: 0, ssf: 0, pension: 0, thaiEsg: 0, nsf: 0, pvd: 0, // ✅ เพิ่ม pvd (กบข./กองทุนสำรองเลี้ยงชีพ)
    // กลุ่ม 4
    homeLoanInterest: 0, newHome: 0,
    // กลุ่ม 3
    donationEdu: 0, donationGeneral: 0 
  });

  const [result, setResult] = useState({ isCalculated: false, taxSteps: [], details: {}, advisor: { messages: [] } });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  const calculateTax = () => {
    const totalIncome = Object.values(incomes).reduce((a, b) => a + b, 0);
    const incomeType2to8 = totalIncome - incomes.m40_1;

    const getM40_5_Rate = (type) => {
      switch(type) {
        case 'agri_land': return 0.20; 
        case 'other_land': return 0.15; 
        default: return 0.30; 
      }
    };

    const exp1_2 = Math.min((incomes.m40_1 + incomes.m40_2) * 0.5, 100000);
    const exp3 = Math.min(incomes.m40_3 * 0.5, 100000);
    const exp4 = 0; 
    const exp5 = incomes.m40_5 * getM40_5_Rate(incomeTypes.m40_5_type); 
    const exp6 = incomes.m40_6 * 0.3; 
    const exp7 = incomes.m40_7 * 0.6; 
    const exp8 = incomes.m40_8 * 0.6; 
    const totalExpense = exp1_2 + exp3 + exp4 + exp5 + exp6 + exp7 + exp8;

    const dedPersonal = 60000;
    const dedSpouse = deductions.spouse ? 60000 : 0;
    const dedParents = deductions.parentsCount * 30000;
    const dedChildren = (deductions.childrenOld * 30000) + (deductions.childrenNew * 60000);
    const group1 = dedPersonal + dedSpouse + dedParents + dedChildren;

    const dedSocial = Math.min(deductions.socialSecurity, 9000);
    const rawHealth = Math.min(deductions.healthInsurance, 25000);
    const dedLifeHealth = Math.min(deductions.lifeInsurance + rawHealth, 100000);
    const dedParentsHealth = Math.min(deductions.parentsHealth, 15000);
    
    // ✅ เพิ่มการคำนวณ PVD / กบข. (ลดหย่อนได้ 15% ของรายได้ และไม่เกิน 5 แสน)
    const dedPVD = Math.min(deductions.pvd || 0, 500000, totalIncome * 0.15);
    const dedRMF = Math.min(deductions.rmf, 500000, totalIncome * 0.3);
    const dedSSF = Math.min(deductions.ssf, 200000, totalIncome * 0.3);
    const dedPension = Math.min(deductions.pension, 200000, totalIncome * 0.15);
    const dedNSF = Math.min(deductions.nsf || 0, 30000); 
    
    // ✅ รวมโควตากลุ่มเกษียณทั้งหมดต้องไม่เกิน 5 แสน
    const totalInvest = Math.min(dedPVD + dedRMF + dedSSF + dedPension + dedNSF, 500000); 
    
    const dedThaiEsg = Math.min(deductions.thaiEsg, 300000, totalIncome * 0.3);
    const group2 = dedSocial + dedLifeHealth + dedParentsHealth + totalInvest + dedThaiEsg;

    const dedHomeLoan = Math.min(deductions.homeLoanInterest, 100000);
    const dedNewHome = Math.min(deductions.newHome, 100000); 
    const group4 = dedHomeLoan + dedNewHome;

    const totalDedBeforeDonation = group1 + group2 + group4;
    const netBeforeDonation = Math.max(0, totalIncome - totalExpense - totalDedBeforeDonation);

    const dedDonationEdu = Math.min(deductions.donationEdu * 2, netBeforeDonation * 0.1); 
    const netAfterEdu = Math.max(0, netBeforeDonation - dedDonationEdu);
    const dedDonationGeneral = Math.min(deductions.donationGeneral, netAfterEdu * 0.1);
    const group3 = dedDonationEdu + dedDonationGeneral;

    const netIncome = Math.max(0, netAfterEdu - dedDonationGeneral);

    let remainingNet = netIncome;
    let totalTaxMethod1 = 0;
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
        totalTaxMethod1 += taxInThisBracket;
        remainingNet -= taxableInThisBracket;
      } else {
        steps.push({ ...b, amount: 0, tax: 0 });
      }
    });

    const taxMethod2 = incomeType2to8 * 0.005;
    const isMethod2Applicable = taxMethod2 > 5000;
    const finalTaxToPay = isMethod2Applicable ? Math.max(totalTaxMethod1, taxMethod2) : totalTaxMethod1;
    const winningMethod = isMethod2Applicable && taxMethod2 > totalTaxMethod1 ? 2 : 1;

    const marginalRate = steps.findLast(s => s.amount > 0)?.rate || 0;
    const aiMessages = [];
    
    if (totalTaxMethod1 === 0) {
      aiMessages.push("🎉 ยินดีด้วยครับ! รายได้สุทธิของคุณยังอยู่ในเกณฑ์ที่ 'ได้รับการยกเว้นภาษี' ไม่ต้องหาลดหย่อนเพิ่มแล้วครับ");
    } else {
      aiMessages.push(`💡 ฐานภาษีสูงสุดของคุณอยู่ที่ ${marginalRate}% แปลว่าถ้าหาค่าลดหย่อนมาได้อีก 10,000 บาท จะประหยัดภาษีได้ถึง ${(10000 * marginalRate / 100).toLocaleString()} บาท!`);
      
      const unusedThaiEsg = Math.max(0, Math.min(300000, totalIncome * 0.3) - dedThaiEsg);
      if (unusedThaiEsg > 5000) aiMessages.push(`🌿 กองทุน Thai ESG: ยังซื้อเพิ่มได้อีก ฿${unusedThaiEsg.toLocaleString()} (ช่วยรักษ์โลกแถมลดภาษีได้)`);

      const unusedLife = Math.max(0, 100000 - dedLifeHealth);
      if (unusedLife > 5000) aiMessages.push(`🛡️ ประกันชีวิต/สุขภาพ: คุณยังมีโควตาซื้อประกันเพิ่มได้อีก ฿${unusedLife.toLocaleString()}`);

      const unusedRetire = Math.max(0, 500000 - totalInvest);
      // ✅ เพิ่มคำแนะนำ กบข./PVD เข้าไปใน AI Message
      if (unusedRetire > 10000) aiMessages.push(`📈 กองทุนเกษียณ (กบข./PVD/RMF/SSF/บำนาญ/กอช.): ยังลงทุนรวมกันเพิ่มได้อีก ฿${unusedRetire.toLocaleString()}`);

      if (deductions.donationEdu === 0) aiMessages.push(`🎓 ทริคพิเศษ: บริจาคให้สถานศึกษาหรือโรงพยาบาลรัฐ ผ่าน e-Donation สามารถนำมาหักลดหย่อนได้ถึง 2 เท่าเลยนะครับ!`);
    }

    setResult({
      isCalculated: true,
      taxToPay: finalTaxToPay,
      taxSteps: steps,
      details: {
        totalIncome, totalExpense,
        group1, group2, group4, group3,
        totalDeductions: totalDedBeforeDonation + group3,
        netIncome, taxMethod1: totalTaxMethod1, taxMethod2,
        winningMethod, isMethod2Applicable
      },
      advisor: { messages: aiMessages } 
    });
    setActiveTab('summary');
  };

  const saveToSheets = async () => {
    setIsSubmitting(true);
    const fullData = { incomes, incomeTypes, deductions, taxToPay: result.taxToPay };
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST", mode: "no-cors",
        body: JSON.stringify({ action: "save", userId: user.id, moduleName: "Module 2: Full Tax", actionData: JSON.stringify(fullData) })
      });
      setSubmitStatus('บันทึกสำเร็จ! ✅');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (e) { setSubmitStatus('ล้มเหลว ❌'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-10 px-3 md:px-10 font-sans animate-fadeIn relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-[20rem] md:w-[40rem] h-[20rem] md:h-[40rem] bg-blue-100/40 rounded-full blur-[80px] md:blur-[120px] -mr-16 md:-mr-32 -mt-16 md:-mt-32"></div>
      <div className="absolute bottom-0 left-0 w-[20rem] md:w-[35rem] h-[20rem] md:h-[35rem] bg-cyan-50/50 rounded-full blur-[80px] md:blur-[100px] -ml-16 md:-ml-32 -mb-16 md:-mb-32"></div>

      <div className="max-w-7xl mx-auto space-y-4 md:space-y-8 relative z-10">
        
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 backdrop-blur-2xl p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
            <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-3xl md:text-5xl shadow-xl shadow-blue-500/20 shrink-0">
              <span className="material-symbols-outlined text-3xl md:text-5xl">receipt_long</span>
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">Tax Simulator</h2>
              <p className="text-slate-500 font-bold italic text-[10px] md:text-base">คำนวณและวางแผนภาษีเงินได้บุคคลธรรมดา</p>
            </div>
          </div>
          <button onClick={() => setIsHistoryOpen(true)} className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 text-xs md:text-sm font-black rounded-xl md:rounded-2xl hover:bg-slate-50 transition-all shadow-sm w-full md:w-auto">
            <span className="material-symbols-outlined text-blue-500 text-lg">history</span> ประวัติ
          </button>
        </section>

        <div className="flex bg-white/60 backdrop-blur-xl p-1.5 md:p-2 rounded-[1.2rem] md:rounded-[2rem] shadow-sm border border-white gap-1 overflow-x-auto custom-scrollbar">
          {['income', 'deduction', 'summary'].map((t, idx) => (
            <button 
              key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 min-w-[100px] py-2.5 md:py-4 rounded-[1rem] md:rounded-[1.5rem] font-black text-[10px] md:text-sm transition-all duration-300 whitespace-nowrap ${activeTab === t ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
            >
              {idx + 1}. {t === 'income' ? 'เงินได้' : t === 'deduction' ? 'ลดหย่อน' : 'สรุปผล'}
            </button>
          ))}
        </div>

        {activeTab === 'income' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 animate-fadeIn">
            <FormSection title="รายได้กลุ่ม 40(1) - 40(4)" subtitle="(1 ม.ค. - 31 ธ.ค.)" icon="payments">
              <Input label="40(1) เงินเดือน/โบนัส" value={incomes.m40_1} onChange={(v)=>setIncomes({...incomes, m40_1: v})} icon="work" />
              <Input label="40(2) นายหน้า/งานอิสระ" value={incomes.m40_2} onChange={(v)=>setIncomes({...incomes, m40_2: v})} icon="person_search" />
              <Input label="40(3) ค่าลิขสิทธิ์/สิทธิบัตร" value={incomes.m40_3} onChange={(v)=>setIncomes({...incomes, m40_3: v})} icon="copyright" />
              <Input label="40(4) ดอกเบี้ย/เงินปันผล" value={incomes.m40_4} onChange={(v)=>setIncomes({...incomes, m40_4: v})} icon="account_balance" />
            </FormSection>
            
            <FormSection title="รายได้กลุ่ม 40(5) - 40(8)" subtitle="(1 ม.ค. - 31 ธ.ค.)" icon="storefront">
              <RentInput 
                label="40(5) ค่าเช่าทรัพย์สิน" 
                value={incomes.m40_5} 
                onChange={(v)=>setIncomes({...incomes, m40_5: v})} 
                typeValue={incomeTypes.m40_5_type}
                onTypeChange={(v)=>setIncomeTypes({...incomeTypes, m40_5_type: v})}
                icon="home_work" 
              />
              <Input label="40(6) วิชาชีพอิสระ (กฎหมาย/แพทย์)" value={incomes.m40_6} onChange={(v)=>setIncomes({...incomes, m40_6: v})} icon="medical_services" />
              <Input label="40(7) รับเหมา (รวมค่าของ)" value={incomes.m40_7} onChange={(v)=>setIncomes({...incomes, m40_7: v})} icon="construction" />
              <Input label="40(8) ธุรกิจ/พาณิชย์/ขายของ" value={incomes.m40_8} onChange={(v)=>setIncomes({...incomes, m40_8: v})} icon="shopping_cart" />
            </FormSection>
            
            <button onClick={() => setActiveTab('deduction')} className="lg:col-span-2 py-4 md:py-6 bg-slate-900 text-white font-black rounded-[1.2rem] md:rounded-[2rem] shadow-xl hover:bg-blue-600 transition-all active:scale-95 text-sm md:text-xl flex items-center justify-center gap-2 md:gap-4 mt-2">
               ถัดไป: บันทึกค่าลดหย่อน <span className="material-symbols-outlined text-lg md:text-2xl">arrow_forward</span>
            </button>
          </div>
        )}

        {activeTab === 'deduction' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 animate-fadeIn">
            <FormSection title="กลุ่ม 1: ส่วนตัวและครอบครัว" icon="family_restroom">
              <div className="flex items-center justify-between px-4 py-3 md:p-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl mb-1 md:mb-2">
                <span className="text-[10px] md:text-[11px] font-black text-slate-500 tracking-wide">คู่สมรส (จดทะเบียนสมรสและไม่มีรายได้)</span>
                <input type="checkbox" checked={deductions.spouse} onChange={(e)=>setDeductions({...deductions, spouse: e.target.checked})} className="w-5 h-5 md:w-6 md:h-6 accent-blue-600 cursor-pointer" />
              </div>
              <Input label="จำนวนบิดามารดา (อายุ 60 ปีขึ้นไป รายได้ไม่เกิน 30,000/ปี)" value={deductions.parentsCount} onChange={(v)=>setDeductions({...deductions, parentsCount: v})} multiplier="คน" icon="elderly" />
              <Input label="บุตร (เกิดก่อนปี 2561 - หักได้ 30,000/คน)" value={deductions.childrenOld} onChange={(v)=>setDeductions({...deductions, childrenOld: v})} multiplier="คน" icon="child_care" />
              <Input label="บุตร (เกิดตั้งแต่ปี 2561 - หักได้ 60,000/คน)" value={deductions.childrenNew} onChange={(v)=>setDeductions({...deductions, childrenNew: v})} multiplier="คน" icon="baby_changing_station" />
            </FormSection>
            
            <FormSection title="กลุ่ม 2: ประกันและการลงทุน" icon="verified">
              <Input label="ประกันสังคม (ตามที่จ่ายจริง สูงสุด 9,000)" value={deductions.socialSecurity} onChange={(v)=>setDeductions({...deductions, socialSecurity: v})} icon="groups" />
              <Input label="ประกันชีวิต (รวมประกันสุขภาพแล้ว ต้องไม่เกิน 100,000)" value={deductions.lifeInsurance} onChange={(v)=>setDeductions({...deductions, lifeInsurance: v})} icon="health_and_safety" />
              <Input label="ประกันสุขภาพตัวเอง (จ่ายจริง สูงสุด 25,000)" value={deductions.healthInsurance} onChange={(v)=>setDeductions({...deductions, healthInsurance: v})} icon="medical_information" />
              <Input label="ประกันสุขภาพบิดามารดา (รวมกันสูงสุด 15,000)" value={deductions.parentsHealth} onChange={(v)=>setDeductions({...deductions, parentsHealth: v})} icon="volunteer_activism" />
              
              {/* ✅ เพิ่มช่อง กบข. และ กองทุนสำรองเลี้ยงชีพ PVD */}
              <Input label="กบข. / กองทุนสำรองเลี้ยงชีพ PVD (สูงสุด 15% ไม่เกิน 5 แสน)" value={deductions.pvd} onChange={(v)=>setDeductions({...deductions, pvd: v})} icon="account_balance" />
              <Input label="กอช. กองทุนการออมแห่งชาติ (ตามจริง สูงสุด 30,000)" value={deductions.nsf} onChange={(v)=>setDeductions({...deductions, nsf: v})} icon="savings" />
              <Input label="กองทุน SSF (เพื่อการออม ถือ 10 ปี สูงสุด 30% ไม่เกิน 2 แสน)" value={deductions.ssf} onChange={(v)=>setDeductions({...deductions, ssf: v})} icon="query_stats" />
              <Input label="กองทุน RMF (เพื่อการเลี้ยงชีพ สูงสุด 30% ไม่เกิน 5 แสน)" value={deductions.rmf} onChange={(v)=>setDeductions({...deductions, rmf: v})} icon="trending_up" />
              <Input label="ประกันบำนาญ (สูงสุด 15% ไม่เกิน 2 แสน)" value={deductions.pension} onChange={(v)=>setDeductions({...deductions, pension: v})} icon="account_balance_wallet" />
              <Input label="กองทุน Thai ESG (เพื่อความยั่งยืน สูงสุด 30% ไม่เกิน 3 แสน)" value={deductions.thaiEsg} onChange={(v)=>setDeductions({...deductions, thaiEsg: v})} icon="eco" />
            </FormSection>

            <FormSection title="กลุ่ม 3 และ 4: อสังหาฯและบริจาค" icon="cottage">
              <Input label="ดอกเบี้ยกู้ยืมเพื่อซื้อที่อยู่อาศัย (จ่ายจริง สูงสุด 100,000)" value={deductions.homeLoanInterest} onChange={(v)=>setDeductions({...deductions, homeLoanInterest: v})} icon="home" />
              <Input label="สร้างบ้านใหม่ (ล้านละ 10,000 สูงสุด 100,000)" value={deductions.newHome} onChange={(v)=>setDeductions({...deductions, newHome: v})} icon="architecture" />
              <Input label="บริจาคการศึกษา/รพ./กีฬา (ผ่าน e-Donation ลดหย่อน 2 เท่า)" value={deductions.donationEdu} onChange={(v)=>setDeductions({...deductions, donationEdu: v})} icon="school" />
              <Input label="บริจาคทั่วไป (มูลนิธิ/วัด ตามจ่ายจริง ไม่เกิน 10% ของเงินได้สุทธิ)" value={deductions.donationGeneral} onChange={(v)=>setDeductions({...deductions, donationGeneral: v})} icon="redeem" />
            </FormSection>

            <div className="flex items-end">
              <button onClick={calculateTax} className="w-full py-4 md:py-6 bg-slate-900 text-white font-black rounded-[1.2rem] md:rounded-[2rem] shadow-xl hover:bg-emerald-600 transition-all active:scale-95 text-sm md:text-xl flex items-center justify-center gap-2 md:gap-3">
                 <span className="material-symbols-outlined text-lg md:text-2xl">calculate</span> คำนวณภาษี
              </button>
            </div>
          </div>
        )}

        {activeTab === 'summary' && result.isCalculated && (
          <div className="space-y-6 md:space-y-10 animate-fadeIn">
            
            <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 p-6 md:p-12 rounded-[2rem] md:rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute -right-10 -top-10 md:-right-20 md:-top-20 w-40 h-40 md:w-64 md:h-64 bg-white/10 rounded-full blur-[60px] md:blur-[80px]"></div>
               <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-8 relative z-10">
                  <div className="text-left space-y-1 md:space-y-2">
                    <p className="text-blue-200 font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[10px] md:text-[11px] opacity-80 pb-1">ภาษีที่ต้องชำระทั้งสิ้น</p>
                    <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter pb-1 break-words">
                      ฿{result.taxToPay.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </h2>
                    <p className="text-emerald-300 font-bold text-xs md:text-sm">
                       (เสียภาษีด้วยวิธีที่ {result.details.winningMethod})
                    </p>
                  </div>
                  <button onClick={saveToSheets} disabled={isSubmitting} className={`w-full lg:w-auto px-5 md:px-10 py-3 md:py-5 font-black rounded-xl md:rounded-3xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm md:text-lg ${isSubmitting ? 'bg-white/20 text-white' : 'bg-white text-blue-700 active:scale-95'}`}>
                    <span className="material-symbols-outlined text-lg md:text-2xl">{isSubmitting ? 'sync' : 'cloud_done'}</span>
                    {submitStatus || 'บันทึกข้อมูล'}
                  </button>
               </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-xl border border-blue-200 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-lg flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-2xl -mr-10 -mt-10"></div>
               <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shadow-md shrink-0 border border-blue-100 group-hover:scale-110 transition-transform duration-500 z-10">
                 <span className="material-symbols-outlined text-4xl md:text-5xl text-blue-600 animate-pulse">smart_toy</span>
               </div>
               <div className="space-y-3 z-10 w-full">
                 <h3 className="text-lg md:text-xl font-black text-blue-800 tracking-tight">AI แนะนำเคล็ดลับประหยัดภาษี</h3>
                 <ul className="text-xs md:text-sm font-bold text-slate-600 space-y-2 md:space-y-3">
                    {result.advisor.messages.map((msg, i) => (
                      <li key={i} className="flex items-start gap-2 bg-white/60 p-3 rounded-xl border border-white shadow-sm">
                        <span>{msg}</span>
                      </li>
                    ))}
                 </ul>
               </div>
            </div>

            <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] md:rounded-[3rem] border border-white shadow-xl overflow-hidden">
              <div className="p-5 md:p-8 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-black text-slate-800 text-base md:text-xl flex items-center gap-2"><span className="material-symbols-outlined text-blue-500">list_alt</span> สรุปที่มาของเงินได้สุทธิ</h3>
              </div>
              <div className="p-5 md:p-8 space-y-3 md:space-y-4">
                <DetailRow label="รวมเงินได้พึงประเมินทั้งหมด" value={result.details.totalIncome} isBold color="text-slate-800" />
                <DetailRow label="หัก ค่าใช้จ่ายตามกฎหมาย" value={`- ${result.details.totalExpense.toLocaleString()}`} color="text-rose-500" />
                <div className="pl-4 md:pl-6 border-l-2 border-slate-100 space-y-2 py-2">
                  <DetailRow label="หัก ลดหย่อนกลุ่ม 1 (ครอบครัว)" value={`- ${result.details.group1.toLocaleString()}`} color="text-emerald-600" isSub />
                  <DetailRow label="หัก ลดหย่อนกลุ่ม 2 (ประกัน/ลงทุน)" value={`- ${result.details.group2.toLocaleString()}`} color="text-emerald-600" isSub />
                  <DetailRow label="หัก ลดหย่อนกลุ่ม 4 (อสังหาฯ)" value={`- ${result.details.group4.toLocaleString()}`} color="text-emerald-600" isSub />
                  <DetailRow label="หัก ลดหย่อนกลุ่ม 3 (เงินบริจาค)" value={`- ${result.details.group3.toLocaleString()}`} color="text-emerald-600" isSub />
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <DetailRow label="เงินได้สุทธิ (เพื่อนำไปคำนวณภาษี)" value={result.details.netIncome} isBold isLarge color="text-blue-600" />
                </div>
              </div>
            </div>

            {result.details.isMethod2Applicable && (
              <div className="bg-amber-50 border border-amber-200 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem]">
                <p className="text-xs md:text-sm font-black text-amber-800 mb-2">⚖️ เปรียบเทียบวิธีคำนวณภาษี (รายได้ประเภท 2-8 เกินเกณฑ์):</p>
                <ul className="text-[10px] md:text-xs text-amber-700 font-bold space-y-1 list-disc pl-4">
                  <li>วิธีที่ 1 (ขั้นบันได): ฿{result.details.taxMethod1.toLocaleString()}</li>
                  <li>วิธีที่ 2 (เหมา 0.5%): ฿{result.details.taxMethod2.toLocaleString()}</li>
                  <li className="text-rose-600 mt-2">กฎหมายบังคับให้เสียภาษีตามวิธีที่คำนวณได้สูงกว่า</li>
                </ul>
              </div>
            )}

            <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] md:rounded-[3rem] border border-white shadow-xl overflow-hidden">
              <div className="p-5 md:p-8 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-black text-slate-800 text-base md:text-xl flex items-center gap-2"><span className="material-symbols-outlined text-blue-500">stairs</span> ตารางคำนวณภาษีแบบขั้นบันได</h3>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[450px]">
                  <thead className="bg-slate-50/50 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-4 md:px-8 py-4">ช่วงเงินได้สุทธิ</th>
                      <th className="px-4 md:px-8 py-4 text-center">อัตราภาษี</th>
                      <th className="px-4 md:px-8 py-4 text-right">เงินได้ในขั้น</th>
                      <th className="px-4 md:px-8 py-4 text-right">ภาษีในขั้น</th>
                    </tr>
                  </thead>
                  <tbody className="text-[10px] md:text-sm font-bold">
                    {result.taxSteps.map((step, idx) => (
                      <tr key={idx} className={`border-b border-slate-50 ${step.amount > 0 ? 'bg-blue-50/30' : 'opacity-40'}`}>
                        <td className="px-4 md:px-8 py-3 md:py-5 text-slate-600 truncate">{step.range}</td>
                        <td className="px-4 md:px-8 py-3 md:py-5 text-center"><span className={`px-2 md:px-3 py-1 rounded-md font-black text-[9px] md:text-xs ${step.amount > 0 ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-400'}`}>{step.rate}%</span></td>
                        <td className="px-4 md:px-8 py-3 md:py-5 text-right text-slate-500">฿{step.amount.toLocaleString()}</td>
                        <td className={`px-4 md:px-8 py-3 md:py-5 text-right font-black ${step.amount > 0 ? 'text-slate-800' : 'text-slate-300'}`}>฿{step.tax.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} userId={user.id} moduleName="Module 2: Full Tax" GOOGLE_SCRIPT_URL={GOOGLE_SCRIPT_URL} />
    </div>
  );
}

function FormSection({ title, subtitle, icon, children }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-lg border border-white space-y-3 md:space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 md:pb-4">
        <span className="material-symbols-outlined text-blue-500 text-xl md:text-2xl">{icon}</span>
        <div>
           <h3 className="text-xs md:text-sm font-black text-slate-700 tracking-wide leading-tight">{title}</h3>
           {subtitle && <p className="text-[9px] md:text-[10px] font-bold text-slate-400">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-3 md:space-y-4">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, multiplier = "บาท", icon }) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] md:text-[11px] font-black text-slate-400 tracking-wide ml-1 block leading-tight">{label}</label>
      <div className="relative flex items-center group">
        <div className="absolute left-2 w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-focus-within:bg-blue-50 group-focus-within:text-blue-600 transition-colors">
          <span className="material-symbols-outlined text-[16px] md:text-[18px]">{icon}</span>
        </div>
        <input 
          type="text" 
          value={value === 0 ? '' : value} 
          onChange={(e) => onChange(Number(e.target.value.replace(/[^0-9]/g, '')))} 
          className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-slate-700 text-sm md:text-base transition-all shadow-sm placeholder:text-slate-200" 
          placeholder="0" 
        />
        <span className="absolute right-3 text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest">{multiplier}</span>
      </div>
    </div>
  );
}

function RentInput({ label, value, onChange, typeValue, onTypeChange, multiplier = "บาท", icon }) {
  return (
    <div className="space-y-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
        <label className="text-[9px] md:text-[11px] font-black text-slate-400 tracking-wide ml-1 block leading-tight">{label}</label>
        <select
          value={typeValue}
          onChange={(e) => onTypeChange(e.target.value)}
          className="text-[9px] md:text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-2 py-1 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 shadow-sm"
        >
          <option value="house">บ้าน/อาคาร/รถ (หักเหมา 30%)</option>
          <option value="agri_land">ที่ดินเกษตรกรรม (หักเหมา 20%)</option>
          <option value="other_land">ที่ดินอื่นๆ (หักเหมา 15%)</option>
        </select>
      </div>
      <div className="relative flex items-center group">
        <div className="absolute left-2 w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-focus-within:bg-blue-50 group-focus-within:text-blue-600 transition-colors">
          <span className="material-symbols-outlined text-[16px] md:text-[18px]">{icon}</span>
        </div>
        <input
          type="text"
          value={value === 0 ? '' : value}
          onChange={(e) => onChange(Number(e.target.value.replace(/[^0-9]/g, '')))}
          className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-slate-700 text-sm md:text-base transition-all shadow-sm placeholder:text-slate-200"
          placeholder="0"
        />
        <span className="absolute right-3 text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest">{multiplier}</span>
      </div>
    </div>
  );
}

function DetailRow({ label, value, color, isBold, isLarge, isSub }) {
  return (
    <div className={`flex justify-between items-center ${isSub ? 'text-[10px] md:text-xs' : 'text-xs md:text-sm'}`}>
      <span className={`${isBold ? 'font-black text-slate-700' : 'font-bold text-slate-500'} ${isLarge ? 'text-sm md:text-base' : ''}`}>{label}</span>
      <span className={`font-black ${color} ${isLarge ? 'text-base md:text-xl' : ''}`}>
        {typeof value === 'number' ? `฿${value.toLocaleString()}` : value}
      </span>
    </div>
  );
}