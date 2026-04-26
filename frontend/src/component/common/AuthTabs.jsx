import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AuthTabs = () => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="flex bg-slate-100 p-1 rounded-lg mb-8 md:mb-12 w-[fit-content]">
      <Link 
        to="/login" 
        className={`px-6 py-2 rounded-md text-sm transition-all focus:outline-none ${
          isLogin 
            ? 'bg-white text-slate-800 font-semibold shadow-[0_2px_8px_rgb(0,0,0,0.08)]' 
            : 'text-slate-500 font-medium hover:text-slate-700'
        }`}
      >
        Log In
      </Link>
      <Link 
        to="/register" 
        className={`px-6 py-2 rounded-md text-sm transition-all focus:outline-none ${
          !isLogin 
            ? 'bg-white text-slate-800 font-semibold shadow-[0_2px_8px_rgb(0,0,0,0.08)]' 
            : 'text-slate-500 font-medium hover:text-slate-700'
        }`}
      >
        Sign Up
      </Link>
    </div>
  );
};

export default AuthTabs;
