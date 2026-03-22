import React, { useState } from 'react';

export default function Settings({ user }) {
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await fetch("URL_SCRIPT_ของครู", {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
          action: "updateProfile",
          userId: user.id,
          newName: name,
          newPassword: password || undefined
        })
      });
      alert("อัปเดตข้อมูลสำเร็จ! (จะเห็นผลเมื่อล็อกอินใหม่)");
    } catch (e) { alert("เกิดข้อผิดพลาด"); }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
          <span className="material-symbols-outlined text-blue-600">manage_accounts</span>
          ตั้งค่าข้อมูลส่วนตัว
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">ชื่อ-นามสกุล</label>
            <input type="text" value={name} onChange={(e)=>setName(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold" />
          </div>
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">รหัสผ่านใหม่ (ปล่อยว่างถ้าไม่เปลี่ยน)</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="••••••••" />
          </div>
        </div>

        <button onClick={handleUpdate} disabled={loading} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 transition-all">
          {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
        </button>
      </div>
    </div>
  );
}