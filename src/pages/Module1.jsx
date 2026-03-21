import React, { useState } from 'react';

// 1. คลังสถานการณ์จำลอง (Expanded to 14 Scenarios)
const scamScenarios = [
  {
    id: 1,
    text: "เพจ 'รวยด้วยคริปโต' ทักมาบอกว่าคุณคือผู้โชคดี ลงทุนเพียง 1,000 บาท รับกำไร 5,000 บาทใน 1 ชั่วโมง ไม่มีความเสี่ยง",
    isScam: true,
    law: "พ.ร.บ.คอมพิวเตอร์ฯ มาตรา 14 (1) และ พ.ร.ก.การกู้ยืมเงินที่เป็นการฉ้อโกงประชาชน",
    explanation: "การันตีผลตอบแทนสูงเกินจริงในเวลาอันสั้นและ 'ไม่มีความเสี่ยง' คือสัญญาณชัดเจนของแชร์ลูกโซ่หรือการหลอกลงทุน"
  },
  {
    id: 2,
    text: "ชาวต่างชาติโปรไฟล์นักธุรกิจทักแชทมาจีบ บอกว่าส่งกระเป๋าแบรนด์เนมมาให้ แต่ติดศุลกากร ต้องโอนเงินค่าธรรมเนียม 2 หมื่นบาท",
    isScam: true,
    law: "พ.ร.บ.คอมพิวเตอร์ฯ มาตรา 14 (1) และความผิดฐานฉ้อโกง",
    explanation: "Romance Scam: มิจฉาชีพจะสร้างความเชื่อใจแล้วอ้างเหตุผลต่างๆ ให้เราโอนเงินค่าธรรมเนียมที่ไม่มีจริงให้"
  },
  {
    id: 3,
    text: "มี SMS จาก 'ธนาคารสีม่วง' แจ้งว่าบัญชีของคุณมีปัญหา ให้คลิกลิงก์ www.scb-verify-secure.com เพื่อยืนยันตัวตน",
    isScam: true,
    law: "พ.ร.บ.คอมพิวเตอร์ฯ มาตรา 14 (1) ฐานพยายามดักรับข้อมูล (Phishing)",
    explanation: "ธนาคารยกเลิกการส่ง SMS แนบลิงก์ทุกกรณี และลิงก์ปลอมมักใช้ชื่อที่คล้ายของจริงแต่สะกดผิดหรือมีขีดกลาง"
  },
  {
    id: 4,
    text: "ซื้อของจากร้าน Mall ใน Shopee ที่มีสัญลักษณ์ 'ร้านค้าทางการ' และชำระเงินผ่านระบบของแอปพลิเคชันเท่านั้น",
    isScam: false,
    law: "ธุรกรรมปลอดภัย",
    explanation: "การซื้อผ่านแพลตฟอร์มที่มีระบบการันตี (Escrow) จะช่วยคุ้มครองเงินเราจนกว่าจะได้รับของ"
  },
  {
    id: 5,
    text: "เบอร์นิรนามโทรมาอ้างเป็น 'ตำรวจ สภ.เมือง' บอกว่าคุณมีส่วนเกี่ยวข้องกับคดีฟอกเงิน ต้องโอนเงินในบัญชีมาตรวจสอบ",
    isScam: true,
    law: "ความผิดฐานฉ้อโกงประชาชน และแสดงตนเป็นเจ้าพนักงาน",
    explanation: "ตำรวจหรือเจ้าหน้าที่รัฐไม่มีนโยบายโทรให้ประชาชนโอนเงินมา 'ตรวจสอบ' หากมีคดีจริงจะต้องมีหมายเรียกส่งไปที่บ้าน"
  },
  {
    id: 6,
    text: "โฆษณาใน Facebook รับสมัครงาน 'กดไลก์สินค้า' หรือ 'รับออเดอร์' รายได้วันละ 500-2,000 บาท ทำงานผ่านมือถือ",
    isScam: true,
    law: "พ.ร.บ.คอมพิวเตอร์ฯ มาตรา 14 (1)",
    explanation: "หลอกทำงานออนไลน์: เริ่มแรกจะให้เงินจริงหลักสิบ แต่ต่อมาจะอ้างว่าต้อง 'สำรองเงิน' หรือ 'เติมเครดิต' ถึงจะถอนเงินได้"
  },
  {
    id: 7,
    text: "แอปพลิเคชัน 'เงินกู้ทันใจ' ให้กู้เงิน 5,000 บาท โดยขอกดเข้าถึงรายชื่อติดต่อในมือถือ และให้โอนค่าค้ำประกันก่อน 500 บาท",
    isScam: true,
    law: "พ.ร.บ.ห้ามเรียกดอกเบี้ยเกินอัตรา และ พ.ร.บ.คอมพิวเตอร์ฯ",
    explanation: "แอปเงินกู้เถื่อนมักเรียกค่าธรรมเนียมก่อนกู้ และจะเข้าถึงรายชื่อเพื่อโทรข่มขู่ประจานหากจ่ายช้า"
  },
  {
    id: 8,
    text: "เจ้าหน้าที่จากการไฟฟ้าโทรมาบอกว่าคุณชำระค่าไฟเกิน จะคืนเงินให้ 500 บาท โดยให้แอดไลน์และติดตั้งแอป 'PEA Smart'",
    isScam: true,
    law: "พ.ร.บ.คอมพิวเตอร์ฯ มาตรา 14 (1) ฐานติดตั้งแอปควบคุมมือถือ (Remote Access)",
    explanation: "การหลอกให้ติดตั้งแอปเพื่อคืนเงิน คือวิธีที่มิจฉาชีพใช้เพื่อควบคุมมือถือและโอนเงินออกจากแอปธนาคาร"
  },
  {
    id: 9,
    text: "เข้าเว็บไซต์กระทรวงการคลังที่ลงท้ายด้วย .go.th เพื่อเช็กสิทธิสวัสดิการแห่งรัฐด้วยตนเอง",
    isScam: false,
    law: "เว็บไซต์หน่วยงานรัฐที่ถูกต้อง",
    explanation: "เว็บไซต์หน่วยงานรัฐไทยจะลงท้ายด้วย .go.th เสมอ ควรตรวจสอบผ่านเบราว์เซอร์ด้วยการพิมพ์เอง"
  },
  {
    id: 10,
    text: "ได้รับพัสดุเก็บเงินปลายทาง 300 บาท ทั้งที่ไม่ได้สั่ง แต่คนส่งบอกว่าอาจจะเป็นของกำนัลหรือญาติส่งมาให้",
    isScam: true,
    law: "ความผิดฐานฉ้อโกง",
    explanation: "การส่งพัสดุเก็บเงินปลายทางโดยที่ไม่ได้สั่ง (Brushing Scam) เป็นวิธีหากินของมิจฉาชีพที่เน้นเหยื่อที่จำไม่ได้ว่าสั่งอะไรไปบ้าง"
  },
  {
    id: 11,
    text: "ได้รับ SMS จากกรมที่ดิน แจ้งให้อัปเดตข้อมูลที่ดินผ่านลิงก์ เพื่อเลี่ยงภาษีที่ดินและสิ่งปลูกสร้าง",
    isScam: true,
    law: "พ.ร.บ.คอมพิวเตอร์ฯ มาตรา 14 (1)",
    explanation: "กรมที่ดินไม่มีนโยบายทักหาประชาชนผ่าน SMS หรือแอปเพื่อให้อัปเดตข้อมูลที่ดินออนไลน์ในลักษณะนี้"
  },
  {
    id: 12,
    text: "เปิดบัญชีเงินฝากประจำแบบดิจิทัลผ่านแอปพลิเคชันอย่างเป็นทางการของธนาคารที่มีการยืนยันตัวตนด้วย NDID",
    isScam: false,
    law: "ธุรกรรมธนาคารปกติ",
    explanation: "การทำธุรกรรมผ่านแอปทางการที่มีการยืนยันตัวตนเข้มงวด ถือเป็นเรื่องปกติและปลอดภัย"
  },
  {
    id: 13,
    text: "มีผู้หวังดีทักมาใน Facebook แจ้งว่าบัญชีของคุณกำลังจะถูกลบ ให้คลิกลิงก์ยืนยันความเป็นเจ้าของด่วน",
    isScam: true,
    law: "Phishing (ดักรับรหัสผ่าน)",
    explanation: "Platform อย่าง Facebook จะแจ้งเตือนผ่านระบบ Notifications ภายในแอปเท่านั้น ไม่ทักแชทส่วนตัวมาหา"
  },
  {
    id: 14,
    text: "รับจ้างเปิด 'บัญชีม้า' โดยแลกกับเงินค่าตอบแทน 500 บาท เพื่อให้ผู้อื่นนำไปใช้โอนเงินเข้าออก",
    isScam: true,
    law: "พ.ร.ก. มาตรการป้องกันและปราบปรามอาชญากรรมทางเทคโนโลยี พ.ศ. 2566",
    explanation: "การเปิดบัญชีม้ามีความผิดร้ายแรง โทษจำคุกไม่เกิน 3 ปี ปรับไม่เกิน 3 แสนบาท แม้เราจะไม่ได้เป็นคนโกงเองก็ตาม"
  }
];

