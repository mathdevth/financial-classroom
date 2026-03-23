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
    } catch (e) { console.error("Fetch Error:", e); }
    finally { setLoading(false); }
  };

  // ✅ ฟังก์ชันแกะข้อมูล JSON โชว์ในประวัติให้เป็นระเบียบ (Smart Formatter)
  const formatDetail = (detail) => {
    try {
      // ลองตรวจสอบว่าเป็น JSON หรือไม่
      if (detail.startsWith('{')) {
        const data = JSON.parse(detail);

        // 🚀 โมดูล 2: ภาษี (รวมรายได้ และโชว์ยอดภาษี)
        if (moduleName.includes("Module 2")) {
          const totalInc = data.incomes ? Object.values(data.incomes).reduce((a, b) => a + b, 0) : 0;
          const tax = data.taxToPay || 0;
          return (
            <div className="flex flex-col gap-1">
              <span className="text-blue-600 font-black">รายได้รวม: ฿{totalInc.toLocaleString()}</span>
              <span className="text-red-500 font-bold">ภาษีที่ชำระ: ฿{tax.toLocaleString()}</span>
            </div>
          );
        }

        // 🚀 โมดูล 3: TVM
        if (moduleName.includes("Module 3")) {
          return `เงินต้น: ฿${data.inputs?.amount?.toLocaleString() || 0} | ${data.inputs?.years || 0} ปี | ดอกเบี้ย: ${data.inputs?.rate || 0}%`;
        }

        // 🚀 โมดูล 4: แผนเกษียณ
        if (moduleName.includes("Module 4")) {
          return `เป้าหมาย: ฿${data.targetFund?.toLocaleString() || 'N/A'} | ออมเพิ่ม: ฿${Math.ceil(data.monthlySavingNeeded || 0).toLocaleString()}/เดือน`;
        }

        // 🚀 โมดูล 5: แผนชีวิต
        if (moduleName.includes("Module 5")) {
          return `เงินเดือนเริ่ม: ฿${data.inputs?.startingSalary?.toLocaleString() || 0} | แผน ${data.inputs?.yearsToSimulate || 0} ปี | เป้าหมายรวม: ฿${data.totalWealth?.toLocaleString() || 0}`;
        }
      }
      
      // ถ้าไม่ใช่ JSON หรือเป็นโมดูล 1 ให้คืนค่าเดิม (เช่น "คะแนน: 10/14")
      return detail;
    } catch (e) {
      return detail; // ถ้า Parse ผิดพลาด ให้คืนค่า String เดิม
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn text-slate-800">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-white/20">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600">history</span>
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg leading-none">History Logs</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{moduleName}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
          {loading ? (
            <div className="text-center py-20 flex flex-col items-center gap-3">
              <span className="material-symbols-outlined animate-spin text-blue-600 text-4xl">sync</span>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">กำลังดึงข้อมูลล่าสุด...</p>
            </div>
          ) : history.length > 0 ? (
            history.map((item, idx) => (
              <div key={idx} className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.date}</span>
                  </div>
                  <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded-full border shadow-sm text-slate-400 uppercase">Saved</span>
                </div>
                <div className="text-sm font-bold text-slate-600 leading-relaxed pl-3 border-l-2 border-slate-200 group-hover:border-blue-300">
                  {formatDetail(item.detail)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 flex flex-col items-center gap-4 opacity-40">
              <span className="material-symbols-outlined text-6xl">database_off</span>
              <p className="text-sm font-bold italic text-slate-400 tracking-tight">ยังไม่มีประวัติการบันทึกในโมดูลนี้</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">The Financial Classroom • Academic Tool</p>
        </div>
      </div>
    </div>
  );
}