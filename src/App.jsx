import React, { useState } from 'react';

// 1. นำเข้า Components ส่วนโครงสร้างเว็บ
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// 2. นำเข้า Components ส่วนเนื้อหา (Pages)
import Login from './pages/Login'; // <--- นี่คือตัวละครใหม่ที่เพิ่มเข้ามาครับ!
import Dashboard from './pages/Dashboard';
import Module1ScamAwareness from './pages/Module1';
import Module2TaxSimulator from './pages/Module2';
import Module3TVMCalculator from './pages/Module3';
import Module4RetirementPlanner from './pages/Module4';
import Module5LifePlanner from './pages/Module5';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  
  // State สำหรับเก็บข้อมูลนักเรียน (ถ้าเป็น null แปลว่ายังไม่ได้ล็อกอิน)
  const [user, setUser] = useState(null); // <--- เพิ่มตัวแปรนี้เข้ามาครับ

  // ฟังก์ชันสลับหน้าจอตามเมนูที่กด (ส่ง user ไปให้แต่ละโมดูลด้วย)
  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard user={user} />;
      case 'module1': return <Module1ScamAwareness user={user} />;
      case 'module2': return <Module2TaxSimulator user={user} />;
      case 'module3': return <Module3TVMCalculator user={user} />;
      case 'module4': return <Module4RetirementPlanner user={user} />;
      case 'module5': return <Module5LifePlanner user={user} />;
      default: return <Dashboard user={user} />;
    }
  };

  // ดักเอาไว้เลย! ถ้ายังไม่มีข้อมูล user ให้โชว์หน้า Login เท่านั้น
  if (!user) {
    return <Login onLogin={setUser} />; // <--- นี่คือจุดที่ทำให้หน้า Login โผล่มาครับ
  }

  // ถ้า Login แล้ว ถึงจะแสดงหน้าตาแอปปกติ
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800 font-sans">
      
      {/* แถบเมนูด้านซ้าย (ส่งคำสั่ง Logout ไปให้เมนูด้วย) */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onLogout={() => setUser(null)} 
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* แถบด้านบน (ส่งชื่อ user ไปโชว์ที่มุมขวาบน) */}
        <Navbar activePage={activePage} user={user} />

        <main className="flex-1 overflow-y-auto">
          {renderContent()}
          <Footer />
        </main>
      </div>
      
    </div>
  );
}