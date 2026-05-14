import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';

const DashboardLayout = () => {
  // Simple check for auth state based on localStorage set during login
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen relative">
        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
