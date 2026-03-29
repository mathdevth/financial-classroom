import React, { useState, useEffect, useCallback } from 'react';
import HistoryModal from '../components/HistoryModal';

const scamScenarios = [
  { id: 1, text: "เพจ 'รวยด้วยคริปโต' ทักมาบอกว่าคุณคือผู้โชคดี ลงทุนเพียง 1,000 บาท รับกำไร 5,000 บาทใน 1 ชั่วโมง ไม่มีความเสี่ยง", isScam: true, law: "พ.ร.บ.คอมพิวเตอร์ฯ มาตรา 14 (1) และ พ.ร.ก.การกู้ยืมเงินที่เป็นการฉ้อโกงประชาชน", explanation: "การันตีผลตอบแทนสูงเกินจริงในเวลาอันสั้นและ 'ไม่มีความเสี่ยง' คือสัญญาณชัดเจนของแชร์ลูกโซ่หรือการหลอกลงทุน" },
  { id: 2, text: "ชาวต่างชาติโปรไฟล์นักธุรกิจทักแชทมาจีบ บอกว่าส่งกระเป๋าแบรนด์เนมมาให้ แต่ติดศุลกากร ต้องโอนเงินค่าธรรมเนียม 2 หมื่นบาท", isScam: true, law: "พ.ร.บ.คอมพิวเตอร์ฯ มาตรา 14 (1) และความผิดฐานฉ้อโกง", explanation: "Romance Scam: มิจฉาชีพจะสร้างความเชื่อใจแล้วอ้างเหตุผลต่างๆ ให้เราโอนเงินค่าธรรมเนียมที่ไม่มีจริงให้" },
  { id: 3, text: "มี SMS จาก 'ธนาคารสีม่วง' แจ้งว่าบัญชีของคุณมีปัญหา ให้คลิกลิงก์ www.scb-verify-secure.com เพื่อยืนยันตัวตน", isScam: true, law: "พ.ร.บ.คอมพิวเตอร์ฯ มาตรา 14 (1) ฐานพยายามดักรับข้อมูล (Phishing)", explanation: "ธนาคารยกเลิกการส่ง SMS แนบลิงก์ทุกกรณี และลิงก์ปลอมมักใช้ชื่อที่คล้ายของจริงแต่สะกดผิดหรือมีขีดกลาง" },
  { id: 4, text: "ซื้อของจากร้าน Mall ใน Shopee ที่มีสัญลักษณ์ 'ร้านค้าทางการ' และชำระเงินผ่านระบบของแอปพลิเคชันเท่านั้น", isScam: false, law: "ธุรกรรมปลอดภัย", explanation: "การซื้อผ่านแพลตฟอร์มที่มีระบบการันตี (Escrow) จะช่วยคุ้มครองเงินเราจนกว่าจะได้รับของ" },
  { id: 5, text: "เบอร์นิรนามโทรมาอ้างเป็น 'ตำรวจ สภ.เมือง' บอกว่าคุณมีส่วนเกี่ยวข้องกับคดีฟอกเงิน ต้องโอนเงินในบัญชีมาตรวจสอบ", isScam: true, law: "ความผิดฐานฉ้อโกงประชาชน และแสดงตนเป็นเจ้าพนักงาน", explanation: "ตำรวจหรือเจ้าหน้าที่รัฐไม่มีนโยบายโทรให้ประชาชนโอนเงินมา 'ตรวจสอบ' หากมีคดีจริงจะต้องมีหมายเรียกส่งไปที่บ้าน" },
  { id: 6, text: "โฆษณาใน Facebook รับสมัครงาน 'กดไลก์สินค้า' หรือ 'รับออเดอร์' รายได้วันละ 500-2,000 บาท ทำงานผ่านมือถือ", isScam: true, law: "พ.ร.บ.คอมพิวเตอร์ฯ มาตรา 14 (1)", explanation: "หลอกทำงานออนไลน์: เริ่มแรกจะให้เงินจริงหลักสิบ แต่ต่อมาจะอ้างว่าต้อง 'สำรองเงิน' หรือ 'เติมเครดิต' ถึงจะถอนเงินได้" },
  { id: 7, text: "แอปพลิเคชัน 'เงินกู้ทันใจ' ให้กู้เงิน 5,000 บาท โดยขอกดเข้าถึงรายชื่อติดต่อในมือถือ และให้โอนค่าค้ำประกันก่อน 500 บาท", isScam: true, law: "พ.ร.บ.ห้ามเรียกดอกเบี้ยเกินอัตรา และ พ.ร.บ.คอมพิวเตอร์ฯ", explanation: "แอปเงินกู้เถื่อนมักเรียกค่าธรรมเนียมก่อนกู้ และจะเข้าถึงรายชื่อเพื่อโทรข่มขู่ประจานหากจ่ายช้า" },
  { id: 8, text: "เจ้าหน้าที่จากการไฟฟ้าโทรมาบอกว่าคุณชำระค่าไฟเกิน จะคืนเงินให้ 500 บาท โดยให้แอดไลน์และติดตั้งแอป 'PEA Smart'", isScam: true, law: "พ.ร.บ.คอมพิวเตอร์ฯ มาตรา 14 (1) ฐานติดตั้งแอปควบคุมมือถือ (Remote Access)", explanation: "การหลอกให้ติดตั้งแอปเพื่อคืนเงิน คือวิธีที่มิจฉาชีพใช้เพื่อควบคุมมือถือและโอนเงินออกจากแอปธนาคาร" },
  { id: 9, text: "เข้าเว็บไซต์กระทรวงการคลังที่ลงท้ายด้วย .go.th เพื่อเช็กสิทธิสวัสดิการแห่งรัฐด้วยตนเอง", isScam: false, law: "เว็บไซต์หน่วยงานรัฐที่ถูกต้อง", explanation: "เว็บไซต์หน่วยงานรัฐไทยจะลงท้ายด้วย .go.th เเสมอ ควรตรวจสอบผ่านเบราว์เซอร์ด้วยการพิมพ์เอง" },
  { id: 10, text: "ได้รับพัสดุเก็บเงินปลายทาง 300 บาท ทั้งที่ไม่ได้สั่ง แต่คนส่งบอกว่าอาจจะเป็นของกำนัลหรือญาติส่งมาให้", isScam: true, law: "ความผิดฐานฉ้อโกง", explanation: "การส่งพัสดุเก็บเงินปลายทางโดยที่ไม่ได้สั่ง (Brushing Scam) เป็นวิธีหากินของมิจฉาชีพที่เน้นเหยื่อที่จำไม่ได้ว่าสั่งอะไรไปบ้าง" },
  { id: 11, text: "ได้รับ SMS จากกรมที่ดิน แจ้งให้อัปเดตข้อมูลที่ดินผ่านลิงก์ เพื่อเลี่ยงภาษีที่ดินและสิ่งปลูกสร้าง", isScam: true, law: "พ.ร.บ.คอมพิวเตอร์ฯ มาตรา 14 (1)", explanation: "กรมที่ดินไม่มีนโยบายทักหาประชาชนผ่าน SMS หรือแอปเพื่อให้อัปเดตข้อมูลที่ดินออนไลน์ในลักษณะนี้" },
  { id: 12, text: "เปิดบัญชีเงินฝากประจำแบบดิจิทัลผ่านแอปพลิเคชันอย่างเป็นทางการของธนาคารที่มีการยืนยันตัวตนด้วย NDID", isScam: false, law: "ธุรกรรมธนาคารปกติ", explanation: "การทำธุรกรรมผ่านแอปทางการที่มีการยืนยันตัวตนเข้มงวด ถือเป็นเรื่องปกติและปลอดภัย" },
  { id: 13, text: "มีผู้หวังดีทักมาใน Facebook แจ้งว่าบัญชีของคุณกำลังจะถูกลบ ให้คลิกลิงก์ยืนยันความเป็นเจ้าของด่วน", isScam: true, law: "Phishing (ดักรับรหัสผ่าน)", explanation: "Platform อย่าง Facebook จะแจ้งเตือนผ่านระบบ Notifications ภายในแอปเท่านั้น ไม่ทักแชทส่วนตัวมาหา" },
  { id: 14, text: "รับจ้างเปิด 'บัญชีม้า' โดยแลกกับเงินค่าตอบแทน 500 บาท เพื่อให้ผู้อื่นนำไปใช้โอนเงินเข้าออก", isScam: true, law: "พ.ร.ก. มาตรการป้องกันและปราบปรามอาชญากรรมทางเทคโนโลยี พ.ศ. 2566", explanation: "การเปิดบัญชีม้ามีความผิดร้ายแรง โทษจำคุกไม่เกิน 3 ปี ปรับไม่เกิน 3 แสนบาท แม้เราจะไม่ได้เป็นคนโกงเองก็ตาม" }
];

