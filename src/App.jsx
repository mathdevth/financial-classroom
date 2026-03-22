import React, { useState } from 'react';

// 1. นำเข้า Components ส่วนโครงสร้างเว็บ
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// 2. นำเข้า Components ส่วนเนื้อหา (Pages)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Module1ScamAwareness from './pages/Module1';
import Module2TaxSimulator from './pages/Module2';
import Module3TVMCalculator from './pages/Module3';
import Module4RetirementPlanner from './pages/Module4';
import Module5LifePlanner from './pages/Module5';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [user, setUser] = useState(null);
  
  // 📱 State ใหม่: สำหรับคุมการเปิด/ปิดแถบเมนูด้านซ้ายในมือถือ
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ฟังก์ชันเปลี่ยนหน้า: เปลี่ยนหน้าเสร็จปุ๊บ ให้ปิดเมนูมือถือปั๊บ
  const handlePageChange = (pageId) => {
    setActivePage(pageId);
    setIsMobileMenuOpen(false); 
  };

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

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800 font-sans relative">
      
      {/* 🌑 พื้นหลังสีดำจางๆ (Overlay) แสดงเฉพาะในมือถือตอนเปิดเมนู */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* 🖥️ พื้นที่ Sidebar (ทำ Slide Animation สำหรับมือถือ) */}
      <div className={`fixed inset-y-0 left-0 z-50 transform lg:transform-none lg:static transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar 
          activePage={activePage} 
          setActivePage={handlePageChange} // ใช้ฟังก์ชันใหม่ที่สร้างไว้
          onLogout={() => setUser(null)} 
        />
      </div>

      {/* 📺 พื้นที่แสดงผลเนื้อหา (Main Content) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        
        {/* ส่งฟังก์ชัน toggleMenu ไปให้ Navbar เพื่อทำปุ่มแฮมเบอร์เกอร์ */}
        <Navbar 
          activePage={activePage} 
          user={user} 
          toggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        />

        <main className="flex-1 overflow-y-auto">
          {renderContent()}
          <Footer />
        </main>
      </div>
      
    </div>
  );
}