import React, { useState, useEffect } from 'react';

export default function Dashboard({ user, setActivePage }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  const fetchHistory = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getHistory&userId=${user.id}&t=${new Date().getTime()}`);
      const result = await response.json();
      if (result.status === "success") setHistory(result.data || []);
    } catch (err) { console.error("Fetch error:", err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, [user.id]);

  // ✅ อัปเดต formatDetail ให้อ่านค่าจาก Module 4 ได้ทั้ง 2 โหมด
  const formatDetail = (detail, moduleName) => {
    try {
      if (typeof detail !== 'string' || !detail.startsWith('{')) return detail;
      const data = JSON.parse(detail);
      if (moduleName.includes("Module 2")) {
        const totalInc = data.incomes ? Object.values(data.incomes).reduce((a, b) => a + b, 0) : 0;
        return `รายได้: ฿${totalInc.toLocaleString()} | ภาษี: ฿${(data.taxToPay || 0).toLocaleString()}`;
      }
      if (moduleName.includes("Module 3")) return `เงินต้น: ฿${data.inputs?.amount?.toLocaleString() || 0} | ดอกเบี้ย: ${data.inputs?.rate || 0}%`;
      if (moduleName.includes("Module 4")) {
        // เช็คว่าบันทึกมาจากโหมดไหน แล้วแสดงผลลัพธ์ให้เหมาะสม
        if (data.mode === 'FIND_TARGET') {
           return `เป้าหมายเกษียณ: ฿${Math.round(data.targetFund || 0).toLocaleString()}`;
        } else {
           return `เป้าหมายออม: ฿${Math.ceil(data.monthlySavingNeeded || 0).toLocaleString()}/ด.`;
        }
      }
      if (moduleName.includes("Module 5")) return `จำลองชีวิต ${data.inputs?.yearsToSimulate || 0} ปี`;
      return detail; 
    } catch (e) { return detail; }
  };

  const completedModulesList = [...new Set(history.map(item => {
      if (item.module.includes("Module 1")) return 1;
      if (item.module.includes("Module 2")) return 2;
      if (item.module.includes("Module 3")) return 3;
      if (item.module.includes("Module 4")) return 4;
      if (item.module.includes("Module 5")) return 5;
      return null;
  }))].filter(m => m !== null);

  const completedCount = completedModulesList.length;
  const overallProgress = Math.round((completedCount / 5) * 100);

  const checkStatus = (moduleName) => {
    const record = history.find(item => item.module && item.module.includes(moduleName));
    if (record) return { status: 'สำเร็จ', score: formatDetail(record.detail, record.module), done: true };
    return { status: 'ยังไม่เริ่ม', score: '-', done: false };
  };

  // ✅ อัปเดตลอจิกสำหรับ AI Advisor ให้ฉลาดขึ้นกับ Module 4
  const getAISummary = () => {
    const m4 = history.find(h => h.module.includes("Module 4"));
    const m5 = history.find(h => h.module.includes("Module 5"));
    
    if (!m4 && !m5) return "เริ่มวางแผนเกษียณ (Module 4) และจำลองความมั่งคั่ง (Module 5) เพื่อให้ AI ช่วยวิเคราะห์แผนการเงินของคุณนะครับ";
    
    let advice = `จากการวิเคราะห์แผนของคุณ `;
    if (m4) {
      const d = JSON.parse(m4.detail);
      if (d.mode === 'FIND_TARGET') {
         advice += `คุณตั้งเป้าหมายเงินเกษียณไว้ที่ ฿${Math.round(d.targetFund).toLocaleString()} `;
      } else {
         advice += `คุณต้องออมเงินเดือนละ ฿${Math.ceil(d.monthlySavingNeeded).toLocaleString()} เพื่อให้ถึงเป้าหมายเกษียณ `;
      }
    }
    if (m5) {
      const d = JSON.parse(m5.detail);
      advice += `และหากทำตามแผนจักรวาลความมั่งคั่ง ในปีที่ ${d.inputs?.yearsToSimulate || 30} คุณจะมีเงินรวมประมาณ ฿${Math.round(d.totalWealth).toLocaleString()} ครับ!`;
    }
    return advice;
  };

  const moduleList = [
    { id: 'module1', name: 'Module 1', title: 'รู้เท่าทันภัย', desc: 'ภูมิคุ้มกันมิจฉาชีพ', icon: 'verified_user' },
    { id: 'module2', name: 'Module 2', title: 'คำนวณภาษี', desc: 'วางแผนประหยัดเงิน', icon: 'receipt_long' },
    { id: 'module3', name: 'Module 3', title: 'เครื่องคิดเลข TVM', desc: 'มูลค่าของเวลา', icon: 'speed' },
    { id: 'module4', name: 'Module 4', title: 'แผนเกษียณ', desc: 'สร้างภูเขาเงินออม', icon: 'landscape' },
    { id: 'module5', name: 'Module 5', title: 'แผนตลอดชีพ', desc: 'ความมั่งคั่ง 30 ปี', icon: 'stars' },
  ];

  const getBadgeInfo = (count) => {
    if (count >= 5) return { label: 'ปรมาจารย์การเงิน', icon: 'workspace_premium', class: 'from-amber-400 to-orange-600', shimmer: true };
    if (count >= 3) return { label: 'นักวางแผนมือโปร', icon: 'stars', class: 'from-blue-500 to-indigo-600', shimmer: false };
    return { label: 'นักออมฝึกหัด', icon: 'potted_plant', class: 'from-slate-400 to-slate-600', shimmer: false };
  };

  const badge = getBadgeInfo(completedCount);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6 md:px-10 lg:px-14 font-sans animate-fadeIn relative overflow-hidden">
      
      {/* 🔮 Background Decor */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-100/40 rounded-full blur-[120px] -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] bg-emerald-50/50 rounded-full blur-[100px] -ml-48 -mb-48"></div>

      <div className="max-w-[100rem] mx-auto space-y-12 relative z-10">
        
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-2">
            <h2 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-800 leading-none pb-2 pr-4">
              Financial <span className="text-blue-600">Journey</span>
            </h2>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <p className="text-slate-500 font-bold text-lg md:text-xl">
                ยินดีต้อนรับกลับมาครับ <span className="text-slate-900 font-black">คุณ{user.name}</span>
              </p>
              
              <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full font-black text-[10px] shadow-xl border border-white/40 bg-gradient-to-r ${badge.class} text-white relative overflow-hidden group hover:scale-105 transition-all duration-500`}>
                <span className="material-symbols-outlined text-[16px]">{badge.icon}</span>
                <span className="tracking-[0.2em] uppercase">{badge.label}</span>
                {badge.shimmer && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />}
              </div>
            </div>
          </div>

          <button onClick={fetchHistory} disabled={loading} className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 text-slate-700 font-black rounded-3xl shadow-sm hover:bg-slate-50 hover:shadow-md transition-all active:scale-95 disabled:opacity-50 group">
            <span className={`material-symbols-outlined text-blue-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}>sync</span>
            <span>{loading ? 'Updating...' : 'Refresh Data'}</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 🏆 Left: Overall Progress Card */}
          <div className="lg:col-span-8">
            <section className="bg-white/80 backdrop-blur-3xl rounded-[4rem] p-10 md:p-14 border border-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden h-full group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[80px]"></div>
              
              <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10 h-full">
                <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                      strokeDasharray={552.9} strokeDashoffset={552.9 - (552.9 * overallProgress) / 100}
                      strokeLinecap="round" className="text-blue-600 transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black text-slate-800">{overallProgress}%</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Overall</span>
                  </div>
                </div>

                <div className="flex-grow space-y-6 w-full text-center lg:text-left">
                  <div className="space-y-1">
                    <h3 className="text-blue-500 font-black uppercase tracking-[0.4em] text-[11px]">Current Progress</h3>
                    <p className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight pb-2 pr-4">ความก้าวหน้าทางการเงิน</p>
                  </div>
                  
                  <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-1 shadow-inner">
                    <div className="bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600 h-full rounded-full transition-all duration-1000 shadow-md" style={{ width: `${overallProgress}%` }}></div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                    <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm font-black text-slate-600 text-sm">
                       <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                       สำเร็จ {completedCount}/5 โมดูล
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 🤖 ✅ Right: AI Advisor Card */}
          <div className="lg:col-span-4">
            <section className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl h-full relative overflow-hidden group border border-white/5">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-[50px]"></div>
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-400 animate-pulse">psychology</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">AI Financial Advisor</h3>
                    <p className="text-[10px] text-blue-400 uppercase tracking-widest font-black">Smart Summary</p>
                  </div>
                </div>
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 relative">
                  <span className="material-symbols-outlined absolute -top-3 -left-2 text-blue-500/50 text-4xl">format_quote</span>
                  <p className="text-sm font-bold leading-relaxed text-slate-300 italic">
                    {loading ? "กำลังวิเคราะห์ข้อมูล..." : getAISummary()}
                  </p>
                </div>
                <div className="pt-2">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                     Live Analysis Active
                   </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* 🚀 Modules Grid */}
        <section className="space-y-10 pt-4">
          <div className="flex items-center gap-4">
            <div className="h-8 w-2 bg-blue-600 rounded-full"></div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-800">บทเรียนการเงิน</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {moduleList.map((m) => (
              <ModuleCard key={m.id} title={m.title} desc={m.desc} icon={m.icon} data={checkStatus(m.name)} onClick={() => setActivePage(m.id)} />
            ))}
          </div>
        </section>

        {/* 🕒 Recent Activities */}
        <section className="space-y-10 pt-4 pb-10">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="h-8 w-2 bg-indigo-500 rounded-full"></div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-800">กิจกรรมล่าสุด</h3>
             </div>
          </div>
          <div className="bg-white/60 backdrop-blur-2xl rounded-[3rem] border border-white shadow-xl overflow-hidden">
             {loading ? (
               <div className="p-20 text-center text-slate-300 font-black animate-pulse">กำลังโหลดประวัติ...</div>
             ) : history.length > 0 ? (
               <div className="divide-y divide-slate-50">
                 {history.slice(0, 5).map((item, idx) => (
                   <div key={idx} className="p-8 hover:bg-white/80 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                         <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shadow-inner">
                            <span className="material-symbols-outlined text-2xl">history_edu</span>
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{item.date}</p>
                            <h4 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{item.module}</h4>
                         </div>
                      </div>
                      <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm group-hover:border-indigo-100 transition-colors">
                         <p className="text-sm font-bold text-slate-600 italic">"{formatDetail(item.detail, item.module)}"</p>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="p-20 text-center text-slate-300 font-bold italic uppercase tracking-widest">ยังไม่มีข้อมูลกิจกรรมย้อนหลัง</div>
             )}
          </div>
        </section>
      </div>

      <style>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

function ModuleCard({ title, desc, icon, data, onClick }) {
  const isDone = data.done;
  return (
    <button onClick={onClick} className={`group relative text-left p-8 rounded-[3.5rem] border transition-all duration-500 flex flex-col h-full shadow-xl hover:-translate-y-2 active:scale-95 overflow-hidden ${isDone ? 'bg-white border-blue-100 shadow-blue-500/5' : 'bg-white/50 border-white shadow-slate-200/50 hover:bg-white hover:border-blue-200'}`}>
      {isDone && <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>}
      <div className="flex justify-between items-start mb-10 relative z-10">
        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-lg ${isDone ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white'}`}>
          <span className="material-symbols-outlined text-[32px]">{icon}</span>
        </div>
        <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
          {data.status}
        </span>
      </div>
      <h4 className="font-black text-2xl mb-2 text-slate-800 group-hover:text-blue-600 transition-colors pb-1 pr-4 leading-tight">{title}</h4>
      <p className="text-[12px] text-slate-400 font-bold leading-relaxed flex-grow pr-4">{desc}</p>
      <div className={`flex flex-col gap-2 pt-6 mt-8 border-t transition-colors ${isDone ? 'border-emerald-50' : 'border-slate-50'}`}>
        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Last Activity</span>
        <div className="flex items-center gap-2">
          {isDone && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>}
          <span className={`text-[12px] font-black truncate ${isDone ? 'text-emerald-600' : 'text-slate-300 italic'}`}>
            {isDone ? data.score : 'Pending...'}
          </span>
        </div>
      </div>
    </button>
  );
}