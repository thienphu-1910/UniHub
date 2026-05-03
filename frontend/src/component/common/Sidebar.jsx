import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Settings, HelpCircle } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/home', icon: LayoutDashboard },
    { name: 'Workshops', path: '/workshops', icon: Calendar },
   // { name: 'Users', path: '/users', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-[#0a2540] text-slate-300 flex flex-col h-screen fixed top-0 left-0 shadow-xl z-20">
      {/* Logo Area */}
      <div className="p-6 flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
          <span className="text-lg font-bold">UH</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white leading-tight tracking-wide">UniHub</h1>
          <p className="text-[10px] text-blue-200 uppercase tracking-wider font-medium">Workshop Management</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-4 overflow-y-auto">
        <ul className="space-y-1.5">
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#163a5f] text-white shadow-inner font-semibold'
                      : 'hover:bg-[#163a5f]/50 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5 opacity-90 group-hover:opacity-100" />
                <span className="text-sm tracking-wide">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer Area */}
      <div className="p-4 mt-auto">
        <div className="border-t border-slate-700/50 pt-4">
          <NavLink
            to="/help"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-[#163a5f] text-white shadow-inner font-semibold'
                  : 'hover:bg-[#163a5f]/50 hover:text-white'
              }`
            }
          >
            <HelpCircle className="w-5 h-5 opacity-90 group-hover:opacity-100" />
            <span className="text-sm tracking-wide">Help Center</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
