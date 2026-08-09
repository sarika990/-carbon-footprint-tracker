import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, Trophy, LogOut, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Log Commute', path: '/log-trip', icon: PlusCircle },
    { name: 'Trip History', path: '/history', icon: History },
    { name: 'Badges & Stats', path: '/badges', icon: Trophy },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-warm-200 h-full fixed left-0 top-0 text-slate-700">
      {/* Brand header */}
      <div className="p-6 border-b border-warm-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-forest-500 flex items-center justify-center text-white shadow-md shadow-forest-500/20">
          <Leaf className="w-5 h-5 fill-current" />
        </div>
        <div>
          <h2 className="font-display font-bold text-lg text-slate-800 leading-none">CarbonPath</h2>
          <span className="text-[10px] text-forest-500 font-bold tracking-wider uppercase">Eco Tracker</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-forest-500 text-white shadow-md shadow-forest-500/10'
                    : 'text-slate-600 hover:bg-warm-100 hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User profile footer card */}
      <div className="p-4 border-t border-warm-200 bg-warm-50/50">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center font-display font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-warm-200 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
