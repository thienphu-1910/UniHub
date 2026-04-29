import React from 'react';
import { Plus, Bell, HelpCircle, Search, MoreVertical } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6">
        <div className="relative w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-transparent rounded-xl leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm shadow-sm transition-colors"
            placeholder="Search workshops, users..."
          />
        </div>
        
        <div className="flex items-center space-x-6">
          <button className="text-gray-400 hover:text-gray-500 relative">
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            <Bell className="h-6 w-6" />
          </button>
          <button className="text-gray-400 hover:text-gray-500">
            <HelpCircle className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2 border-l pl-6 border-gray-200">
            <img
              className="h-9 w-9 rounded-full object-cover border border-gray-200"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="Admin avatar"
            />
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>
        </div>
      </div>

      {/* Page Title & Action */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back. Here's what's happening today.</p>
        </div>
        <button className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#0a2540] hover:bg-[#163a5f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add New Workshop
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 p-6 flex flex-col justify-between relative group hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Total Workshops</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-800">
                This Month
              </span>
            </div>
            <div className="mt-4 text-4xl font-extrabold text-[#0a2540]">42</div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              +12%
            </span>
            <span className="text-gray-500 ml-2">vs last month</span>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 p-6 flex flex-col justify-between relative group hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Active Students</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-800">
                Current
              </span>
            </div>
            <div className="mt-4 text-4xl font-extrabold text-blue-600">1,284</div>
          </div>
          <div className="mt-4 flex items-center text-sm">
             <span className="text-green-600 font-medium flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              +5%
            </span>
            <span className="text-gray-500 ml-2">vs last week</span>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 p-6 flex flex-col justify-between relative group hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Check-ins Today</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 animate-pulse"></span>
                Live
              </span>
            </div>
            <div className="mt-4 text-4xl font-extrabold text-gray-900">356</div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">Across 8 active workshops</span>
          </div>
        </div>
      </div>

      {/* Workshop List Placeholder */}
      <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-semibold text-gray-900">Workshop Management</h3>
            <p className="mt-1 text-sm text-gray-500">Upcoming and currently running sessions.</p>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-4">Workshop Name</div>
          <div className="col-span-2">Date & Time</div>
          <div className="col-span-2">Facilitator</div>
          <div className="col-span-2">Registered</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3].map((item) => (
            <div key={item} className="px-6 py-5 grid grid-cols-12 gap-4 items-center hover:bg-gray-50/50 transition-colors">
              <div className="col-span-4 flex items-center space-x-4">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <span className="font-bold">&lt;/&gt;</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Advanced Python Data Structures</div>
                  <div className="text-xs text-gray-500 mt-0.5">Room 402, Engineering Bldg</div>
                </div>
              </div>
              <div className="col-span-2 text-sm text-gray-600">
                <div className="font-medium text-gray-900">Oct 24, 2023</div>
                <div className="text-xs mt-0.5">10:00 AM - 12:00 PM</div>
              </div>
              <div className="col-span-2 flex items-center space-x-2">
                <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">JS</div>
                <span className="text-sm text-gray-700">Dr. J. Smith</span>
              </div>
              <div className="col-span-2 flex items-center space-x-3">
                <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[80px]">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <span className="text-xs font-medium text-gray-700">45/45</span>
              </div>
              <div className="col-span-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Full
                </span>
              </div>
              <div className="col-span-1 text-right">
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
