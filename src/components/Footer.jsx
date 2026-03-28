import React, { useState } from 'react';
import InfoModal from './InfoModal';

export default function Footer({ totalViews = 0 }) {
  const [modalType, setModalType] = useState(null);

  const infoContent = {
    privacy: (
      <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
        <p className="font-black text-slate-800 border-l-4 border-blue-500 pl-3">1. การเก็บรวบรวมข้อมูล</p>
        <p>เราจัดเก็บเพียง รหัสนักเรียน และ ชื่อ-นามสกุล เพื่อใช้ในการบันทึกคะแนนและติดตามความก้าวหน้าเท่านั้น</p>
        <p className="font-black text-slate-800 border-l-4 border-blue-500 pl-3">2. การใช้งานข้อมูล</p>
        <p>ข้อมูลทั้งหมดจะถูกเก็บเป็นความลับในระบบ Google Sheets และจะไม่ถูกส่งต่อให้บุคคลภายนอก</p>
      </div>
    ),
    terms: (
      <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
        <p className="font-bold text-slate-800">ยินดีต้อนรับสู่ The Financial Classroom</p>
        <ul className="list-disc ml-5 space-y-2 font-medium">
          <li>ผู้ใช้งานตกลงที่จะไม่พยายามแฮ็กระบบหรือกรอกข้อมูลเท็จ</li>
          <li>เนื้อหาเป็นการจำลองเพื่อการเรียนรู้ ไม่ใช่คำแนะนำทางการลงทุนจริง</li>
        </ul>
      </div>
    ),
    contact: (
      <div className="text-center py-6 space-y-6 animate-fadeIn">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-2 shadow-xl shadow-blue-500/20">
          <span className="material-symbols-outlined text-4xl">contact_support</span>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-black text-slate-800">ครูอชิตพล บุณรัตน์</p>
          <p className="text-blue-600 text-sm font-black uppercase tracking-widest">กลุ่มสาระการเรียนรู้คณิตศาสตร์</p>
          <p className="text-slate-500 text-xs font-bold">โรงเรียนวังโพรงพิทยาคม สพม.พลอต.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 mt-8">
          <a href="mailto:achittapon.boonrat@wppschool.ac.th" className="flex items-center justify-center gap-3 py-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-blue-300 hover:shadow-md transition-all text-slate-700 font-black group">
            <span className="material-symbols-outlined text-blue-500 group-hover:scale-110 transition-transform">mail</span>
            <span className="text-sm">Email Contact</span>
          </a>
          <a href="https://www.facebook.com/KumEzio/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 py-4 bg-blue-600 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all text-white font-black group">
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">share</span>
            <span className="text-sm">Facebook: AC'Kum Achittapon</span>
          </a>
        </div>
      </div>
    )
  };

  return (
    <footer className="relative pt-12 pb-8 px-6 md:px-12 border-t border-slate-200/40 bg-white/70 backdrop-blur-2xl w-full select-none font-sans">
      
      {/* 🏷️ Top Copyright Tag */}
      <div className="absolute top-4 left-0 w-full flex justify-center pointer-events-none">
        <span className="text-[10px] text-slate-300 font-black uppercase tracking-[0.4em] opacity-60">
          © 2026 THE FINANCIAL CLASSROOM
        </span>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-10 relative z-10">
        
        {/* 👤 Left: Creator Showcase */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-slate-100 to-white border border-white shadow-sm flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-500">draw</span>
          </div>
          <div className="text-center md:text-left space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-sm font-black text-slate-800 tracking-tight">สร้างสรรค์โดย <span className="text-blue-600">ครูอชิตพล บุณรัตน์</span></span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 opacity-70">
              <span className="material-symbols-outlined text-[14px] text-rose-400">school</span>
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">โรงเรียนวังโพรงพิทยาคม สพม.พลอต.</span>
            </div>
          </div>
        </div>

        {/* 📈 Center: Analytics Widget */}
        <div className="flex items-center gap-4 bg-white/80 px-6 py-3 rounded-[2rem] border border-white shadow-xl shadow-blue-900/5 hover:scale-105 transition-all duration-500 group">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Live Visitors</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
              <span className="text-2xl font-black text-slate-800 tracking-tighter">
                {totalViews.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shadow-inner group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <span className="material-symbols-outlined text-xl font-bold">analytics</span>
          </div>
        </div>

        {/* 🔗 Right: Elegant Navigation */}
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
          <div className="flex gap-6">
            <FooterBtn label="นโยบายความเป็นส่วนตัว" onClick={() => setModalType('privacy')} color="blue" />
            <FooterBtn label="ข้อตกลงการใช้งาน" onClick={() => setModalType('terms')} color="blue" />
          </div>
          
          <div className="hidden sm:block h-8 w-px bg-slate-200"></div>
          
          <button 
            onClick={() => setModalType('contact')}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-900/10"
          >
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
            ติดต่อครู
          </button>
        </div>
      </div>

      <InfoModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        title={
          modalType === 'privacy' ? 'นโยบายความเป็นส่วนตัว' :
          modalType === 'terms' ? 'ข้อตกลงการใช้งาน' : 'ข้อมูลครูผู้สอน'
        }
        content={infoContent[modalType]}
      />
    </footer>
  );
}

// ✅ Internal Button Component for consistency
function FooterBtn({ label, onClick, color }) {
  const activeColor = color === 'blue' ? 'bg-blue-500' : 'bg-rose-500';
  const hoverText = color === 'blue' ? 'hover:text-blue-600' : 'hover:text-rose-500';
  
  return (
    <button
      onClick={onClick}
      className={`relative py-1 text-xs font-black text-slate-500 ${hoverText} transition-colors focus:outline-none group uppercase tracking-wider`}
    >
      {label}
      <span className={`absolute left-0 -bottom-0.5 w-0 h-0.5 ${activeColor} rounded-full group-hover:w-full transition-all duration-300 shadow-[0_0_8px_rgba(59,130,246,0.5)]`}></span>
    </button>
  );
}