import { useState, useRef, useEffect } from 'react';
import { useHabit } from '../context/HabitContext';
import { Bell, BookOpen, Clock, ChevronRight, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationBell() {
  const { todayRevisions } = useHabit();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const count = todayRevisions?.length || 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all active:scale-95"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white border-2 border-slate-950">
            {count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/20">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Today's Revisions
            </h3>
            {count > 0 && (
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 font-bold uppercase tracking-wider">
                {count} Due
              </span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {count > 0 ? (
              <div className="divide-y divide-slate-800/50">
                {todayRevisions.map((rev, idx) => (
                  <div key={idx} className="p-4 hover:bg-slate-900/40 transition-colors group">
                    <div className="flex gap-3">
                      <div className="mt-1 p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                          {rev.topic}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          Original session: {rev.hourRange}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[9px] font-bold uppercase tracking-tight px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                            {rev.revisionType?.replace('rev', 'Review ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="p-3 bg-slate-900/50 rounded-2xl border border-slate-800 w-fit mx-auto mb-4">
                  <Inbox className="w-8 h-8 text-slate-700" />
                </div>
                <p className="text-slate-200 font-medium mb-1">Stay sharp!</p>
                <p className="text-slate-500 text-xs">No topics scheduled for revision today.</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-900/20 border-t border-slate-800">
            <Link
              to="/analytics"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all group"
            >
              Open Ebbinghaus Analytics
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
