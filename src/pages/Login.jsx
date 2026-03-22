import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // States สำหรับเก็บข้อมูลฟอร์ม
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState('โรงเรียนวังโพรงพิทยาคม'); // ค่าเริ่มต้น
  const [inviteCode, setInviteCode] = useState(''); // รหัสลับสำหรับครู
  
  const [isAccepted, setIsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  // ⚠️ อย่าลืมใส่ URL ของคุณครูตรงนี้นะครับ
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAccepted) return alert('กรุณายอมรับนโยบาย PDPA ก่อนครับ');
    
    setLoading(true);

    try {
      if (isRegisterMode) {
        // --- โหมดลงทะเบียน (ส่งแบบ POST) ---
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({
            action: "register",
            userId: studentId,
            name: studentName,
            password: password,
            school: school,       // ✅ ส่งชื่อโรงเรียน
            inviteCode: inviteCode // ✅ ส่งรหัสเชิญครู
          })
        });
        
        // no-cors จะอ่าน response ตรงๆ ไม่ได้ เลยถือว่าส่งสำเร็จและให้เด้ง alert
        alert('ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบอีกครั้งครับ');
        setIsRegisterMode(false);
        setPassword(''); // ล้างรหัสผ่านเพื่อความปลอดภัย
        
      } else {
        // --- โหมด LOGIN (ส่งแบบ GET เพื่ออ่านผลลัพธ์) ---
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=login&userId=${studentId}&password=${password}`);
        const result = await response.json();

        if (result.status === "success") {
          // ✅ ส่งข้อมูลทั้งหมด (รวม school และ role) กลับไปที่ App.jsx
          onLogin({ 
            id: studentId, 
            name: result.name,
            school: result.school,
            role: result.role
          });
        } else {
          alert(result.message); // จะเด้งบอกว่า "รหัสผ่านไม่ถูกต้อง" 
        }
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่ครับ');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-200">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-white text-4xl mb-4 transition-all duration-500 ${isRegisterMode ? 'bg-green-500 shadow-green-200' : 'bg-blue-600 shadow-blue-200'} shadow-xl`}>
            <span className="material-symbols-outlined text-4xl">{isRegisterMode ? 'person_add' : 'lock'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">The Financial Classroom</h2>
          <p className="text-slate-400 font-bold text-xs uppercase mt-1 tracking-widest">
            {isRegisterMode ? 'สร้างบัญชีใหม่เพื่อเริ่มเรียน' : 'เข้าสู่ระบบเพื่อเรียนรู้ต่อ'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">รหัสประจำตัว / เบอร์โทร</label>
            <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all" placeholder="กรอก ID ของคุณ" required />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">รหัสผ่าน</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all" placeholder="••••••••" required />
          </div>

          {/* ฟิลด์เพิ่มเติมเฉพาะตอนลงทะเบียน */}
          {isRegisterMode && (
            <div className="space-y-4 animate-fadeIn border-t border-slate-100 pt-4 mt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">ชื่อ - นามสกุล</label>
                <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold transition-all" placeholder="เช่น เด็กชายสมชาย มั่งคั่ง" required />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">โรงเรียน / สถาบัน</label>
                <input type="text" value={school} onChange={(e) => setSchool(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold transition-all" required />
              </div>

              {/* ช่องลับสำหรับครู */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-indigo-400 uppercase ml-2 flex items-center gap-1 tracking-widest">
                  <span className="material-symbols-outlined text-[14px]">key</span> รหัสเชิญ (เฉพาะครู)
                </label>
                <input 
                  type="text" 
                  value={inviteCode} 
                  onChange={(e) => setInviteCode(e.target.value)} 
                  className="w-full px-5 py-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-700 text-sm placeholder:text-indigo-200 transition-all" 
                  placeholder="นักเรียนให้เว้นว่างไว้" 
                />
              </div>
            </div>
          )}

          {/* ข้อตกลง PDPA */}
          <div className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors mt-2 ${isAccepted ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
            <input type="checkbox" checked={isAccepted} onChange={(e) => setIsAccepted(e.target.checked)} className="mt-1 w-5 h-5 text-blue-600 rounded cursor-pointer" />
            <label className="text-[10px] text-slate-500 font-bold leading-relaxed cursor-pointer" onClick={() => setIsAccepted(!isAccepted)}>
              ยินยอมให้ระบบจัดเก็บข้อมูลส่วนบุคคล (PDPA) เพื่อใช้ในการบันทึกคะแนน วิเคราะห์ผลการเรียน และออกเกียรติบัตร
            </label>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-5 text-white font-black rounded-2xl shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 ${loading ? 'bg-slate-400 cursor-not-allowed' : (isRegisterMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700')}`}>
            {loading && <span className="material-symbols-outlined animate-spin text-xl">sync</span>}
            {loading ? 'กำลังประมวลผล...' : (isRegisterMode ? 'ยืนยันลงทะเบียน' : 'เข้าสู่ห้องเรียน')}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">หรือ</p>
          <button 
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setPassword(''); // ล้างรหัสผ่านทุกครั้งที่สลับหน้า
            }} 
            className="w-full py-4 text-sm font-black text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all border border-slate-200 active:scale-95"
          >
            {isRegisterMode ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? ลงทะเบียนฟรี'}
          </button>
        </div>
      </div>
    </div>
  );
}