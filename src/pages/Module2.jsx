import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

export default function Module2TaxSimulator({ user }) {
  const [activeTab, setActiveTab] = useState('income');
  
  // 1. State สำหรับรายได้ 8 ประเภท
  const [incomes, setIncomes] = useState({
    m40_1: 0, m40_2: 0, m40_3: 0, m40_4: 0, 
    m40_5: 0, m40_6: 0, m40_7: 0, m40_8: 0
  });

  // 2. State สำหรับค่าลดหย่อน
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

  const calculateTax = () => {
    // --- STEP 1: หักค่าใช้จ่าย ---
    const exp1_2 = Math.min((incomes.m40_1 + incomes.m40_2) * 0.5, 100000);
    const exp3 = Math.min(incomes.m40_3 * 0.5, 100000);
    const exp5 = incomes.m40_5 * 0.3;
    const exp6 = incomes.m40_6 * 0.6;
    const exp7 = incomes.m40_7 * 0.6;
    const exp8 = incomes.m40_8 * 0.6;

    const totalIncome = Object.values(incomes).reduce((a, b) => a + b, 0);
    const totalExpense = exp1_2 + exp3 + exp5 + exp6 + exp7 + exp8;

    // --- STEP 2: หักค่าลดหย่อน (อัปเดตเป็นกฎหมายปัจจุบัน) ---
    const dedPersonal = 60000;
    const dedSpouse = deductions.spouse ? 60000 : 0;
    const dedParents = deductions.parentsCount * 30000;
    const dedChildren = (deductions.childrenOld * 30000) + (deductions.childrenNew * 60000);
    
    // ประกันสังคมอัปเดตกลับมาเป็นฐาน 9,000 บาท (จากเดิมโควิด 6,300)
    const dedSocial = Math.min(deductions.socialSecurity, 9000);
    const dedLifeHealth = Math.min(deductions.lifeInsurance + deductions.healthInsurance, 100000);
    
    const investLimit = totalIncome * 0.3;
    const dedInvest = Math.min(deductions.rmf + deductions.ssf + deductions.pension, 500000, investLimit);
    const dedHome = Math.min(deductions.homeLoanInterest, 100000);

    const totalDeductionBeforeDonation = dedPersonal + dedSpouse + dedParents + dedChildren + dedSocial + dedLifeHealth + dedInvest + dedHome;

    let netBeforeDonation = totalIncome - totalExpense - totalDeductionBeforeDonation;
    if (netBeforeDonation < 0) netBeforeDonation = 0;

    // ✅ อัปเดต: บริจาคการศึกษา เหลือ 1 เท่าตามกฎหมายปัจจุบัน
    const dedDonationEdu = Math.min(deductions.donationEdu, netBeforeDonation * 0.1);
    const dedDonationGeneral = Math.min(deductions.donationGeneral, (netBeforeDonation - dedDonationEdu) * 0.1);

    const netIncome = netBeforeDonation - dedDonationEdu - dedDonationGeneral;

    // รวมยอดลดหย่อนทั้งหมดเพื่อใช้แสดงผล
    const totalActualDeduction = totalDeductionBeforeDonation + dedDonationEdu + dedDonationGeneral;

    // --- STEP 3: คำนวณภาษีแบบขั้นบันได ---
    let tax = 0;
    let tempNet = netIncome;
    const brackets = [
      { l: 150000, r: 0 }, { l: 150000, r: 0.05 }, { l: 200000, r: 0.10 },
      { l: 250000, r: 0.15 }, { l: 250000, r: 0.20 }, { l: 1000000, r: 0.25 },
      { l: 3000000, r: 0.30 }, { l: Infinity, r: 0.35 }
    ];

    for (const b of brackets) {
      if (tempNet <= 0) break;
      const taxable = Math.min(tempNet, b.l);
      tax += taxable * b.r;
      tempNet -= taxable;
    }

    setResult({
      totalIncome, 
      totalExpense, 
      totalDeduction: totalActualDeduction,
      netIncome, 
      taxToPay: tax, 
      isCalculated: true,
      // เก็บรายละเอียดลดหย่อนแต่ละหมวดไว้โชว์
      breakdown: {
        personal: dedPersonal,
        family: dedSpouse + dedParents + dedChildren,
        insurance: dedSocial + dedLifeHealth,
        investment: dedInvest,
        realEstate: dedHome,
        donation: dedDonationEdu + dedDonationGeneral
      }
    });
    setActiveTab('summary');
  };

  const saveToSheets = async () => {
    setIsSubmitting(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST", mode: "no-cors",
        body: JSON.stringify({
          action: "save", userId: user.id,
          moduleName: "Module 2: Full Tax",
          actionData: `รายได้สุทธิ: ฿${result.netIncome.toLocaleString()} | ภาษี: ฿${result.taxToPay.toLocaleString()}`
        })
      });
      setSubmitStatus('บันทึกสำเร็จ ✅');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (e) { setSubmitStatus('ผิดพลาด ❌'); }
    setIsSubmitting(false);
  };

  const taxData = result.isCalculated ? [
    { name: 'เงินออม/สุทธิ', value: result.netIncome, color: '#10b981' }, 
    { name: 'ภาษีที่จ่าย', value: result.taxToPay, color: '#ef4444' }     
  ] : [];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 bg-slate-50 min-h-screen font-sans">
      
      {/* Tab Navigation */}
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

      {/* Tab Content: Income */}
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

      {/* Tab Content: Deduction */}
      {activeTab === 'deduction' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          {/* กลุ่ม 1: ครอบครัว */}
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

          {/* กลุ่ม 2: ประกัน & ออม */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <h4 className="font-black text-green-600 border-b pb-2">กลุ่ม 2: ประกัน & ออม</h4>
            <Input label="ประกันชีวิต/สุขภาพ" value={deductions.lifeInsurance} onChange={(v)=>setDeductions({...deductions, lifeInsurance: v})} />
            {/* แก้ไขคำอธิบายวงเล็บให้ตรงปัจจุบัน */}
            <Input label="ประกันสังคม (เพดาน 9,000)" value={deductions.socialSecurity} onChange={(v)=>setDeductions({...deductions, socialSecurity: v})} />
            <Input label="กองทุน RMF / SSF" value={deductions.rmf} onChange={(v)=>setDeductions({...deductions, rmf: v, ssf: v})} />
          </div>

          {/* กลุ่ม 3-4: บริจาค & อสังหาฯ */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <h4 className="font-black text-orange-600 border-b pb-2">กลุ่ม 3-4: บริจาค & อสังหาฯ</h4>
            <Input label="ดอกเบี้ยบ้าน" value={deductions.homeLoanInterest} onChange={(v)=>setDeductions({...deductions, homeLoanInterest: v})} />
            <Input label="บริจาคทั่วไป" value={deductions.donationGeneral} onChange={(v)=>setDeductions({...deductions, donationGeneral: v})} />
            {/* เปลี่ยน Label จาก x2 เป็นตามจริง */}
            <Input label="บริจาคเพื่อการศึกษา/รพ." value={deductions.donationEdu} onChange={(v)=>setDeductions({...deductions, donationEdu: v})} />
          </div>
          <button onClick={calculateTax} className="md:col-span-3 py-5 bg-blue-600 text-white font-black rounded-3xl shadow-xl hover:bg-blue-700 active:scale-[0.98]">คำนวณภาษีสุทธิ</button>
        </div>
      )}

      {/* Tab Content: Summary */}
      {activeTab === 'summary' && result.isCalculated && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Header ภาษี */}
          <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left">
                <p className="text-blue-400 font-black uppercase tracking-widest text-[10px] mb-2">ภาษีที่ต้องชำระทั้งสิ้น</p>
                <h2 className="text-6xl md:text-7xl font-black tracking-tighter">฿{result.taxToPay.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
              </div>
              <button onClick={saveToSheets} disabled={isSubmitting} className="px-10 py-5 bg-blue-600 rounded-2xl font-black hover:bg-blue-500 transition-all shadow-xl flex items-center gap-3 active:scale-95">
                <span className="material-symbols-outlined">{isSubmitting ? 'sync' : 'save'}</span>
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกประวัติ'}
              </button>
            </div>
            {submitStatus && <p className="text-center mt-4 font-bold text-green-400 animate-bounce">{submitStatus}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard label="รวมรายได้ทั้งหมด" value={result.totalIncome} color="slate" />
            <SummaryCard label="หักค่าใช้จ่าย (Auto)" value={result.totalExpense} color="red" />
            <SummaryCard label="ยอดลดหย่อนที่ใช้สิทธิได้" value={result.totalDeduction} color="orange" />
          </div>

          {/* ✅ ใหม่! ตารางแจกแจงรายละเอียดลดหย่อนที่นำไปใช้คำนวณจริง */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
              <span className="material-symbols-outlined text-orange-500">receipt_long</span>
              รายละเอียดการหักค่าลดหย่อน (หลังผ่านเกณฑ์สรรพากร)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <BreakdownItem label="ลดหย่อนส่วนตัว (พื้นฐาน)" value={result.breakdown.personal} icon="person" />
              <BreakdownItem label="ครอบครัว (คู่สมรส, พ่อแม่, บุตร)" value={result.breakdown.family} icon="family_restroom" />
              <BreakdownItem label="ประกัน (ชีวิต, สุขภาพ, สังคม)" value={result.breakdown.insurance} icon="health_and_safety" />
              <BreakdownItem label="กองทุนและการลงทุน (RMF, SSF)" value={result.breakdown.investment} icon="trending_up" />
              <BreakdownItem label="ดอกเบี้ยที่อยู่อาศัย" value={result.breakdown.realEstate} icon="home" />
              <BreakdownItem label="เงินบริจาค (เพดานไม่เกิน 10%)" value={result.breakdown.donation} icon="volunteer_activism" />
            </div>
            <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-200 flex justify-between items-center bg-orange-50 p-4 rounded-xl">
              <span className="font-black text-orange-800 text-sm">รวมลดหย่อนที่ใช้สิทธิได้ทั้งหมด</span>
              <span className="text-2xl font-black text-orange-600">฿{result.totalDeduction.toLocaleString()}</span>
            </div>
          </div>

          {/* ส่วนแสดงผล Donut Chart */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
            <div className="flex-grow w-full space-y-6 relative z-10">
              <h4 className="font-black text-slate-800 text-lg flex items-center gap-2 border-b pb-4">
                <span className="material-symbols-outlined text-green-500">donut_large</span>
                สัดส่วน: เงินออม vs ภาษี
              </h4>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                  <p className="text-[10px] text-green-700 font-black uppercase mb-1">เงินได้สุทธิ (ออม)</p>
                  <h3 className="text-xl font-black text-green-600">
                    ฿{result.netIncome.toLocaleString()}
                  </h3>
                  <p className="text-xs font-bold text-green-500 mt-1">({Math.round((result.netIncome / result.totalIncome) * 100)}%)</p>
                </div>
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                  <p className="text-[10px] text-red-700 font-black uppercase mb-1">ภาษีที่จ่าย</p>
                  <h3 className="text-xl font-black text-red-600">
                    ฿{result.taxToPay.toLocaleString()}
                  </h3>
                  <p className="text-xs font-bold text-red-500 mt-1">({Math.round((result.taxToPay / result.totalIncome) * 100)}%)</p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 h-[300px] md:h-[350px] shrink-0 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taxData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {taxData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} content={({ payload }) => (
                    <div className="flex justify-center gap-4 text-[11px] font-black uppercase text-slate-500 tracking-widest pt-2">
                      {payload.map((entry, index) => (
                        <div key={`legend-${index}`} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                          <span>{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  )} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">เงินได้สุทธิรายปี</p>
                <h3 className="text-2xl font-black text-green-600 tracking-tighter">
                  ฿{result.netIncome.toLocaleString()}
                </h3>
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-green-500/5 rounded-full blur-[100px]"></div>
          </div>

          {/* ตารางขั้นบันได */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">leaderboard</span>
              ตารางเปรียบเทียบขั้นบันไดภาษี
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] font-black text-slate-400 uppercase border-b">
                  <tr>
                    <th className="pb-4">ช่วงเงินได้สุทธิ</th>
                    <th className="pb-4 text-center">อัตราภาษี</th>
                    <th className="pb-4 text-right">ภาษีในขั้นนี้</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-bold">
                  {taxTable.map((row, i) => (
                    <tr key={i} className={`border-b border-slate-50 ${result.netIncome > row.min ? 'text-slate-800' : 'text-slate-300'}`}>
                      <td className="py-4">{row.label}</td>
                      <td className="py-4 text-center">{row.rate}%</td>
                      <td className="py-4 text-right">{result.netIncome > row.min ? '฿' + Math.min(row.maxTax, Math.max(0, (result.netIncome - row.min) * (row.rate/100))).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Component ย่อย: ช่องกรอก Input ---
function Input({ label, value, onChange, multiplier = 1 }) {
  const displayAmount = value * multiplier;
  const isPerson = multiplier > 1; 

  return (
    <div className="space-y-1">
      <label className="text-[11px] font-black text-slate-600 tracking-wide ml-1">{label}</label>
      <div className="relative flex items-center">
        <input 
          type="text" 
          value={value === 0 ? '' : value} 
          onChange={(e) => onChange(Number(e.target.value.replace(/[^0-9]/g, '')))}
          className="w-full pl-4 pr-16 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-slate-700 transition-all shadow-inner"
          placeholder="0"
        />
        <span className="absolute right-4 text-[10px] font-black text-slate-300 uppercase tracking-widest select-none">
          {isPerson ? "คน" : "บาท/ปี"}
        </span>
      </div>
      {value > 0 && (
        <p className="text-[10px] text-blue-600 font-black text-right pr-1 animate-fadeIn">
          {isPerson ? `(${value.toLocaleString()} คน) ` : ""}= {displayAmount.toLocaleString()} บาทต่อปี
        </p>
      )}
    </div>
  );
}

// --- Component ย่อย: โชว์รายละเอียดลดหย่อนแต่ละหมวด ---
function BreakdownItem({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
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

// --- Helpers อื่นๆ ---
const taxTable = [
  { min: 0, label: "0 - 150,000", rate: 0, maxTax: 0 },
  { min: 150000, label: "150,001 - 300,000", rate: 5, maxTax: 7500 },
  { min: 300000, label: "300,001 - 500,000", rate: 10, maxTax: 20000 },
  { min: 500000, label: "500,001 - 750,000", rate: 15, maxTax: 37500 },
  { min: 750000, label: "750,001 - 1,000,000", rate: 20, maxTax: 50000 },
  { min: 1000000, label: "1,000,001 - 2,000,000", rate: 25, maxTax: 250000 },
  { min: 2000000, label: "2,000,001 - 5,000,000", rate: 30, maxTax: 900000 },
];

function SummaryCard({ label, value, color }) {
  const colors = {
    slate: 'border-slate-200 text-slate-800',
    red: 'border-red-100 text-red-600',
    orange: 'border-orange-100 text-orange-600'
  };
  return (
    <div className={`bg-white p-6 rounded-3xl border-b-4 shadow-sm ${colors[color]}`}>
      <p className="text-[10px] font-black uppercase opacity-60 mb-1">{label}</p>
      <h4 className="text-2xl font-black">฿{value.toLocaleString()}</h4>
    </div>
  );
}