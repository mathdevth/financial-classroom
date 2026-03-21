import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [password, setPassword] = useState('');
  const [isAccepted, setIsAccepted] = useState(false); // สำหรับ PDPA
  const [loading, setLoading] = useState(false);

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAccepted) return alert('กรุณายอมรับนโยบายความเป็นส่วนตัวและ PDPA ก่อนเข้าใช้งานครับ');
    if (!password) return alert('กรุณากำหนดรหัสผ่าน');

    setLoading(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          action: isRegisterMode ? "register" : "login",
          userId: studentId,
          name: studentName,
          password: password // ส่งรหัสผ่านไปด้วย
        })
      });

      alert(isRegisterMode ? 'ลงทะเบียนสำเร็จ!' : 'เข้าสู่ระบบสำเร็จ');
      onLogin({ id: studentId, name: studentName || "ผู้ใช้งาน" });
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-200">
        <h1 className="text-2xl font-black text-center mb-6 text-slate-800">The Financial Classroom</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" placeholder="รหัสประจำตัว / เบอร์โทร"
            value={studentId} onChange={(e) => setStudentId(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          
          {isRegisterMode && (
            <input 
              type="text" placeholder="ชื่อ - นามสกุล"
              value={studentName} onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          )}

          <input 
            type="password" placeholder="รหัสผ่าน"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* Checkbox PDPA */}
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <input 
              type="checkbox" 
              checked={isAccepted} 
              onChange={(e) => setIsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-[11px] text-slate-500 leading-tight">
              ข้าพเจ้ายอมรับ <strong>นโยบายความเป็นส่วนตัว</strong> และยินยอมให้ระบบจัดเก็บข้อมูลชื่อและคะแนนตาม <strong>พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)</strong> และ <strong>พ.ร.บ. คอมพิวเตอร์</strong> เพื่อใช้ประโยชน์ทางการศึกษาเท่านั้น
            </label>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all">
            {loading ? 'กำลังประมวลผล...' : (isRegisterMode ? 'ลงทะเบียนใหม่' : 'เข้าสู่ห้องเรียน')}
          </button>
        </form>

        <button onClick={() => setIsRegisterMode(!isRegisterMode)} className="w-full mt-6 text-sm font-bold text-blue-600 hover:underline">
          {isRegisterMode ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? ลงทะเบียนฟรีที่นี่'}
        </button>
      </div>
    </div>
  );
}