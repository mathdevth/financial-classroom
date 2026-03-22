import React, { useState, useEffect } from 'react';

// ✅ รับ setActivePage มาเป็น Props เพื่อใช้เปลี่ยนหน้า
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
      if (result.status === "success") {
        setHistory(result.data || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user.id]);

  // ✅ 1. ฟังก์ชัน "ล่าม" แกะข้อมูล JSON ออกมาเป็นข้อความที่อ่านง่าย
  const formatDetail = (detail, moduleName) => {
    try {
      // ลองแกะดูว่าเป็น JSON หรือเปล่า
      const data = JSON.parse(detail);
      
      if (moduleName.includes("Module 3")) {
        return `เงินต้น: ฿${data.inputs.amount.toLocaleString()} | ดอกเบี้ย: ${data.inputs.rate}%`;
      }
      if (moduleName.includes("Module 4")) {
        return `เป้าหมายใช้: ฿${data.monthlyExpense.toLocaleString()}/ด. | เกษียณตอน: ${data.retireAge} ปี`;
      }
      if (moduleName.includes("Module 5")) {
        return `เริ่มที่: ฿${data.inputs.startingSalary.toLocaleString()}/ด. | แผน ${data.inputs.yearsToSimulate} ปี`;
      }
      
      return detail; // ถ้าเป็น JSON แต่ไม่ตรงเงื่อนไข ส่งกลับตามเดิม
    } catch (e) {
      return detail; // ถ้าไม่ใช่ JSON (เช่น Module 1, 2) ส่งกลับตามเดิม
    }
  };

  // --- 🧮 ส่วนคำนวณข้อมูล ---
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
    if (record) return { 
      status: 'สำเร็จ', 
      score: formatDetail(record.detail, moduleName), // 🚀 ใช้ตัวแปลงข้อมูลตรงนี้
      done: true 
    };
    return { status: 'ยังไม่เริ่ม', score: '-', done: false };
  };

  const moduleList = [
    { id: 'module1', name: 'Module 1', title: '1. รู้เท่าทันภัย', desc: 'ทดสอบภูมิคุ้มกันมิจฉาชีพ', icon: 'security' },
    { id: 'module2', name: 'Module 2', title: '2. คำนวณภาษี', desc: 'วางแผนประหยัดภาษี', icon: 'receipt_long' },
    { id: 'module3', name: 'Module 3', title: '3. เครื่องคิดเลข TVM', desc: 'เรียนรู้มูลค่าของเวลา', icon: 'calculate' },
    { id: 'module4', name: 'Module 4', title: '4. แผนเกษียณ', desc: 'สร้างภูเขาเงินออม', icon: 'landscape' },
    { id: 'module5', name: 'Module 5', title: '5. แผนตลอดชีพ', desc: 'จำลองความมั่งคั่ง 30 ปี', icon: 'emoji_events' },
  ];

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-8 md:space-y-12 bg-slate-50 min-h-screen animate-fadeIn">
      
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Financial Journey</h2>
          <p className="text-slate-600 font-medium">
            ยินดีต้อนรับกลับมาครับ <span className="text-blue-600 font-bold">คุณ{user.name}</span>
          </p>
        </div>
        <button 
          onClick={fetchHistory}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-xl ${loading ? 'animate-spin text-blue-600' : ''}`}>sync</span>
          <span>{loading ? 'กำลังโหลด...' : 'อัปเดตความก้าวหน้า'}</span>
        </button>
      </section>

      {/* Progress Banner */}
      <section className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
        <div className="flex-grow space-y-6 w-full relative z-10">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-xl font-bold text-blue-400 uppercase tracking-widest text-xs mb-1">Overall Progress</h3>
              <p className="text-3xl md:text-4xl font-black">ความก้าวหน้าของคุณ</p>
            </div>
            <span className="text-5xl font-black text-blue-500">{overallProgress}%</span>
          </div>
          <div className="w-full bg-white/10 h-5 rounded-full overflow-hidden p-1 border border-white/5">
            <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${overallProgress}%` }}></div>
          </div>
          <p className="text-sm text-slate-400 font-medium flex items-center gap-2 italic">
            <span className="material-symbols-outlined text-blue-400 text-sm">stars</span>
            คุณพิชิตบทเรียนไปแล้ว {completedCount} จาก 5 สถานการณ์จำลอง
          </p>
        </div>
      </section>

      {/* Module Cards Grid */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">rocket_launch</span> 
            เลือกบทเรียนที่ต้องการ
          </h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">คลิกที่การ์ดเพื่อเริ่มเรียน</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {moduleList.map((m) => (
            <ModuleCard 
              key={m.id}
              title={m.title}
              desc={m.desc}
              icon={m.icon}
              data={checkStatus(m.name)}
              onClick={() => setActivePage(m.id)} 
            />
          ))}
        </div>
      </section>

      {/* Insight & History */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">AI Advisor</span>
              <h3 className="text-2xl font-black text-slate-800">สรุปผลการเรียน</h3>
            </div>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              {history.length > 0 
                ? `เก่งมากครับคุณ ${user.name}! กิจกรรมล่าสุดของคุณในเรื่อง "${history[0].module}" ได้รับการบันทึกแล้ว คุณสามารถกลับไปปรับปรุงแผนการเงินได้เสมอนะครับ`
                : `สวัสดีครับ! ผมเตรียมบทเรียนการเงินที่สนุกที่สุดไว้ให้แล้ว เริ่มต้นที่โมดูลที่ 1 เพื่อทดสอบภูมิคุ้มกันมิจฉาชีพก่อนได้เลยครับ`}
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h4 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2 border-b pb-4">
            <span className="material-symbols-outlined text-blue-600 font-bold">history</span>
            ความเคลื่อนไหว
          </h4>
          <div className="space-y-6">
            {history.length > 0 ? (
              history.slice(0, 4).map((item, idx) => (
                <ActivityItem 
                   key={idx} 
                   time={item.date} 
                   title={item.module} 
                   detail={formatDetail(item.detail, item.module)} // 🚀 ใช้ตัวแปลงข้อมูลในตารางประวัติด้วย
                />
              ))
            ) : (
              <div className="text-center py-10 text-slate-300 font-bold italic">ยังไม่มีประวัติกิจกรรม</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// --- ✅ Sub-Components ---

function ModuleCard({ title, desc, icon, data, onClick }) {
  const isDone = data.done;
  return (
    <button 
      onClick={onClick}
      className={`group relative text-left bg-white p-7 rounded-[2rem] shadow-sm border-2 transition-all duration-300 flex flex-col h-full hover:shadow-xl active:scale-95 ${
        isDone ? 'border-green-500 shadow-green-50' : 'border-white hover:border-blue-400'
      }`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
          isDone ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'
        }`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${
          isDone ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-700'
        }`}>
          {data.status}
        </span>
      </div>

      <h4 className="font-black text-lg mb-2 text-slate-800 group-hover:text-blue-600 transition-colors">{title}</h4>
      <p className="text-xs text-slate-500 mb-8 flex-grow leading-relaxed font-bold opacity-70 group-hover:opacity-100 transition-opacity">{desc}</p>
      
      <div className={`flex flex-col gap-1 pt-4 border-t transition-colors ${isDone ? 'border-green-100' : 'border-slate-50 group-hover:border-blue-100'}`}>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">สถิติล่าสุด</span>
        {/* ✅ แสดงผลข้อมูลที่อ่านง่ายแล้ว */}
        <span className={`text-[11px] font-black truncate ${isDone ? 'text-green-600' : 'text-slate-400'}`}>
          {isDone ? data.score : 'คลิกเพื่อเริ่มบทเรียน'}
        </span>
      </div>
    </button>
  );
}

function ActivityItem({ time, title, detail }) {
  return (
    <div className="flex gap-4 group">
      <div className="flex flex-col items-center">
        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
        <div className="w-0.5 h-full bg-slate-100 my-1 group-last:hidden"></div>
      </div>
      <div className="pb-6">
        <div className="text-[9px] text-slate-400 font-black mb-1 uppercase">{time}</div>
        <div className="text-sm font-black text-slate-800 leading-tight mb-1">{title}</div>
        {/* ✅ แสดงผลข้อมูลที่อ่านง่ายแล้ว */}
        <div className="text-[11px] text-slate-500 font-bold line-clamp-2 opacity-70">{detail}</div>
      </div>
    </div>
  );
}