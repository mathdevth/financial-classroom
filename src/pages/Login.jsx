import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [password, setPassword] = useState('');
  const [isAccepted, setIsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAccepted) return alert('กรุณายอมรับนโยบาย PDPA ก่อนครับ');
    
    setLoading(true);

    try {
      if (isRegisterMode) {
        // --- โหมดลงทะเบียน (ส่งแบบ POST) ---
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({
            action: "register",
            userId: studentId,
            name: studentName,
            password: password
          })
        });
        alert('ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบอีกครั้งครับ');
        setIsRegisterMode(false);
      } else {
        // --- โหมด LOGIN (ส่งแบบ GET เพื่ออ่านผลลัพธ์) ---
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=login&userId=${studentId}&password=${password}`);
        const result = await response.json();

        if (result.status === "success") {
          onLogin({ id: studentId, name: result.name });
        } else {
          alert(result.message); // จะเด้งบอกว่า "รหัสผ่านไม่ถูกต้อง" หรือ "ไม่พบชื่อ"
        }
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่ครับ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-white text-4xl mb-4 transition-all ${isRegisterMode ? 'bg-green-500 shadow-green-200' : 'bg-blue-600 shadow-blue-200'} shadow-lg`}>
            <span className="material-symbols-outlined text-4xl">{isRegisterMode ? 'person_add' : 'lock'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">The Financial Classroom</h2>
          <p className="text-slate-400 font-bold text-xs uppercase mt-1">
            {isRegisterMode ? 'สร้างบัญชีใหม่เพื่อเริ่มเรียน' : 'เข้าสู่ระบบเพื่อเรียนรู้ต่อ'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">รหัสประจำตัว / เบอร์โทร</label>
            <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" placeholder="กรอก ID ของคุณ" required />
          </div>

          {isRegisterMode && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">ชื่อ - นามสกุล</label>
              <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold" placeholder="นายสมชาย มั่งคั่ง" required />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">รหัสผ่าน</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" placeholder="••••••••" required />
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <input type="checkbox" checked={isAccepted} onChange={(e) => setIsAccepted(e.target.checked)} className="mt-1 w-4 h-4 text-blue-600 rounded" />
            <label className="text-[10px] text-slate-500 font-bold leading-tight">
              ยินยอมให้ระบบจัดเก็บข้อมูลส่วนบุคคล (PDPA) เพื่อใช้ในการบันทึกคะแนนและวิเคราะห์ผลการเรียน
            </label>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-5 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 ${loading ? 'bg-slate-400' : (isRegisterMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700')}`}>
            {loading ? 'กำลังตรวจสอบ...' : (isRegisterMode ? 'ยืนยันลงทะเบียน' : 'เข้าสู่ห้องเรียน')}
          </button>
        </form>

        <button onClick={() => setIsRegisterMode(!isRegisterMode)} className="w-full mt-6 text-sm font-black text-blue-600 hover:underline">
          {isRegisterMode ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่' : 'ยังไม่มีบัญชีสมาชิก? ลงทะเบียนฟรี'}
        </button>
      </div>
    </div>
  );
}