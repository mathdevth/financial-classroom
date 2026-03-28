import React, { useState, useEffect } from 'react';

export default function HistoryModal({ isOpen, onClose, userId, moduleName, GOOGLE_SCRIPT_URL }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchHistory();
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getHistory&userId=${userId}&t=${Date.now()}`);
      const result = await res.json();
      if (result.status === "success") {
        const filtered = result.data.filter(item => item.module.includes(moduleName));
        setHistory(filtered);
      }
    } catch (e) { console.error("Fetch Error:", e); }
    finally { setLoading(false); }
  };

  const formatDetail = (detail) => {
    try {
      if (detail.startsWith('{')) {
        const data = JSON.parse(detail);
        if (moduleName.includes("Module 2")) {
          const totalInc = data.incomes ? Object.values(data.incomes).reduce((a, b) => a + b, 0) : 0;
          return (
            <div className="flex flex-col text-sm gap-1">
              <span className="text-blue-600 font-black">รายได้รวม: ฿{totalInc.toLocaleString()}</span>
              <span className="text-slate-500 font-bold">ภาษี: ฿{(data.taxToPay || 0).toLocaleString()}</span>
            </div>
          );
        }
        if (moduleName.includes("Module 3")) {
          return `💰 ฿${data.inputs?.amount?.toLocaleString() || 0} | 📅 ${data.inputs?.years || 0} ปี | 📈 ${data.inputs?.rate || 0}%`;
        }
        if (moduleName.includes("Module 4")) {
          return `🏔️ เป้าหมาย: ฿${data.targetFund?.toLocaleString() || 0} | ออม: ฿${Math.ceil(data.monthlySavingNeeded || 0).toLocaleString()}/ด.`;
        }
        if (moduleName.includes("Module 5")) {
          return `🌌 เริ่มต้น: ฿${data.inputs?.startingSalary?.toLocaleString() || 0} | แผน ${data.inputs?.yearsToSimulate || 0} ปี`;
        }
      }
      return detail;
    } catch (e) { return detail; }
  };

  if (!isOpen) return null;

  const moduleAccent = (() => {
    if (moduleName.includes("Module 2")) return { color: "bg-blue-500", icon: "receipt_long" };
    if (moduleName.includes("Module 3")) return { color: "bg-emerald-500", icon: "calculate" };
    if (moduleName.includes("Module 4")) return { color: "bg-pink-500", icon: "elderly" };
    if (moduleName.includes("Module 5")) return { color: "bg-cyan-500", icon: "stars" };
    return { color: "bg-slate-400", icon: "history" };
  })();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn text-slate-800 font-sans">
      {/* 🏰 Modal Container - Rounded and Overflow Hidden */}
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[85vh] border border-slate-100">
        
        {/* 💎 Header - Flat against the top, no space */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 ${moduleAccent.color} rounded-2xl flex items-center justify-center text-white shadow-lg group hover:scale-105 transition-transform duration-500`}>
              <span className="material-symbols-outlined text-3xl">{moduleAccent.icon}</span>
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-2xl leading-none tracking-tight pr-4">บันทึกความสำเร็จ</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">{moduleName}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500 outline-none focus:ring-2 focus:ring-slate-300">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* 🚀 List Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-white custom-scrollbar">
          {loading ? (
            <div className="text-center py-20 space-y-4 animate-pulse">
              <span className="material-symbols-outlined animate-spin text-4xl text-slate-300">sync</span>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">กำลังดึงข้อมูลจากจักรวาล...</p>
            </div>
          ) : history.length > 0 ? (
            history.map((item, idx) => (
              <div key={idx} className="group flex items-center gap-5 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-300 relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${moduleAccent.color} opacity-80`} />
                <div className="flex flex-col flex-1 min-w-0 pl-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">{item.date}</span>
                    <span className="text-[9px] font-black bg-white/80 px-2 py-0.5 rounded-full text-slate-400 border border-slate-100">Saved</span>
                  </div>
                  <div className="text-[15px] font-black text-slate-700 leading-relaxed pr-2 truncate">
                    {formatDetail(item.detail)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* 🛸 Empty State */
            <div className="text-center py-24 flex flex-col items-center gap-6 animate-fadeIn">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                <span className="material-symbols-outlined text-6xl text-slate-200">folder_open</span>
              </div>
              <p className="text-base font-bold italic text-slate-500 tracking-tight">เริ่มบันทึกการเดินทางทางการเงินของคุณวันนี้!</p>
            </div>
          )}
        </div>

        {/* 👣 Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">The Financial Classroom • Academic Tool</p>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.1); }
      `}</style>
    </div>
  );
}