import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMobile, setShowMobile] = useState(false);

  const handleToggle = () => {
    if (window.innerWidth < 768) {
      setShowMobile(true);   // mobile → mở overlay
    } else {
      setIsCollapsed(c => !c); // desktop → thu/mở sidebar
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar NẰM TRONG FLEX — không wrapper thêm */}
      <Sidebar
        isCollapsed={isCollapsed}
        showMobile={showMobile}
        toggleMobile={() => setShowMobile(false)}
      />

      {/* Content chiếm phần còn lại */}
      <div className="flex-grow-1 d-flex flex-column bg-light" style={{ minWidth: 0 }}>
        <Header toggleSidebar={handleToggle} />
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;