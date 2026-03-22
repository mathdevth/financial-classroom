import React, { useState, useEffect } from 'react';

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
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  
  // ✅ 1. ระบบเช็กความจำ (Remember Me): เช็กข้อมูลจาก localStorage ทันทีที่โหลดแอป
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('financial_app_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return null;
    }
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ✅ 2. ฟังก์ชันล็อกอิน: บันทึกทั้ง State และลงเครื่อง
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('financial_app_user', JSON.stringify(userData));
  };

  // ✅ 3. ฟังก์ชันออกจากระบบ: ล้างค่าทั้ง State และในเครื่อง
  const handleLogout = () => {
    if (window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      setUser(null);
      localStorage.removeItem('financial_app_user');
      setActivePage('dashboard'); // รีเซ็ตหน้ากลับไปที่หน้าแรก
    }
  };

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
      case 'admin': return <AdminDashboard user={user} />;
      default: return <Dashboard user={user} />;
    }
  };

  // ถ้ายังไม่ได้ล็อกอิน ให้ไปหน้า Login โดยส่ง handleLogin ไปแทน setUser
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800 font-sans relative">
      
      {/* 🌑 พื้นหลัง Overlay สำหรับมือถือ */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* 🖥️ Sidebar Area */}
      <div className={`fixed inset-y-0 left-0 z-50 transform lg:transform-none lg:static transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar 
          activePage={activePage} 
          setActivePage={handlePageChange} 
          onLogout={handleLogout} // ✅ ใช้ handleLogout ที่ล้างข้อมูลในเครื่องด้วย
          user={user} 
        />
      </div>

      {/* 📺 Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        
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