import React, { useState, useEffect } from 'react';

export default function Dashboard({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ ใส่ URL ของ Google Apps Script ของคุณครู
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  // ฟังก์ชันดึงข้อมูลจริงจากฐานข้อมูล
  const fetchHistory = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // ✅ เติม &t= ด้านหลังเพื่อกัน Browser จำค่าเก่า (Cache) ทำให้ข้อมูลสดใหม่เสมอ
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getHistory&userId=${user.id}&t=${new Date().getTime()}`);
      const result = await response.json();
      
      if (result.status === "success") {
        // 🚨 จุดสำคัญ: ฝั่ง Google Script เรียงจากใหม่ไปเก่ามาให้แล้ว 
        // เราจึงเอามาใช้งานได้เลยโดยไม่ต้อง .reverse() ซ้ำครับ
        const freshData = result.data || [];
        setHistory(freshData);
      } else {
        console.warn("Server returned error:", result.message);
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

  // --- 🧮 ส่วนคำนวณข้อมูลจริงจากฐานข้อมูล ---
  
  // 1. นับว่าเรียนจบไปกี่โมดูลแล้ว
  const completedModulesList = [...new Set(history.map(item => item.module))];
  const completedCount = completedModulesList.length;
  const overallProgress = Math.round((completedCount / 5) * 100);

  // 2. เช็คสถานะแต่ละโมดูล (หาอันที่ "ใหม่ที่สุด" ของโมดูลนั้นๆ)
  const checkStatus = (moduleName) => {
    // เนื่องจาก history เรียงจาก ใหม่ -> เก่า อยู่แล้ว 
    // .find() จะเจอข้อมูลที่เพิ่งทำล่าสุดเป็นอันแรกเสมอ
    const record = history.find(item => item.module && item.module.includes(moduleName));
    if (record) return { status: 'สำเร็จ', score: record.detail, done: true };
    return { status: 'ยังไม่เริ่ม', score: '-', done: false };
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-8 md:space-y-12 bg-slate-50 min-h-screen animate-fadeIn">
      
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">ภาพรวมการเรียนรู้</h2>
          <p className="text-slate-600 font-medium text-base md:text-lg">
            ยินดีต้อนรับครับ <span className="text-blue-600 font-bold">คุณ{user.name}</span>! 
            {history.length > 0 ? ' มาดูความก้าวหน้าล่าสุดของคุณกัน' : ' เริ่มต้นบทเรียนแรกได้เลยครับ'}
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto shrink-0">
          <button 
            onClick={fetchHistory}
            disabled={loading}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-xl ${loading ? 'animate-spin text-blue-600' : ''}`}>sync</span>
            <span>{loading ? 'กำลังโหลด...' : 'ซิงค์ข้อมูลล่าสุด'}</span>
          </button>
        </div>
      </section>

      {/* Progress Banner */}
      <section className="bg-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-10 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="flex-grow space-y-4 w-full relative z-10">
          <div className="flex justify-between items-end">
            <h3 className="text-lg md:text-xl font-bold text-slate-800">ความคืบหน้าโดยรวม</h3>
            <span className="text-3xl md:text-4xl font-black text-blue-600">{overallProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-1">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(59,130,246,0.5)]"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500 text-sm">info</span>
            คุณผ่านไปแล้ว {completedCount} จาก 5 ด่านสำคัญ
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 w-full md:w-auto shrink-0 relative z-10">
          <div className={`w-3 h-3 rounded-full ${history.length > 0 ? 'bg-green-500' : 'bg-orange-400'} animate-pulse`}></div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">สถานะระบบ</div>
            <div className="text-sm font-bold text-slate-700">{history.length > 0 ? 'เชื่อมต่อข้อมูลแล้ว' : 'ยังไม่มีประวัติ'}</div>
          </div>
        </div>
      </section>

      {/* Module Cards */}
      <section>
        <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">grid_view</span> 
          ผลงานล่าสุดแต่ละด่าน
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
          <ModuleCard title="1. รู้เท่าทันภัย" desc="ทดสอบภูมิคุ้มกันมิจฉาชีพ" icon="security" data={checkStatus("Module 1")} />
          <ModuleCard title="2. คำนวณภาษี" desc="วางแผนประหยัดภาษี" icon="receipt_long" data={checkStatus("Module 2")} />
          <ModuleCard title="3. เครื่องคิดเลข TVM" desc="เรียนรู้มูลค่าของเวลา" icon="calculate" data={checkStatus("Module 3")} />
          <ModuleCard title="4. แผนเกษียณ" desc="สร้างภูเขาเงินออม" icon="landscape" data={checkStatus("Module 4")} />
          <ModuleCard title="5. แผนตลอดชีพ" desc="จำลองความมั่งคั่ง 30 ปี" icon="emoji_events" data={checkStatus("Module 5")} />
        </div>
      </section>

      {/* Activity & Insight */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-slate-900 text-white p-8 md:p-10 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-2xl border border-slate-800">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <span className="material-symbols-outlined text-blue-400 text-2xl md:text-3xl">psychology</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight">AI Insight</h3>
            </div>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-xl">
              {history.length > 0 
                ? `ยินดีด้วยครับคุณ ${user.name}! กิจกรรมล่าสุดคือเรื่อง ${history[0].module} ข้อมูลนี้อัปเดตเรียบร้อยแล้ว หากคุณต้องการพัฒนาคะแนนเพิ่ม สามารถกลับไปเล่นซ้ำได้ตลอดเวลาครับ`
                : "ยินดีต้อนรับ! ผมคือ AI ผู้ช่วย แนะนำให้คุณเริ่มจากการสร้างภูมิคุ้มกันในโมดูลที่ 1 ก่อนเป็นอันดับแรกครับ"}
            </p>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <h4 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2 border-b pb-4">
            <span className="material-symbols-outlined text-blue-600 font-bold">history</span>
            ความเคลื่อนไหวล่าสุด
          </h4>
          <div className="space-y-6 flex-grow overflow-y-auto max-h-[300px] pr-2">
            {history.length > 0 ? (
              history.slice(0, 5).map((item, idx) => (
                <ActivityItem key={idx} time={item.date} title={item.module} detail={item.detail} />
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 italic text-sm">ยังไม่มีประวัติบันทึก</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// --- Sub-Components ---
function ModuleCard({ title, desc, icon, data }) {
  const isDone = data.done;
  return (
    <div className={`bg-white p-6 rounded-3xl shadow-sm border transition-all flex flex-col h-full ${isDone ? 'border-green-100' : 'border-slate-100'}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDone ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${isDone ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
          {data.status}
        </span>
      </div>
      <h4 className="font-black text-lg mb-2 text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 mb-6 flex-grow leading-relaxed font-medium">{desc}</p>
      <div className="flex flex-col gap-2 pt-4 border-t border-slate-50">
        <span className="text-[10px] font-black text-slate-400 uppercase">สถิติล่าสุด</span>
        <span className={`text-xs font-bold truncate ${isDone ? 'text-green-600' : 'text-slate-400'}`}>{data.score}</span>
      </div>
    </div>
  );
}

function ActivityItem({ time, title, detail }) {
  return (
    <div className="flex gap-4 group">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm group-hover:scale-125 transition-all"></div>
        <div className="w-0.5 h-full bg-slate-100 my-1"></div>
      </div>
      <div className="pb-4">
        <div className="text-[10px] text-slate-400 font-black mb-0.5 tracking-tighter">{time}</div>
        <div className="text-sm font-bold text-slate-700 leading-tight group-hover:text-blue-600 transition-colors">{title}</div>
        <div className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">{detail}</div>
      </div>
    </div>
  );
}