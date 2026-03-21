import React, { useState } from 'react';

export default function Login({ onLogin }) {
  // 1. สร้าง State สำหรับควบคุมโหมด (true = ลงทะเบียน, false = เข้าสู่ระบบ)
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);

  // ⚠️ แก้ไข: วาง URL ของ Google Apps Script ของคุณครูที่นี่
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId) return alert('กรุณากรอกรหัสประจำตัว');
    if (isRegisterMode && !studentName) return alert('กรุณากรอกชื่อ-นามสกุลเพื่อลงทะเบียน');

    setLoading(true);
    
    // กำหนด Action ตามโหมดที่เลือก
    const actionType = isRegisterMode ? "register" : "login";

    try {
      // ส่งข้อมูลไปที่ Google Sheets
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // ใช้ no-cors สำหรับ Google Script
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          userId: studentId,
          name: studentName
        })
      });

      // หมายเหตุ: เนื่องจากโหมด no-cors เราจะอ่านค่า Response จาก Google ตรงๆ ไม่ได้
      // เราจะใช้วิธี "อนุญาตให้เข้าระบบ" ไปเลย และให้ Google ไปจัดการบันทึก/เช็กหลังบ้าน
      alert(isRegisterMode ? 'ลงทะเบียนเรียบร้อยแล้ว!' : 'ยินดีต้อนรับเข้าสู่ระบบ');
      
      onLogin({ 
        id: studentId, 
        name: studentName || "ผู้ใช้งานทั่วไป" 
      });

    } catch (error) {
      console.error('Error:', error);
      alert('การเชื่อมต่อผิดพลาด แต่คุณสามารถลองเข้าใช้งานได้');
      // เข้าใช้งานแบบ Offline/Guest กรณีเน็ตมีปัญหา
      onLogin({ id: studentId, name: studentName || "Guest" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-md border border-slate-200 relative overflow-hidden">
        
        {/* ตกแต่งพื้นหลัง */}
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 transition-colors duration-500 ${isRegisterMode ? 'bg-green-500/20' : 'bg-blue-600/20'}`}></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg mb-4 mx-auto transition-colors duration-500 ${isRegisterMode ? 'bg-green-600' : 'bg-blue-600'}`}>
              <span className="material-symbols-outlined text-4xl">
                {isRegisterMode ? 'person_add' : 'account_balance'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800">The Financial Classroom</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              {isRegisterMode ? 'สร้างบัญชีใหม่สำหรับประชาชน' : 'เข้าสู่ห้องเรียนคณิตศาสตร์การเงิน'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">รหัสประจำตัว / เบอร์โทรศัพท์</label>
              <div className="relative mt-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined">badge</span>
                <input 
                  type="text" 
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  placeholder="เช่น 0812345678"
                  required
                />
              </div>
            </div>

            {/* แสดงช่องกรอกชื่อเฉพาะตอนเลือก "ลงทะเบียน" */}
            {isRegisterMode && (
              <div className="animate-fadeIn">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">ชื่อ - นามสกุล</label>
                <div className="relative mt-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined">person</span>
                  <input 
                    type="text" 
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium"
                    placeholder="นายอชิตพล บุณรัตน์"
                    required
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 mt-6 ${
                loading ? 'bg-slate-400' : (isRegisterMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700')
              }`}
            >
              {loading ? 'กำลังประมวลผล...' : (isRegisterMode ? 'ลงทะเบียนและเข้าใช้งาน' : 'เข้าสู่ห้องเรียน')}
              {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
            </button>
          </form>

          {/* ปุ่มสลับโหมด */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm">
            <p className="text-slate-400 font-medium">
              {isRegisterMode ? 'มีบัญชีสมาชิกอยู่แล้วใช่ไหม?' : 'คุณยังไม่มีบัญชีสมาชิกใช่หรือไม่?'} 
              <button 
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className={`ml-2 font-bold hover:underline ${isRegisterMode ? 'text-green-600' : 'text-blue-600'}`}
              >
                {isRegisterMode ? 'เข้าสู่ระบบที่นี่' : 'ลงทะเบียนฟรีที่นี่'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}