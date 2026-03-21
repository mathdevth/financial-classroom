import React, { useState } from 'react';

// 1. ฐานข้อมูลจำลองสำหรับสถานการณ์ต่างๆ (เพิ่มให้ครบ 14 ข้อได้ที่นี่)
const scamScenarios = [
  {
    id: 1,
    text: "โค้ชมหาเทพเปิดเพจลงทุน ลงทุน 1,000 บาท รับผลตอบแทน 100 บาท ทุกๆ 5 นาที",
    isScam: true,
    law: "พ.ร.บ.คอมพิวเตอร์ฯ (ฉบับที่ 2) พ.ศ. 2560 มาตรา 14 (1)",
    explanation: "ความผิดฐานนำเข้าข้อมูลอันเป็นเท็จ หลอกลวงให้ลงทุนในสิ่งที่ไม่มีจริง โทษจำคุกไม่เกิน 5 ปี ปรับไม่เกิน 1 แสนบาท"
  },
  {
    id: 2,
    text: "ชาวต่างชาติหน้าตาดีทักแชทมาบอกว่ารักมาก แต่ตอนนี้เดือดร้อนหนัก ขอให้โอนเงินค่าภาษีศุลกากรเพื่อรับของขวัญ",
    isScam: true,
    law: "พ.ร.บ.คอมพิวเตอร์ฯ (ฉบับที่ 2) พ.ศ. 2560 มาตรา 14 (1) และความผิดฐานฉ้อโกง",
    explanation: "นี่คือ Romance Scam การใช้โปรไฟล์ปลอมเพื่อหลอกให้หลงรักและโอนเงินให้"
  },
  {
    id: 3,
    text: "ธนาคารแห่งประเทศไทยส่ง SMS แจ้งว่าบัญชีของคุณถูกระงับ ให้คลิกลิงก์ http://bit.ly/bot-verify ด่วน",
    isScam: true,
    law: "พ.ร.บ.คอมพิวเตอร์ฯ มาตรา 14 (1) พยายามหลอกลวงดักจับข้อมูล (Phishing)",
    explanation: "ธนาคารแห่งประเทศไทยและธนาคารพาณิชย์ ไม่มีนโยบายส่ง SMS แนบลิงก์ให้ประชาชนกดเพื่อยืนยันตัวตนใดๆ ทั้งสิ้น"
  },
  {
    id: 4,
    text: "ร้านค้า Official Store แบรนด์ดังบน Shopee/Lazada จัดโปรโมชั่นลดราคาเครื่องใช้ไฟฟ้า 20% ในวัน Payday",
    isScam: false,
    law: "ไม่มีความผิด",
    explanation: "เป็นแคมเปญการตลาดปกติของร้านค้าทางการ (Official) ที่เชื่อถือได้และมีแพลตฟอร์มรับประกัน"
  },
  {
    id: 5,
    text: "เพื่อนสนิททักไลน์มายืมเงินด่วน 5,000 บาท บอกว่ากำลังเข้าโรงพยาบาล ให้โอนเข้าบัญชีชื่อใครก็ไม่รู้",
    isScam: true,
    law: "พ.ร.บ.คอมพิวเตอร์ฯ มาตรา 14 (1) และ ฉ้อโกงโดยแสดงตนเป็นคนอื่น",
    explanation: "ไลน์เพื่อนอาจถูกแฮ็ก (Line Hijack) หรือใช้โปรไฟล์ปลอม ต้องโทรศัพท์หาเพื่อนด้วยเบอร์โทรปกติเพื่อยืนยันก่อนเสมอ"
  }
];

