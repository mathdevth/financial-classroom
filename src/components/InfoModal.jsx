import React from 'react';
import { createPortal } from 'react-dom'; // ✅ เพิ่มตัวช่วยวาร์ป Modal

export default function InfoModal({ isOpen, onClose, title, content }) {
  if (!isOpen) return null;

  // ✅ ใช้ createPortal เพื่อดึง Modal ออกไปไว้นอก Footer (ไปอยู่ที่ document.body)
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn select-none">
      
      {/* 🌑 Backdrop: ฉากหลังเบลอทั้งหน้าจอ */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      ></div>

      {/* 🏰 Modal Container: อยู่ตรงกลางจอแน่นอน */}
      <div className="relative z-10 w-full max-w-xl bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.4)] border border-white overflow-hidden transform transition-all">
        
        {/* 💎 Header: Snowy Glass Style */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
              <span className="material-symbols-outlined text-3xl">info</span>
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-xl tracking-tight leading-none">{title}</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Information Portal</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors text-slate-400 active:scale-90 outline-none"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* 📝 Content Area: สบายตา */}
        <div className="p-10 max-h-[60vh] overflow-y-auto custom-scrollbar text-slate-600 leading-relaxed font-medium text-[15px]">
          <div className="space-y-4">
            {content}
          </div>
        </div>

        {/* 🔘 Footer Button */}
        <div className="p-6 border-t border-slate-50 bg-slate-50/30">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white font-black rounded-2xl shadow-xl active:scale-[0.98] transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">check_circle</span>
            ตกลงและเข้าใจแล้ว
          </button>
        </div>
      </div>

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>,
    document.body // ✅ นี่คือจุดหมายปลายทางของการวาร์ป
  );
}