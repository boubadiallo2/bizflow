import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import './Layout.css';

export const Layout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="layout">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div className={`main-wrapper ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <Header />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
