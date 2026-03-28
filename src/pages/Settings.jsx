import React, { useState } from 'react';

export default function Settings({ user }) {
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await fetch("https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec", {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
          action: "updateProfile",
          userId: user.id,
          newName: name,
          newPassword: password || undefined
        })
      });
      alert("อัปเดตข้อมูลสำเร็จ! (จะเห็นผลเมื่อล็อกอินใหม่ครั้งถัดไปครับ)");
    } catch (e) { alert("เกิดข้อผิดพลาดในการเชื่อมต่อ"); }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 md:p-10 font-sans animate-fadeIn relative overflow-hidden">
      
      {/* 🔮 Background Decor (ละมุนสไตล์ Snowy Glass) */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/40 rounded-full blur-[100px] -mr-40 -mt-40"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-100/40 rounded-full blur-[100px] -ml-40 -mb-40"></div>

      {/* 🏰 Settings Card */}
      <div className="relative z-10 w-full max-w-xl bg-white/70 backdrop-blur-2xl p-10 md:p-14 rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-white space-y-10">
        
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-500/20 mb-6 group hover:rotate-6 transition-transform">
            <span className="material-symbols-outlined text-4xl">manage_accounts</span>
          </div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight pb-2 pr-4 leading-tight">
            ตั้งค่าบัญชีผู้ใช้
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">
            Account Preferences
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">ชื่อ-นามสกุล ของคุณ</label>
            <div className="relative flex items-center group">
              <div className="absolute left-5 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                <span className="material-symbols-outlined">person</span>
              </div>
              <input 
                type="text" 
                value={name} 
                onChange={(e)=>setName(e.target.value)} 
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-200 outline-none font-black text-slate-700 text-lg transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">รหัสผ่านใหม่ (ปล่อยว่างถ้าไม่เปลี่ยน)</label>
            <div className="relative flex items-center group">
              <div className="absolute left-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                <span className="material-symbols-outlined">lock_reset</span>
              </div>
              <input 
                type="password" 
                value={password} 
                onChange={(e)=>setPassword(e.target.value)} 
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-200 outline-none font-black text-slate-700 text-lg transition-all shadow-inner placeholder:text-slate-200" 
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-6 pt-4">
          <button 
            onClick={handleUpdate} 
            disabled={loading} 
            className={`w-full py-5 font-black rounded-3xl shadow-xl transition-all flex items-center justify-center gap-3 text-xl active:scale-95 group
              ${loading 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 text-white hover:bg-blue-600 hover:shadow-blue-500/20'
              }`}
          >
            <span className={`material-symbols-outlined ${loading ? 'animate-spin' : 'group-hover:translate-x-1 transition-transform'}`}>
              {loading ? 'sync' : 'auto_awesome'}
            </span>
            {loading ? 'กำลังบันทึกข้อมูล...' : 'บันทึกการเปลี่ยนแปลง'}
          </button>

          <div className="flex items-center gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
             <span className="material-symbols-outlined text-blue-500 text-sm">info</span>
             <p className="text-[11px] font-bold text-blue-600/80 leading-relaxed italic">
               หมายเหตุ: ข้อมูลที่เปลี่ยนแปลงจะแสดงผลอย่างสมบูรณ์เมื่อคุณทำการเข้าสู่ระบบใหม่อีกครั้งครับ
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}