import React, { useState } from 'react';

// 1. นำเข้า Components ส่วนโครงสร้างเว็บ
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// 2. นำเข้า Components ส่วนเนื้อหา (Pages)
import Dashboard from './pages/Dashboard';
import Module1ScamAwareness from './pages/Module1';
import Module2TaxSimulator from './pages/Module2';
import Module3TVMCalculator from './pages/Module3';
import Module4RetirementPlanner from './pages/Module4';
import Module5LifePlanner from './pages/Module5';

export default function App() {
  // State สำหรับควบคุมว่าตอนนี้นักเรียนกำลังเปิดหน้าไหนอยู่ (เริ่มต้นที่หน้า Dashboard)
  const [activePage, setActivePage] = useState('dashboard');

  // ฟังก์ชันสำหรับสลับหน้าจอตามเมนูที่กด
  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': 
        return <Dashboard />;
      case 'module1': 
        return <Module1ScamAwareness />;
      case 'module2': 
        return <Module2TaxSimulator />;
      case 'module3': 
        return <Module3TVMCalculator />;
      case 'module4': 
        return <Module4RetirementPlanner />;
      case 'module5': 
        return <Module5LifePlanner />;
      default: 
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800 font-sans">
      
      {/* ส่วนที่ 1: แถบเมนูด้านซ้าย (ส่ง State ไปให้ Sidebar เพื่อให้รู้ว่าควรกดปุ่มไหนและเปลี่ยนสีเมนู) */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* ส่วนที่ 2: พื้นที่หลักด้านขวา */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* แถบด้านบน */}
        <Navbar activePage={activePage} />

        {/* พื้นที่เนื้อหาที่เปลี่ยนไปตามโมดูล (ตั้งค่าให้มี Scrollbar เลื่อนขึ้นลงได้) */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
          
          {/* Footer วางไว้ล่างสุดของเนื้อหาเสมอ */}
          <Footer />
        </main>

      </div>
      
    </div>
  );
}