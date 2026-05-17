import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import { userStore } from '../../store/useAuthStore';

const DashboardLayout = () => {
  // Simple check for auth state based on localStorage set during login
  const user = userStore((state) => state.user)

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-full bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col relative">
        {/* Main Content Area */}
        <main className="flex-1 p-8  w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