export default function Module1ScamAwareness({ user }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [latestScore, setLatestScore] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  const fetchLatest = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getLatestRecord&userId=${user.id}&moduleName=${encodeURIComponent("Module 1: รู้เท่าทันภัย")}&t=${Date.now()}`);
      const result = await res.json();
      if (result.status === "success") setLatestScore(result.rawData);
    } catch (err) { console.error(err); }
  }, [user.id]);

  useEffect(() => { fetchLatest(); }, [fetchLatest]);

  const scenario = scamScenarios[currentQuestion];

  const handleAnswer = (isTrustworthy) => {
    const isCorrect = (isTrustworthy === !scenario.isScam);
    if (isCorrect) setScore(score + 1);
    setUserAnswer(isTrustworthy);
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < scamScenarios.length) {
      setShowResult(false);
      setUserAnswer(null);
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setGameFinished(true);
    }
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setUserAnswer(null);
    setGameFinished(false);
    setGameStarted(true);
    setSubmitStatus('');
  };

  const saveToGoogleSheets = async () => {
    setIsSubmitting(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST", mode: "no-cors",
        body: JSON.stringify({ action: "save", userId: user.id, moduleName: "Module 1: รู้เท่าทันภัย", actionData: `คะแนน: ${score}/${scamScenarios.length} ข้อ` })
      });
      setSubmitStatus('บันทึกสำเร็จ ✅');
      setLatestScore(`คะแนน: ${score}/${scamScenarios.length} ข้อ`);
    } catch (error) { setSubmitStatus('บันทึกไม่สำเร็จ ❌'); } 
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-10 px-4 md:px-10 font-sans animate-fadeIn relative overflow-hidden">
      
      {/* 🔮 Background Decor */}
      <div className="absolute top-0 right-0 w-[30rem] md:w-[40rem] h-[30rem] md:h-[40rem] bg-blue-100/40 rounded-full blur-[80px] md:blur-[120px] -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-[25rem] md:w-[35rem] h-[25rem] md:h-[35rem] bg-cyan-50/50 rounded-full blur-[80px] md:blur-[100px] -ml-32 -mb-32"></div>

      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 relative z-10">
        
        {/* Header Section */}
        <section className="bg-white/60 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-white shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 overflow-hidden">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl md:rounded-3xl flex items-center justify-center text-white text-4xl md:text-5xl shadow-xl shadow-blue-500/20 group hover:scale-110 transition-transform duration-500 shrink-0">
              <span className="material-symbols-outlined text-4xl md:text-5xl">verified_user</span>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 tracking-tight pb-1 md:pb-2 pr-2 md:pr-4 leading-tight uppercase">Cyber Security</h2>
              <p className="text-slate-500 font-bold italic text-xs md:text-base">โมดูล 1: ทักษะการแยกแยะมิจฉาชีพ</p>
            </div>
          </div>
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-blue-500">history</span> ประวัติการทดสอบ
          </button>
        </section>

        {/* Main Quiz Area */}
        <div className="bg-white/80 backdrop-blur-3xl p-6 sm:p-8 md:p-14 rounded-[2.5rem] md:rounded-[4rem] border border-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden min-h-[450px] md:min-h-[550px] flex flex-col justify-center">
          
          {!gameStarted && !gameFinished ? (
            <div className="text-center space-y-8 md:space-y-10 animate-fadeIn">
              <div className="space-y-3 md:space-y-4">
                <h3 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight">พร้อมทดสอบทักษะ <br/>การเอาตัวรอดหรือยัง?</h3>
                <p className="text-slate-500 font-bold max-w-md mx-auto leading-relaxed text-sm md:text-base px-2">
                  ในโลกดิจิทัล เงินของคุณอาจหายไปในคลิกเดียว <br/>มาลองวิเคราะห์ 14 สถานการณ์จำลองกันครับ
                </p>
              </div>

              {latestScore && (
                <div className="bg-blue-50/50 p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border border-blue-100 inline-block px-8 md:px-12 shadow-inner">
                  <p className="text-[9px] md:text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1 md:mb-2">สถิติล่าสุด</p>
                  <p className="text-2xl md:text-3xl font-black text-blue-800">{latestScore}</p>
                </div>
              )}

              <button 
                onClick={() => setGameStarted(true)} 
                className="w-full max-w-sm py-5 md:py-6 bg-slate-900 text-white font-black rounded-[1.5rem] md:rounded-[2rem] shadow-xl hover:bg-blue-600 hover:scale-[1.02] transition-all active:scale-95 text-xl md:text-2xl flex items-center justify-center gap-3 md:gap-4 mx-auto group"
              >
                <span className="material-symbols-outlined text-2xl md:text-3xl group-hover:rotate-12 transition-transform">play_circle</span>
                เริ่มภารกิจป้องกันภัย
              </button>
            </div>
          ) : !gameFinished ? (
            <div className="animate-fadeIn w-full">
              {/* Progress Bar */}
              <div className="mb-8 md:mb-14">
                <div className="flex justify-between text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 md:mb-4 px-2">
                  <span>สถานการณ์ที่ {currentQuestion + 1} / {scamScenarios.length}</span>
                  <span className="text-blue-600">คะแนนสะสม: {score}</span>
                </div>
                <div className="w-full bg-slate-100 h-3 md:h-4 rounded-full overflow-hidden p-1 shadow-inner">
                  <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-700 shadow-md" style={{ width: `${((currentQuestion) / scamScenarios.length) * 100}%` }}></div>
                </div>
              </div>
              
              {/* Question Card */}
              <div className="bg-slate-50 p-6 sm:p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 mb-8 md:mb-12 min-h-[180px] md:min-h-[220px] flex items-center justify-center shadow-inner relative overflow-hidden group">
                <span className="material-symbols-outlined absolute -right-4 -bottom-4 md:-right-6 md:-bottom-6 text-[10rem] md:text-[14rem] text-slate-200 opacity-20 rotate-12">fingerprint</span>
                <p className="text-xl sm:text-2xl md:text-3xl text-slate-800 leading-relaxed font-black text-center italic relative z-10 pb-2 md:pb-4 pr-2 md:pr-6">
                  "{scenario.text}"
                </p>
              </div>

              {!showResult ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                  <button onClick={() => handleAnswer(true)} className="bg-white border-b-[6px] md:border-b-8 border-emerald-500 text-emerald-600 hover:bg-emerald-50 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] font-black text-xl md:text-2xl transition-all active:scale-95 flex flex-col items-center gap-3 md:gap-4 shadow-xl group">
                    <span className="material-symbols-outlined text-4xl md:text-5xl group-hover:scale-110 transition-transform">verified</span> น่าเชื่อถือ / เรื่องจริง
                  </button>
                  <button onClick={() => handleAnswer(false)} className="bg-white border-b-[6px] md:border-b-8 border-rose-500 text-rose-600 hover:bg-rose-50 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] font-black text-xl md:text-2xl transition-all active:scale-95 flex flex-col items-center gap-3 md:gap-4 shadow-xl group">
                    <span className="material-symbols-outlined text-4xl md:text-5xl group-hover:scale-110 transition-transform">gavel</span> หลอกลวง / มิจฉาชีพ
                  </button>
                </div>
              ) : (
                <div className="space-y-6 md:space-y-8 animate-fadeIn">
                  <div className={`p-6 sm:p-8 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border-2 shadow-2xl ${userAnswer === !scenario.isScam ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'}`}>
                    <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 ${userAnswer === !scenario.isScam ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                        <span className="material-symbols-outlined text-3xl md:text-4xl">{userAnswer === !scenario.isScam ? 'check_circle' : 'cancel'}</span>
                      </div>
                      <div>
                        <h3 className={`text-2xl sm:text-3xl md:text-4xl font-black pb-1 pr-2 md:pr-4 ${userAnswer === !scenario.isScam ? 'text-emerald-800' : 'text-rose-800'}`}>
                          {userAnswer === !scenario.isScam ? 'ถูกต้อง!' : 'พลาดแล้ว!'}
                        </h3>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] md:text-xs">วิเคราะห์ตามหลักการรักษาความปลอดภัย</p>
                      </div>
                    </div>
                    
                    <p className="text-slate-800 font-black mb-4 md:mb-6 text-lg sm:text-xl md:text-2xl pb-1 md:pb-2 pr-2 md:pr-4">
                      คำตอบคือ: <span className={scenario.isScam ? 'text-rose-600' : 'text-emerald-600'}>{scenario.isScam ? 'หลอกลวงแน่นอน' : 'เรื่องจริงที่ปลอดภัย'}</span>
                    </p>
                    
                    <div className="bg-white/90 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-3 md:space-y-4">
                      <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center gap-1 md:gap-2">
                         <span className="material-symbols-outlined text-xs md:text-sm">psychology</span> วิเคราะห์เหตุผลเชิงลึก
                      </p>
                      <p className="text-slate-600 font-bold text-sm sm:text-base md:text-lg leading-relaxed pb-1 md:pb-2 pr-2 md:pr-4">{scenario.explanation}</p>
                      {scenario.isScam && (
                        <div className="mt-4 pt-4 md:mt-6 md:pt-6 border-t border-slate-50">
                           <p className="text-[9px] md:text-[11px] font-black text-rose-500 uppercase italic flex items-center gap-1.5 md:gap-2">
                             <span className="material-symbols-outlined text-sm md:text-base">gavel</span> ข้อกฎหมายที่เกี่ยวข้อง: {scenario.law}
                           </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button onClick={nextQuestion} className="w-full bg-slate-900 text-white py-5 md:py-6 rounded-[1.5rem] md:rounded-[2rem] font-black text-xl md:text-2xl hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-3 md:gap-4 active:scale-95 group">
                    {currentQuestion + 1 === scamScenarios.length ? 'สรุปคะแนนภารกิจ' : 'สถานการณ์ถัดไป'}
                    <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform text-xl md:text-2xl">arrow_forward_ios</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 md:py-10 space-y-8 md:space-y-12 animate-fadeIn relative">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-blue-50 text-blue-600 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mx-auto text-5xl md:text-7xl shadow-inner border border-blue-100 animate-bounce">🏆</div>
              
              <div className="space-y-2 md:space-y-3">
                <h3 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter">จบภารกิจกวาดล้างโจร!</h3>
                <p className="text-slate-500 font-bold text-base md:text-xl">ระดับภูมิคุ้มกันดิจิทัลของคุณคือ</p>
              </div>

              {/* ✅ ปรับตัวเลขคะแนนให้เป็น Flex คู่กัน แทนที่จะใช้ absolute เพื่อป้องกันปัญหาล้นจอในมือถือ */}
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-[7rem] md:text-[10rem] font-black text-blue-600 leading-none tracking-tighter drop-shadow-2xl">{score}</span>
                <span className="text-3xl md:text-4xl text-blue-300 font-black">/ {scamScenarios.length}</span>
              </div>

              <div className="max-w-md mx-auto space-y-4 md:space-y-6 px-4 md:px-0">
                <button 
                  onClick={saveToGoogleSheets} 
                  disabled={isSubmitting || submitStatus.includes('สำเร็จ')} 
                  className={`w-full py-5 md:py-6 font-black rounded-[2rem] md:rounded-[2.5rem] transition-all shadow-xl flex items-center justify-center gap-3 md:gap-4 text-xl md:text-2xl active:scale-95
                    ${isSubmitting || submitStatus.includes('สำเร็จ') 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'}`}
                >
                  <span className="material-symbols-outlined text-2xl md:text-3xl">{isSubmitting ? 'sync' : 'cloud_done'}</span>
                  {isSubmitting ? 'กำลังบันทึก...' : submitStatus || 'บันทึกความสำเร็จ'}
                </button>
                
                <button onClick={resetGame} className="w-full text-slate-400 font-black hover:text-slate-800 transition-colors uppercase text-[10px] md:text-[11px] tracking-[0.4em] py-3 md:py-4">
                  เริ่มฝึกฝนใหม่อีกครั้ง
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} userId={user.id} moduleName="Module 1: รู้เท่าทันภัย" GOOGLE_SCRIPT_URL={GOOGLE_SCRIPT_URL} />
      
      <style>{`
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}