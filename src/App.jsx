import React, { useState, useEffect } from 'react';

// 1. นำเข้า Components โครงสร้าง
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// 2. นำเข้า Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Module1ScamAwareness from './pages/Module1';
import Module2TaxSimulator from './pages/Module2';
import Module3TVMCalculator from './pages/Module3';
import Module4RetirementPlanner from './pages/Module4';
import Module5LifePlanner from './pages/Module5';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [totalViews, setTotalViews] = useState(0);
  
  // ✅ ปรับเป็น true เพื่อให้เปิดเมนูค้างไว้ในตอนเริ่มต้น (สำหรับหน้าจอคอม)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('financial_app_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) { return null; }
  });

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCUVKsqX1FXfZSELbVu1twgDd_pwQ7LVgVDpb8Stw6pJUc9u0ft6aMfUVXoK1oIOj_bQ/exec";

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getViews`);
        const result = await response.json();
        if (result.status === "success") setTotalViews(result.totalViews);
      } catch (error) { console.error("Failed to fetch views:", error); }
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
    // ✅ ปิดเมนูอัตโนมัติเฉพาะบนหน้าจอเล็กลง (Mobile/Tablet)
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard user={user} setActivePage={handlePageChange} />;
      case 'module1': return <Module1ScamAwareness user={user} />;
      case 'module2': return <Module2TaxSimulator user={user} />;
      case 'module3': return <Module3TVMCalculator user={user} />;
      case 'module4': return <Module4RetirementPlanner user={user} />;
      case 'module5': return <Module5LifePlanner user={user} />;
      case 'admin': return <AdminDashboard user={user} />;
      case 'settings': return <Settings user={user} />;
      default: return <Dashboard user={user} setActivePage={handlePageChange} />;
    }
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans relative">
      
      {/* 📱 1. Mobile Overlay (Backdrop) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-[60] lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 🏰 2. Sidebar (Fixed Layer) */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={handlePageChange} 
        onLogout={handleLogout} 
        user={user}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* 🚀 3. Content Wrapper: จัดการพื้นที่ขยับตาม Sidebar */}
      <div className={`flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-500 ease-in-out ${
        isSidebarOpen ? 'lg:pl-72' : 'lg:pl-0'
      }`}>
        
        {/* 💎 Navbar: ใส่ z-index ให้เหมาะสม */}
        <div className="z-50">
          <Navbar 
            activePage={activePage} 
            user={user} 
            toggleMenu={() => setIsSidebarOpen(!isSidebarOpen)} 
            setActivePage={handlePageChange}
            onLogout={handleLogout}
          />
        </div>

        {/* 📝 Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
          {/* ใช้ flex-col เพื่อดัน Footer ลงล่างสุดเสมอ */}
          <div className="min-h-full flex flex-col relative">
            
            {/* พื้นที่ Content พร้อมอนิเมชัน */}
            <div className="flex-grow p-4 md:p-8 lg:p-10 animate-fadeIn">
              {renderContent()}
            </div>
            
            {/* 👣 Footer */}
            <Footer totalViews={totalViews} /> 
          </div>
        </main>
      </div>

      {/* Global CSS Polish */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}