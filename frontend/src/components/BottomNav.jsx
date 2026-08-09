import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, Trophy } from 'lucide-react';

const BottomNav = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Log', path: '/log-trip', icon: PlusCircle },
    { name: 'History', path: '/history', icon: History },
    { name: 'Badges', path: '/badges', icon: Trophy },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-warm-200 py-2 px-6 flex justify-around items-center z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-3 transition-colors duration-200 ${
                isActive ? 'text-forest-500 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] tracking-wide">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
