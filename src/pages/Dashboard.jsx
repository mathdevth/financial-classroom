import React, { useState, useEffect } from 'react';

export default function Dashboard({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ ใส่ URL ของ Google Apps Script ของคุณครูเรียบร้อยครับ
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  // ฟังก์ชันดึงข้อมูลจริงจากฐานข้อมูล
  const fetchHistory = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // ✅ แก้ไข: เพิ่ม ?action=getHistory เข้าไปเพื่อให้ Script ฝั่ง Google รู้ว่าต้องดึงข้อมูล
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getHistory&userId=${user.id}`);
      const result = await response.json();
      
      // ✅ แก้ไข: ตรวจสอบสถานะ success และดึงข้อมูลจากตัวแปร data
      if (result.status === "success") {
        setHistory(result.data || []);
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
  
  // 1. นับว่าเรียนจบไปกี่โมดูลแล้ว (นับเฉพาะชื่อโมดูลที่ไม่ซ้ำกัน)
  const completedModulesList = [...new Set(history.map(item => item.module))];
  const completedCount = completedModulesList.length;
  const overallProgress = Math.round((completedCount / 5) * 100);

  // 2. เช็คสถานะแต่ละโมดูลเพื่อเอาไปแสดงในการ์ด
  const checkStatus = (moduleName) => {
    // ค้นหาประวัติที่ชื่อโมดูลตรงกัน
    const record = history.find(item => item.module && item.module.includes(moduleName));
    if (record) return { status: 'สำเร็จ', score: record.detail, done: true };
    return { status: 'ยังไม่เริ่ม', score: '-', done: false };
  };

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-12 bg-slate-50 min-h-screen animate-fadeIn">
      
      {/* Header: แสดงชื่อผู้ใช้จริง */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">ภาพรวมการเรียนรู้</h2>
          <p className="text-slate-600 font-medium text-lg">
            ยินดีต้อนรับครับ <span className="text-blue-600 font-bold">คุณ{user.name}</span>! 
            {history.length > 0 ? ' มาดูความก้าวหน้าของคุณกัน' : ' เริ่มต้นบทเรียนแรกได้เลยครับ'}
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={fetchHistory}
            disabled={loading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-xl ${loading ? 'animate-spin' : ''}`}>sync</span>
            <span>{loading ? 'กำลังโหลด...' : 'ซิงค์ข้อมูล'}</span>
          </button>
        </div>
      </section>

      {/* Progress Banner: คำนวณ % จริงจากฐานข้อมูล */}
      <section className="bg-white rounded-3xl p-8 flex flex-col md:flex-row items-center gap-10 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="flex-grow space-y-4 w-full relative z-10">
          <div className="flex justify-between items-end">
            <h3 className="text-xl font-bold text-slate-800">ความคืบหน้าการเรียนรู้โดยรวม</h3>
            <span className="text-4xl font-black text-blue-600">{overallProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-1">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(59,130,246,0.5)]"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500 text-sm">info</span>
            คุณเรียนจบไปแล้ว {completedCount} จาก 5 โมดูลหลัก
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 w-full md:w-auto shrink-0 relative z-10">
          <div className={`w-3 h-3 rounded-full ${history.length > 0 ? 'bg-green-500' : 'bg-orange-400'} animate-pulse`}></div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">สถานะปัจจุบัน</div>
            <div className="text-sm font-bold text-slate-700">{history.length > 0 ? 'มีประวัติการเรียน' : 'ยังไม่มีข้อมูล'}</div>
          </div>
        </div>
      </section>

      {/* Module Cards: แสดงสถานะจริงตาม Module ที่เคยเรียน */}
      <section>
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">grid_view</span> 
          สถานะรายโมดูล (ข้อมูลจริง)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <ModuleCard 
            title="1. รู้เท่าทันภัย" desc="ป้องกันภัยไซเบอร์" icon="security" 
            data={checkStatus("Module 1")} color="green"
          />
          <ModuleCard 
            title="2. คำนวณภาษี" desc="วางแผนลดหย่อนภาษี" icon="receipt_long" 
            data={checkStatus("Module 2")} color="green"
          />
          <ModuleCard 
            title="3. เครื่องคิดเลข TVM" desc="มูลค่าเงินตามเวลา" icon="calculate" 
            data={checkStatus("Module 3")} color="blue"
          />
          <ModuleCard 
            title="4. แผนเกษียณ" desc="เตรียมตัวสู่วัยเกษียณ" icon="elderly" 
            data={checkStatus("Module 4")} color="orange"
          />
          <ModuleCard 
            title="5. แผนตลอดชีพ" desc="กระแสเงินสดจำลอง" icon="emoji_events" 
            data={checkStatus("Module 5")} color="purple"
          />
        </div>
      </section>

      {/* Activity & Insight */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 text-white p-10 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-2xl border border-slate-800">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <span className="material-symbols-outlined text-blue-400 text-3xl">psychology</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight">AI Intelligence Insight</h3>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
              {history.length > 0 
                ? `ยินดีด้วยครับคุณ ${user.name}! คุณเรียนเรื่อง ${history[0].module} ล่าสุด แนะนำให้ลองทบทวนเรื่องดอกเบี้ยทบต้นในโมดูลที่ 3 ต่อเพื่อผลลัพธ์ที่ดีขึ้นครับ`
                : "ยินดีต้อนรับสมาชิกใหม่! แนะนำให้คุณเริ่มจากโมดูลที่ 1 เพื่อสร้างพื้นฐานภูมิคุ้มกันทางการเงินที่แข็งแกร่งครับ"}
            </p>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <h4 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2 border-b pb-4">
            <span className="material-symbols-outlined text-blue-600 font-bold">history</span>
            กิจกรรมล่าสุด
          </h4>
          <div className="space-y-6 flex-grow overflow-y-auto max-h-[300px] pr-2">
            {history.length > 0 ? (
              history.slice(0, 5).map((item, idx) => (
                <ActivityItem key={idx} time={item.date} title={item.module} detail={item.detail} />
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 italic text-sm">ยังไม่มีประวัติการเรียน</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// --- Sub-Components (คงเดิมแต่ปรับปรุงการแสดงผล) ---

function ModuleCard({ title, desc, icon, data, color }) {
  const isDone = data.done;
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border transition-all relative overflow-hidden flex flex-col h-full ${isDone ? 'border-green-100' : 'border-slate-100 opacity-80'}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDone ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${isDone ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
          {data.status}
        </span>
      </div>
      <h4 className="font-bold text-lg mb-2 text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 mb-6 flex-grow leading-relaxed">{desc}</p>
      <div className="flex items-center justify-between text-xs font-bold pt-4 border-t border-slate-50">
        <span className="text-slate-400">ข้อมูล: {data.score}</span>
        {isDone && <span className="text-green-600 font-black">100%</span>}
      </div>
    </div>
  );
}

function ActivityItem({ time, title, detail }) {
  return (
    <div className="flex gap-4 group">
      <div className="flex flex-col items-center">
        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm group-hover:scale-125 transition-transform"></div>
        <div className="w-0.5 h-full bg-slate-50 my-1"></div>
      </div>
      <div className="pb-4">
        <div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5 tracking-tighter">{time}</div>
        <div className="text-sm font-bold text-slate-700 leading-tight group-hover:text-blue-600 transition-colors">{title}</div>
        <div className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">{detail}</div>
      </div>
    </div>
  );
}