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
import Settings from './pages/Settings'; // ✅ เพิ่มหน้าตั้งค่า

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  
  // ✅ 1. State สำหรับยอดผู้เข้าชม
  const [totalViews, setTotalViews] = useState(0);

  // ✅ 2. ระบบเช็กความจำผู้ใช้งาน
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

  // ⚠️ URL ของ Google Apps Script ของคุณครู
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  // ✅ 3. นับยอดวิวทันทีที่เปิดแอป
  useEffect(() => {
    const fetchViews = async () => {
      try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getViews`);
        const result = await response.json();
        if (result.status === "success") {
          setTotalViews(result.totalViews);
        }
      } catch (error) {
        console.error("Failed to fetch views:", error);
      }
    };
    fetchViews();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('financial_app_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    if (window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      setUser(null);
      localStorage.removeItem('financial_app_user');
      setActivePage('dashboard');
    }
  };

  const handlePageChange = (pageId) => {
    setActivePage(pageId);
    setIsMobileMenuOpen(false); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ 4. เพิ่ม Case 'settings' ในการ Render
  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': 
        return <Dashboard user={user} setActivePage={handlePageChange} />;
      case 'module1': return <Module1ScamAwareness user={user} />;
      case 'module2': return <Module2TaxSimulator user={user} />;
      case 'module3': return <Module3TVMCalculator user={user} />;
      case 'module4': return <Module4RetirementPlanner user={user} />;
      case 'module5': return <Module5LifePlanner user={user} />;
      case 'admin': return <AdminDashboard user={user} />;
      case 'settings': return <Settings user={user} />; // 🚀 หน้าแก้โปรไฟล์
      default: return <Dashboard user={user} setActivePage={handlePageChange} />;
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800 font-sans relative">
      
      {/* Backdrop สำหรับ Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform lg:transform-none lg:static transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar 
          activePage={activePage} 
          setActivePage={handlePageChange} 
          onLogout={handleLogout} 
          user={user} 
        />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        
        {/* ✅ ส่ง Props เพิ่มเติมให้ Navbar เพื่อให้ Search และ Profile Dropdown ทำงานได้ */}
        <Navbar 
          activePage={activePage} 
          user={user} 
          toggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          setActivePage={handlePageChange} // 🚀 สำหรับระบบ Search
          onLogout={handleLogout}         // 🚀 สำหรับปุ่ม Logout ใน Dropdown
        />

        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          <div className="min-h-full flex flex-col">
            <div className="flex-grow">
              {renderContent()}
            </div>
            
            <Footer totalViews={totalViews} /> 
          </div>
        </main>
      </div>
      
    </div>
  );
}