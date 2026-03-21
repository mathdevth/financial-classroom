import React from 'react';

export default function Dashboard() {
  const studentName = "อชิตพล";
  const overallProgress = 68;

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-12 bg-slate-50 min-h-screen">
      
      {/* Dashboard Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-extrabold text-blue-900 tracking-tight">ภาพรวมการเรียนรู้</h2>
          <p className="text-slate-600 font-medium text-lg">ยินดีต้อนรับกลับมาครับ ครู{studentName}! คุณกำลังทำผลงานได้ยอดเยี่ยมในสัปดาห์นี้</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors shadow-sm active:scale-95">
            <span className="material-symbols-outlined text-xl">sync</span>
            <span>ซิงค์ข้อมูล</span>
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md active:scale-95">
            <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
            <span>โหลดสรุป PDF</span>
          </button>
        </div>
      </section>

      {/* Learning Progress Banner */}
      <section className="bg-white rounded-2xl p-8 flex flex-col md:flex-row items-center gap-10 shadow-sm border border-slate-200">
        <div className="flex-grow space-y-4 w-full">
          <div className="flex justify-between items-end">
            <h3 className="text-xl font-bold text-slate-800">ความคืบหน้าการเรียนรู้โดยรวม</h3>
            <span className="text-4xl font-black text-blue-600">{overallProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-1000"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-slate-500 font-medium">คุณทำภารกิจสำเร็จไปแล้ว 3 จาก 5 โมดูลหลัก สู้ต่อไป!</p>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 w-full md:w-auto shrink-0">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">สถานะระบบ</div>
            <div className="text-sm font-bold text-slate-700">เชื่อมต่อ Google Sheets แล้ว</div>
          </div>
        </div>
      </section>

      {/* Module Status Bento Grid */}
      <section>
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">view_module</span> 
          สถานะรายโมดูล
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                <span className="material-symbols-outlined text-2xl">security</span>
              </div>
              <span className="text-[10px] font-bold text-green-700 px-2 py-1 bg-green-100 rounded uppercase tracking-wider">สำเร็จ</span>
            </div>
            <h4 className="font-bold text-lg mb-2 text-slate-800">1. รู้เท่าทันภัย</h4>
            <p className="text-xs text-slate-500 mb-6 flex-grow leading-relaxed">ป้องกันตัวจากการฉ้อโกงและภัยไซเบอร์</p>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 pt-4 border-t border-slate-100">
              <span>คะแนน: 5/5</span>
              <span className="text-green-600">100%</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <span className="material-symbols-outlined text-2xl">receipt_long</span>
              </div>
              <span className="text-[10px] font-bold text-green-700 px-2 py-1 bg-green-100 rounded uppercase tracking-wider">สำเร็จ</span>
            </div>
            <h4 className="font-bold text-lg mb-2 text-slate-800">2. คำนวณภาษี</h4>
            <p className="text-xs text-slate-500 mb-6 flex-grow leading-relaxed">วางแผนภาษีและใช้สิทธิลดหย่อน</p>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 pt-4 border-t border-slate-100">
              <span>ประหยัดภาษี: 12k</span>
              <span className="text-green-600">100%</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                <span className="material-symbols-outlined text-2xl">calculate</span>
              </div>
              <span className="text-[10px] font-bold text-blue-700 px-2 py-1 bg-blue-100 rounded uppercase tracking-wider animate-pulse">กำลังเรียน</span>
            </div>
            <h4 className="font-bold text-lg mb-2 text-slate-800">3. เครื่องคิดเลข TVM</h4>
            <p className="text-xs text-slate-500 mb-6 flex-grow leading-relaxed">พลังของดอกเบี้ยทบต้นและมูลค่าเงิน</p>
            <div className="pt-4 border-t border-slate-100">
              <div className="w-full bg-slate-100 h-1.5 rounded-full mb-1">
                <div className="bg-blue-500 h-full w-[40%] rounded-full"></div>
              </div>
              <span className="text-[10px] font-bold text-slate-400">40% Complete</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col h-full opacity-70 grayscale-[30%]">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                <span className="material-symbols-outlined text-2xl">elderly</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 px-2 py-1 bg-slate-100 rounded uppercase tracking-wider">ยังไม่เริ่ม</span>
            </div>
            <h4 className="font-bold text-lg mb-2 text-slate-800">4. แผนเกษียณ</h4>
            <p className="text-xs text-slate-500 mb-6 flex-grow leading-relaxed">เตรียมความพร้อมสู่วัยเกษียณ</p>
            <button className="w-full py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors mt-auto">
              เริ่มบทเรียน
            </button>
          </div>

          {/* Card 5 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col h-full opacity-70 grayscale-[30%]">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                <span className="material-symbols-outlined text-2xl">emoji_events</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 px-2 py-1 bg-slate-100 rounded uppercase tracking-wider">ยังไม่เริ่ม</span>
            </div>
            <h4 className="font-bold text-lg mb-2 text-slate-800">5. แผนตลอดชีพ</h4>
            <p className="text-xs text-slate-500 mb-6 flex-grow leading-relaxed">กระแสเงินสดจำลอง (Capstone)</p>
            <button className="w-full py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors mt-auto">
              ถูกล็อกไว้
            </button>
          </div>

        </div>
      </section>

      {/* Bottom Section: AI Insight & Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 bg-slate-900 text-white p-8 lg:p-10 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-lg">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-400 text-3xl">psychology</span>
              </div>
              <h3 className="text-2xl font-bold">AI Intelligence Insight</h3>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
              จากการวิเคราะห์พฤติกรรมการเรียนของคุณ แนะนำให้ทดลองใช้ <span className="text-blue-400 font-bold underline underline-offset-4">เครื่องคิดเลข TVM</span> เพิ่มเติม โดยลองปรับ "จำนวนครั้งที่ทบต้นต่อปี" เป็นรายเดือน เพื่อดูความแตกต่างของผลลัพธ์ที่ชัดเจนขึ้น
            </p>
            <button className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all active:scale-95 shadow-md flex items-center gap-2 w-fit">
              ไปที่โมดูล 3 ทันที <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[80px]"></div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-lg mb-6 border-b pb-4">กิจกรรมล่าสุดของคุณ</h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div className="w-0.5 h-full bg-slate-100 my-1"></div>
                </div>
                <div className="pb-4">
                  <div className="text-xs text-slate-400 font-bold uppercase mb-1">วันนี้, 09:45 น.</div>
                  <div className="text-sm font-bold text-slate-700">จำลองการคำนวณภาษีเสร็จสิ้น</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="w-0.5 h-full bg-slate-100 my-1"></div>
                </div>
                <div className="pb-4">
                  <div className="text-xs text-slate-400 font-bold uppercase mb-1">เมื่อวานนี้</div>
                  <div className="text-sm font-bold text-slate-700">ทำแบบทดสอบ "รู้เท่าทันภัย"</div>
                </div>
              </div>
            </div>
          </div>
          <button className="mt-8 w-full py-3 bg-slate-50 text-slate-600 font-bold rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 text-sm">
            ดูประวัติทั้งหมด
          </button>
        </div>

      </section>
    </div>
  );
}