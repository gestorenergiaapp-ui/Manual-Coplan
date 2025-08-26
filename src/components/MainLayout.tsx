import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useContent } from '../hooks/useContent';
import { useAuth } from '../hooks/useAuth';

const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-screen w-screen bg-brand-light">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-secondary"></div>
    </div>
);


const MainLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { loading: contentLoading } = useContent();
  const { loading: authLoading } = useAuth();


  const handleToggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  if (contentLoading || authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen bg-brand-light">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onToggleSidebar={handleToggleSidebar}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-light p-4 sm:p-6 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;