import React, { useState, useEffect } from 'react';

export default function HistoryModal({ isOpen, onClose, userId, moduleName, GOOGLE_SCRIPT_URL }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getHistory&userId=${userId}&t=${Date.now()}`);
      const result = await res.json();
      if (result.status === "success") {
        // กรองเอาเฉพาะของโมดูลนี้
        const filtered = result.data.filter(item => item.module.includes(moduleName));
        setHistory(filtered);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ฟังก์ชันแกะข้อมูล JSON โชว์ในประวัติ (เหมือนใน Dashboard)
  const formatDetail = (detail) => {
    try {
      const data = JSON.parse(detail);
      if (moduleName.includes("Module 3")) return `เงินต้น: ฿${data.inputs.amount.toLocaleString()} | ${data.inputs.years}ปี | ดอกเบี้ย ${data.inputs.rate}%`;
      if (moduleName.includes("Module 4")) return `เป้าหมาย: ฿${data.targetFund?.toLocaleString() || 'N/A'} | ออมเพิ่ม: ฿${Math.ceil(data.monthlySavingNeeded || 0).toLocaleString()}/ด.`;
      if (moduleName.includes("Module 5")) return `เงินเดือนเริ่ม: ฿${data.inputs.startingSalary.toLocaleString()} | แผน ${data.inputs.yearsToSimulate} ปี`;
      return detail;
    } catch (e) { return detail; }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">history</span>
            ประวัติการบันทึก: {moduleName}
          </h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="text-center py-10"><span className="material-symbols-outlined animate-spin text-blue-600 text-4xl">sync</span></div>
          ) : history.length > 0 ? (
            history.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                <div className="text-[10px] font-black text-slate-400 uppercase mb-1">{item.date}</div>
                <div className="text-sm font-bold text-slate-700 leading-relaxed">
                  {formatDetail(item.detail)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-400 italic">ยังไม่มีประวัติการบันทึกในบทเรียนนี้</div>
          )}
        </div>
      </div>
    </div>
  );
}