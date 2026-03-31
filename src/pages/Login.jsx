import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState('โรงเรียนวังโพรงพิทยาคม');
  const [inviteCode, setInviteCode] = useState('');
  
  // ✅ คำนวณปีพุทธศักราชปัจจุบันอัตโนมัติ
  const currentThaiYear = (new Date().getFullYear() + 543).toString();

  // ✅ State สำหรับข้อมูลสถานะทางการศึกษา (Default ตามปีปัจจุบัน)
  const [year, setYear] = useState(currentThaiYear);
  const [semester, setSemester] = useState('1');
  const [grade, setGrade] = useState('ม.1');
  const [room, setRoom] = useState('');
  const [number, setNumber] = useState('');
  
  const [isAccepted, setIsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  // ตรวจสอบว่าเป็นครูหรือไม่ (ดูจากรหัสเชิญ)
  const isTeacher = inviteCode === "TEACHER-999";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAccepted) return alert('กรุณายอมรับนโยบาย PDPA ก่อนครับ');
    setLoading(true);
    try {
      if (isRegisterMode) {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({
            action: "register",
            id: studentId,
            name: studentName,
            password: password,
            school: school,
            inviteCode: inviteCode,
            // ถ้าเป็นครู ส่งค่าว่างไป ถ้าเป็นนักเรียนส่งค่าจริง
            year: isTeacher ? "" : year,
            semester: isTeacher ? "" : semester,
            grade: isTeacher ? "" : grade,
            room: isTeacher ? "" : room,
            number: isTeacher ? "" : number
          })
        });
        alert('ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบอีกครั้งครับ');
        setIsRegisterMode(false);
        setPassword('');
      } else {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=login&userId=${studentId}&password=${password}`);
        const result = await response.json();
        if (result.status === "success") {
          onLogin(result); // เข้าสู่ระบบพร้อมข้อมูล Role, Year, Semester, etc.
        } else {
          alert(result.message || 'ID หรือรหัสผ่านไม่ถูกต้อง');
        }
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่ครับ');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ เปลี่ยนเป็น flex-col และเพิ่ม py-10 เพื่อให้มีพื้นที่รองรับกล่อง Credits ด้านล่าง
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-50 overflow-x-hidden overflow-y-auto p-4 py-10 md:p-6 font-sans">
      
      {/* ☁️ Background Decor */}
      <div aria-hidden className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden fixed">
        <div className="absolute -top-32 -left-32 w-[40rem] h-[40rem] bg-blue-100/50 rounded-full blur-[120px] animate-blob1" />
        <div className="absolute top-1/2 left-1/2 w-[35rem] h-[35rem] bg-cyan-50/60 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-blob2" />
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-emerald-50/50 rounded-full blur-[120px] animate-blob3" />
      </div>

      {/* 🏰 Snowy Glass Card */}
      <div className="relative z-10 w-full max-w-md mx-auto rounded-[3.5rem] border border-white bg-white/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] px-6 py-10 md:px-12 md:py-14 flex flex-col items-center transition-all duration-500">
        
        {/* Header Section */}
        <div className="text-center mb-10 select-none w-full">
          <div className={`w-20 h-20 mx-auto rounded-[2rem] flex items-center justify-center text-white text-4xl mb-6 transition-all duration-500 shadow-lg ${isRegisterMode ? (isTeacher ? 'bg-indigo-600' : 'bg-gradient-to-br from-emerald-400 to-cyan-500') : 'bg-gradient-to-br from-blue-600 to-indigo-700'}`}>
            <span className="material-symbols-outlined text-4xl">{isRegisterMode ? (isTeacher ? 'admin_panel_settings' : 'person_add') : 'fingerprint'}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-800 pb-1 leading-tight">
            {isTeacher && isRegisterMode ? 'Teacher Portal' : 'Financial Class'}
          </h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase mt-2 tracking-[0.3em]">
            {isRegisterMode ? (isTeacher ? 'บัญชีผู้ดูแลระบบ' : 'Create Student Account') : 'Welcome to Classroom'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">รหัสประจำตัว / เบอร์โทร</label>
            <div className="relative flex items-center group">
               <span className="material-symbols-outlined absolute left-4 text-slate-300 group-focus-within:text-blue-500 transition-colors">person</span>
               <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none font-bold text-slate-700 placeholder:text-slate-300 transition-all shadow-inner" placeholder="กรอก ID ของคุณ" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">รหัสผ่าน</label>
            <div className="relative flex items-center group">
               <span className="material-symbols-outlined absolute left-4 text-slate-300 group-focus-within:text-blue-500 transition-colors">lock</span>
               <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none font-bold text-slate-700 placeholder:text-slate-300 transition-all shadow-inner" placeholder="••••••••" required />
            </div>
          </div>

          {/* Registration Fields */}
          {isRegisterMode && (
            <div className="space-y-4 animate-fadeIn border-t border-slate-50 pt-6 mt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">ชื่อ - นามสกุล</label>
                  <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-slate-700 transition-all" placeholder="ชื่อ-นามสกุล" required />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-cyan-500 uppercase ml-2 tracking-widest flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">key</span> รหัสเชิญครู (ถ้ามี)
                  </label>
                  <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} className="w-full px-6 py-3 bg-cyan-50/50 border border-cyan-100 rounded-2xl focus:ring-4 focus:ring-cyan-500/10 outline-none font-bold text-cyan-800 transition-all" placeholder="เว้นว่างไว้สำหรับนักเรียน" />
                </div>

                {!isTeacher && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">ปีการศึกษา</label>
                        <input 
                          type="text" 
                          value={year} 
                          onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                          placeholder={currentThaiYear}
                          maxLength={4}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">ภาคเรียน</label>
                        <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-inner">
                          <option value="1">1</option>
                          <option value="2">2</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">ระดับชั้น</label>
                        <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-inner">
                          {['ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'].map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">ห้อง</label>
                        <input type="text" value={room} onChange={(e) => setRoom(e.target.value.replace(/[^0-9]/g, ''))} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" placeholder="1" required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">เลขที่</label>
                        <input type="text" value={number} onChange={(e) => setNumber(e.target.value.replace(/[^0-9]/g, ''))} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" placeholder="15" required />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">โรงเรียน / สถาบัน</label>
                  <input type="text" value={school} onChange={(e) => setSchool(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-slate-700 transition-all shadow-inner" required />
                </div>
            </div>
          )}

          {/* PDPA Agreement */}
          <div className={`flex items-start gap-3 p-4 rounded-2xl border transition-all mt-2 ${isAccepted ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
            <input type="checkbox" id="pdpa" checked={isAccepted} onChange={(e) => setIsAccepted(e.target.checked)} className="mt-1 w-5 h-5 text-blue-600 rounded-lg cursor-pointer accent-blue-600" />
            <label htmlFor="pdpa" className="text-[11px] text-slate-500 font-bold leading-relaxed cursor-pointer select-none">
              ยินยอมให้นำข้อมูลไปใช้เพื่อบันทึกคะแนนและออกเกียรติบัตร (PDPA)
            </label>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-5 text-white font-black rounded-3xl shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 text-lg bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-blue-200/50 ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]'}`}>
            {loading ? <span className="material-symbols-outlined animate-spin">sync</span> : (isRegisterMode ? 'ยืนยันลงทะเบียน' : 'เข้าสู่ห้องเรียน')}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6 w-full">
          <button 
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setInviteCode('');
              setPassword('');
            }} 
            className="w-full py-2 text-xs font-black text-slate-400 hover:text-slate-800 transition-all uppercase tracking-widest"
          >
            {isRegisterMode ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? ลงทะเบียนฟรีที่นี่'}
          </button>
        </div>
      </div>

      {/* 🎓 Developer Credits Section (วางใต้กล่อง Login อย่างสวยงาม) */}
      <div className="relative z-10 mt-8 w-full max-w-md bg-white/50 backdrop-blur-xl border border-white/80 rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn">
        <div className="flex flex-col gap-3">
          {/* ครูอชิตพล */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">draw</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">สร้างสรรค์โดย</p>
              <p className="text-sm font-black text-slate-700 leading-tight">ครูอชิตพล บุณรัตน์ <span className="text-[10px] font-bold text-slate-400 ml-1">(ร.ร.วังโพรงพิทยาคม)</span></p>
            </div>
          </div>
          
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

          {/* ครูปฐมาภรณ์ */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">school</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">ร่วมพัฒนาโดย</p>
              <p className="text-sm font-black text-slate-700 leading-tight">น.ส.ปฐมาภรณ์ อวชัย</p>
              <p className="text-[9px] font-bold text-emerald-600 tracking-wide mt-0.5 leading-tight">ผู้ชำนาญ สาขาคณิตศาสตร์มัธยมศึกษา สสวท.</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(-20px, 40px) scale(1.1);} }
        @keyframes blob2 { 0%,100%{transform:translate(-50%,-50%) scale(1.1);} 50%{transform:translate(-52%, -48%) scale(1);} }
        @keyframes blob3 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(30px, -20px) scale(1.05);} }
        .animate-blob1 { animation: blob1 15s ease-in-out infinite alternate; }
        .animate-blob2 { animation: blob2 18s ease-in-out infinite alternate; }
        .animate-blob3 { animation: blob3 12s ease-in-out infinite alternate; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}