import React, { useState } from 'react';
import InfoModal from './InfoModal'; // นำเข้าตัว Modal ที่เราเพิ่งสร้าง

// ✅ ปรับรับพารามิเตอร์ { totalViews } จาก App.jsx
export default function Footer({ totalViews = 0 }) { 
  const [modalType, setModalType] = useState(null); // ควบคุมว่าจะเปิดหน้าไหน

  // ข้อมูลเนื้อหาสำหรับแต่ละปุ่ม (คงเดิม ห้ามลบ)
  const infoContent = {
    privacy: (
      <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
        <p className="font-bold text-slate-800">1. การเก็บรวบรวมข้อมูล</p>
        <p>เราจัดเก็บเพียง รหัสนักเรียน และ ชื่อ-นามสกุล ที่คุณกรอก เพื่อใช้ในการบันทึกคะแนนและติดตามความก้าวหน้าทางการเรียนเท่านั้น</p>
        <p className="font-bold text-slate-800">2. การใช้งานข้อมูล</p>
        <p>ข้อมูลทั้งหมดจะถูกเก็บเป็นความลับในระบบ Google Sheets ของผู้ดูแลระบบ และจะไม่ถูกส่งต่อให้บุคคลภายนอก</p>
      </div>
    ),
    terms: (
      <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
        <p>ยินดีต้อนรับสู่ The Financial Classroom แอปพลิเคชันนี้จัดทำขึ้นเพื่อวัตถุประสงค์ทางการศึกษาเท่านั้น</p>
        <ul className="list-disc ml-5 space-y-2">
          <li>ผู้ใช้งานตกลงที่จะไม่พยายามแฮ็กระบบหรือกรอกข้อมูลเท็จ</li>
          <li>เนื้อหาในโมดูลการเงินเป็นการจำลองเพื่อการเรียนรู้ ไม่ใช่คำแนะนำทางการลงทุนจริง</li>
        </ul>
      </div>
    ),
    contact: (
      <div className="text-center py-6 space-y-6">
        <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-2 shadow-inner">
          <span className="material-symbols-outlined text-5xl">contact_support</span>
        </div>
        
        <div className="space-y-1">
          <p className="text-xl font-black text-slate-800">คุณครูอชิตพล บุณรัตน์</p>
          <p className="text-slate-500 text-sm font-bold">กลุ่มสาระการเรียนรู้คณิตศาสตร์ โรงเรียนวังโพรงพิทยาคม</p>
          <p className="text-slate-500 text-sm font-bold">สพม.พิษณุโลก อุตรดิตถ์</p>
        </div>

        <div className="grid grid-cols-1 gap-3 mt-6">
          {/* ช่องทาง Email */}
          <a 
            href="mailto:achittapon.boonrat@wppschool.ac.th" 
            className="flex items-center justify-center gap-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all text-slate-700 font-bold group"
          >
            <span className="material-symbols-outlined text-blue-600 group-hover:scale-110 transition-transform">mail</span>
            achittapon.boonrat@wppschool.ac.th
          </a>

          {/* ช่องทาง Facebook */}
          <a 
            href="https://www.facebook.com/KumEzio/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-slate-700 font-bold group"
          >
            <span className="material-symbols-outlined text-blue-600 group-hover:text-white group-hover:scale-110 transition-transform">share</span>
            Facebook: AC'Kum Achittapon
          </a>
        </div>
      </div>
    )
  };

  return (
    // ✅ เพิ่ม pt-12 (padding-top) เพื่อให้ห่างจากเนื้อหาด้านบนเล็กน้อย
    <footer className="p-8 md:px-12 pt-12 border-t border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* ✅ ปรับ: ฝั่งซ้าย - ชื่อแอปกับผู้พัฒนา อยู่คนละบรรทัด */}
        <div className="text-center md:text-left space-y-1">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            © 2026 The Financial Classroom
          </p>
          <p className="text-slate-600 text-sm font-black mt-1">
            สร้างสรรค์โดย ครูอชิตพล บุณรัตน์ <span className="text-blue-500">|</span> โรงเรียนวังโพรงพิทยาคม สพม.พล อต
          </p>
        </div>

        {/* ฝั่งขวา - ยอดผู้เข้าชม + เมนู */}
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          
          {/* ✅ ใหม่: กล่องแสดงยอดผู้เข้าชม (Visitor Counter) */}
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 shadow-inner">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Total Visitors</span>
              <div className="flex items-center gap-2">
                {/* ไฟกระพริบสีเขียว แสดงว่าระบบทำงานอยู่ */}
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xl font-black text-slate-800 tracking-tight">
                  {/* แสดงยอดวิวแบบใส่จุลภาค (1,000) */}
                  {totalViews.toLocaleString()}
                </span>
              </div>
            </div>
            {/* ไอคอนกราฟ monitoring */}
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-blue-600 text-2xl font-bold">monitoring</span>
            </div>
          </div>

          {/* ปุ่มเมนูข้อตกลงและติดต่อ */}
          <div className="flex gap-6 text-sm font-bold text-slate-500 border-l md:border-l-0 border-slate-200 pl-6 md:pl-0">
            <button onClick={() => setModalType('privacy')} className="hover:text-blue-600 transition-all">นโยบายความเป็นส่วนตัว</button>
            <button onClick={() => setModalType('terms')} className="hover:text-blue-600 transition-all">ข้อตกลงการใช้งาน</button>
            <button onClick={() => setModalType('contact')} className="hover:text-blue-600 transition-all border-l border-slate-200 pl-6">ติดต่อครู</button>
          </div>
        </div>
      </div>

      {/* เรียกใช้งาน Modal (คงเดิม) */}
      <InfoModal 
        isOpen={modalType !== null} 
        onClose={() => setModalType(null)}
        title={
          modalType === 'privacy' ? 'นโยบายความเป็นส่วนตัว' :
          modalType === 'terms' ? 'ข้อตกลงการใช้งาน' : 'ติดต่อผู้ดูแลระบบ'
        }
        content={infoContent[modalType]}
      />
    </footer>
  );
}