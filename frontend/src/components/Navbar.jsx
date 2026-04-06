import { Link, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { CheckCircle2, TrendingUp, Calendar, Flame } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: "Daily Dashboard", path: '/', icon: <CheckCircle2 size={18} /> },
    { name: 'Plan', path: '/plan', icon: <Calendar size={18} /> },
    { name: '100-Day Journey', path: '/journey', icon: <Flame size={18} /> },
    { name: 'Habit Tracker', path: '/tracker', icon: <Calendar size={18} /> },
    { name: 'Analytics', path: '/analytics', icon: <TrendingUp size={18} /> },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 cursor-pointer shrink-0">
          <div className="bg-green-500 p-1.5 rounded-lg flex items-center justify-center">
            <CheckCircle2 color="#0f172a" size={24} className="stroke-[3]" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Habit<span className="text-green-500 font-extrabold">Track</span>
          </span>
        </Link>

        <div className="flex bg-slate-800/50 p-1 rounded-2xl mx-4 overflow-x-auto no-scrollbar">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {link.icon}
                <span className="hidden md:inline-block">{link.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <NotificationBell />
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "h-9 w-9 border-2 border-slate-800 hover:border-green-500 transition-colors"
              }
            }}
          />
        </div>
      </div>
    </nav>
  );
}