export default function Module1ScamAwareness({ user }) {
  // 2. State สำหรับจัดการเกม
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);

  // State สำหรับส่งข้อมูล
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const scenario = scamScenarios[currentQuestion];

  // 3. ฟังก์ชันตรวจคำตอบ
  const handleAnswer = (isTrustworthy) => {
    const isCorrect = (isTrustworthy === !scenario.isScam);
    if (isCorrect) setScore(score + 1);
    setUserAnswer(isTrustworthy);
    setShowResult(true);
  };

  // 4. ฟังก์ชันเปลี่ยนข้อ หรือจบเกม
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
    setSubmitStatus('');
  };

  // 5. ส่งคะแนนเข้า Google Sheets
  const saveToGoogleSheets = async () => {
    setIsSubmitting(true);
    setSubmitStatus('กำลังบันทึกคะแนน...');

    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";
    
    // ✅ สิ่งที่ถูกต้อง: ต้องมีบรรทัด action: "save"
    const payload = {
        action: "save",          // ✅ ต้องมีบรรทัดนี้!
        userId: user.id,         // ✅ ต้องมี user.id (ที่ได้จากหน้า Login)
        moduleName: "Module 1",  // ✅ ชื่อโมดูล
        actionData: `คะแนน: ${score}/5` // ✅ รายละเอียด
      };

      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",       // ✅ ต้องเป็น no-cors
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        
        setSubmitStatus('บันทึกสำเร็จ ✅');
      } catch (error) {
        console.error("Error:", error);
        setSubmitStatus('บันทึกไม่สำเร็จ ❌');
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="bg-slate-900 p-8 rounded-xl shadow-lg flex items-center gap-6">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-3xl shadow-inner text-white">
          <span className="material-symbols-outlined text-4xl">security</span>
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-white mb-1">มินิเกม: รู้เท่าทันภัยทางการเงิน</h2>
          <p className="text-slate-400">จำลองสถานการณ์หลอกลวงบนโลกออนไลน์เพื่อเสริมสร้างภูมิคุ้มกันทางการเงิน</p>
        </div>
      </div>

      {/* Game Area */}
      <div className="bg-white p-8 lg:p-12 rounded-xl shadow-sm border border-slate-200">
        
        {!gameFinished ? (
          <div>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm font-bold text-slate-500 mb-2">
                <span>สถานการณ์ที่ {currentQuestion + 1} จาก {scamScenarios.length}</span>
                <span>คะแนนสะสม: {score}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${((currentQuestion) / scamScenarios.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Question Card */}
            <div className="bg-blue-50/50 p-8 rounded-xl border border-blue-100 mb-8 min-h-[150px] flex items-center justify-center text-center">
              <p className="text-xl md:text-2xl text-slate-800 leading-relaxed font-semibold">
                "{scenario.text}"
              </p>
            </div>

            {/* Answer Buttons OR Results */}
            {!showResult ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => handleAnswer(true)}
                  className="bg-white border-2 border-green-500 text-green-700 hover:bg-green-50 py-4 rounded-xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">verified</span> น่าเชื่อถือ (ปลอดภัย)
                </button>
                <button 
                  onClick={() => handleAnswer(false)}
                  className="bg-white border-2 border-red-500 text-red-700 hover:bg-red-50 py-4 rounded-xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">warning</span> หลอกลวง (Scam)
                </button>
              </div>
            ) : (
              <div className="animate-fade-in space-y-6">
                <div className={`p-6 rounded-xl border-l-4 ${
                  userAnswer === !scenario.isScam 
                  ? 'bg-green-50 border-green-500' 
                  : 'bg-red-50 border-red-500'
                }`}>
                  <h3 className={`text-2xl font-bold mb-2 flex items-center gap-2 ${
                    userAnswer === !scenario.isScam ? 'text-green-700' : 'text-red-700'
                  }`}>
                    <span className="material-symbols-outlined text-3xl">
                      {userAnswer === !scenario.isScam ? 'task_alt' : 'cancel'}
                    </span>
                    {userAnswer === !scenario.isScam ? 'คุณตอบถูก! ยอดเยี่ยมมาก' : 'ตอบผิด! ระวังตกเป็นเหยื่อนะ'}
                  </h3>
                  
                  <p className="text-slate-700 mb-4 text-lg">
                    <span className="font-bold">เฉลย:</span> สถานการณ์นี้คือ <span className={`font-bold ${scenario.isScam ? 'text-red-600' : 'text-green-600'}`}>{scenario.isScam ? 'การหลอกลวงมิจฉาชีพ ❌' : 'เรื่องจริงที่น่าเชื่อถือ ✅'}</span>
                  </p>
                  
                  {scenario.isScam && (
                    <div className="mt-4 pt-4 border-t border-slate-200/60 bg-white p-4 rounded-lg">
                      <p className="text-sm font-bold text-red-600 mb-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">gavel</span> {scenario.law}
                      </p>
                      <p className="text-sm text-slate-600">{scenario.explanation}</p>
                    </div>
                  )}
                  {!scenario.isScam && (
                    <div className="mt-4 pt-4 border-t border-slate-200/60 bg-white p-4 rounded-lg">
                      <p className="text-sm text-slate-600">{scenario.explanation}</p>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={nextQuestion}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {currentQuestion + 1 === scamScenarios.length ? 'ดูผลคะแนนรวม' : 'ข้อต่อไป'} <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* End Game Screen */
          <div className="text-center py-10 animate-fade-in space-y-8">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-5xl text-blue-600">emoji_events</span>
            </div>
            <div>
              <h3 className="text-4xl font-extrabold text-slate-800 mb-2">จบการทดสอบ!</h3>
              <p className="text-slate-500">คุณได้เรียนรู้วิธีป้องกันตัวเองจากภัยการเงินแล้ว</p>
            </div>
            
            <div className="text-6xl font-black text-blue-600 bg-blue-50 py-8 rounded-2xl border border-blue-100 w-full max-w-sm mx-auto">
              {score} <span className="text-3xl text-blue-400">/ {scamScenarios.length}</span>
            </div>

            <div className="max-w-sm mx-auto space-y-4 pt-4">
              <button 
                onClick={saveToGoogleSheets}
                disabled={isSubmitting || submitStatus.includes('สำเร็จ')}
                className={`w-full py-4 font-bold rounded-xl transition-all border-2 flex items-center justify-center gap-2 ${
                  isSubmitting || submitStatus.includes('สำเร็จ') 
                  ? 'border-slate-200 text-slate-400 bg-slate-50' 
                  : 'border-green-600 text-green-700 hover:bg-green-50'
                }`}
              >
                <span className="material-symbols-outlined">save</span>
                {isSubmitting ? 'กำลังบันทึก...' : submitStatus || 'บันทึกคะแนนลงฐานข้อมูล'}
              </button>
              
              <button 
                onClick={resetGame}
                className="w-full text-slate-500 font-bold hover:text-slate-800 transition-colors py-2"
              >
                เริ่มเล่นใหม่อีกครั้ง
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}