export default function Module1ScamAwareness({ user }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

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
    setSubmitStatus('');
  };

  const saveToGoogleSheets = async () => {
    setIsSubmitting(true);
    setSubmitStatus('กำลังบันทึกคะแนน...');
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";
    
    const payload = {
        action: "save",
        userId: user.id,
        moduleName: "Module 1: รู้เท่าทันภัย",
        actionData: `คะแนน: ${score}/${scamScenarios.length} ข้อ`
      };

      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        setSubmitStatus('บันทึกสำเร็จ ✅');
      } catch (error) {
        setSubmitStatus('บันทึกไม่สำเร็จ ❌');
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 bg-slate-50 min-h-screen font-sans">
      
      {/* Header */}
      <div className="bg-slate-900 p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
          <span className="material-symbols-outlined text-4xl">security</span>
        </div>
        <div>
          <h2 className="text-3xl font-black text-white mb-1 tracking-tight">มินิเกม: รู้เท่าทันภัยการเงิน</h2>
          <p className="text-slate-400 font-medium">จำลอง 14 สถานการณ์ เพื่อสร้างภูมิคุ้มกันมิจฉาชีพ</p>
        </div>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        {!gameFinished ? (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                <span>ความคืบหน้า: {currentQuestion + 1} / {scamScenarios.length}</span>
                <span className="text-blue-600">คะแนน: {score}</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-500"
                  style={{ width: `${((currentQuestion) / scamScenarios.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100 mb-8 min-h-[160px] flex items-center justify-center">
              <p className="text-xl md:text-2xl text-slate-800 leading-relaxed font-bold text-center italic">
                "{scenario.text}"
              </p>
            </div>

            {!showResult ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => handleAnswer(true)} className="bg-white border-2 border-green-500 text-green-700 hover:bg-green-50 p-5 rounded-2xl font-black text-lg transition-all active:scale-95 flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-3xl">verified</span> น่าเชื่อถือ / เรื่องจริง
                </button>
                <button onClick={() => handleAnswer(false)} className="bg-white border-2 border-red-500 text-red-700 hover:bg-red-50 p-5 rounded-2xl font-black text-lg transition-all active:scale-95 flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-3xl">gavel</span> หลอกลวง / มิจฉาชีพ
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className={`p-6 rounded-3xl border-2 ${userAnswer === !scenario.isScam ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`material-symbols-outlined text-4xl ${userAnswer === !scenario.isScam ? 'text-green-600' : 'text-red-600'}`}>
                      {userAnswer === !scenario.isScam ? 'check_circle' : 'cancel'}
                    </span>
                    <h3 className={`text-2xl font-black ${userAnswer === !scenario.isScam ? 'text-green-800' : 'text-red-800'}`}>
                      {userAnswer === !scenario.isScam ? 'ถูกต้อง!' : 'พลาดแล้ว!'}
                    </h3>
                  </div>
                  <p className="text-slate-700 font-bold mb-4 text-lg">
                    คำตอบคือ: <span className={scenario.isScam ? 'text-red-600' : 'text-green-600'}>{scenario.isScam ? 'หลอกลวงแน่นอน' : 'เรื่องจริงที่ปลอดภัย'}</span>
                  </p>
                  <div className="bg-white/60 p-5 rounded-2xl">
                    <p className="text-sm font-black text-slate-400 uppercase tracking-tighter mb-1">ทำไมถึงเป็นเช่นนั้น?</p>
                    <p className="text-slate-600 font-medium leading-relaxed">{scenario.explanation}</p>
                    {scenario.isScam && <p className="mt-3 text-[10px] font-black text-red-400 uppercase italic">ข้อกฎหมาย: {scenario.law}</p>}
                  </div>
                </div>
                <button onClick={nextQuestion} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2">
                  {currentQuestion + 1 === scamScenarios.length ? 'ดูสรุปคะแนน' : 'ไปสถานการณ์ถัดไป'}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10 space-y-8 animate-fadeIn">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-5xl">🏆</div>
            <h3 className="text-4xl font-black text-slate-800">จบการทดสอบ!</h3>
            <div className="text-7xl font-black text-blue-600 bg-blue-50 py-10 rounded-[3rem] border-2 border-blue-100 w-full max-w-sm mx-auto shadow-inner">
              {score} <span className="text-2xl text-blue-300 font-bold">/ {scamScenarios.length}</span>
            </div>
            <div className="max-w-sm mx-auto space-y-4">
              <button onClick={saveToGoogleSheets} disabled={isSubmitting || submitStatus.includes('สำเร็จ')} className={`w-full py-5 font-black rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 ${isSubmitting || submitStatus.includes('สำเร็จ') ? 'bg-slate-100 text-slate-400' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                <span className="material-symbols-outlined">cloud_upload</span>
                {isSubmitting ? 'กำลังบันทึก...' : submitStatus || 'บันทึกคะแนนเข้า Google Sheets'}
              </button>
              <button onClick={resetGame} className="w-full text-slate-400 font-black hover:text-slate-800 transition-colors uppercase text-xs tracking-widest">เริ่มใหม่จากข้อแรก</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}