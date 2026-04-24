import { useState, useRef, useEffect } from 'react';
import { useHabit } from '../context/HabitContext';
import { Bell, BookOpen, Clock, ChevronRight, Inbox, Code2, Server, Brain, Layout, Database, Cpu, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORY_META = {
  'DSA':            { label: 'DSA',          color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   Icon: Code2 },
  'OOPS':           { label: 'OOPS',         color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', Icon: Cpu },
  'CORE-Subject':   { label: 'CORE Subject', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', Icon: Database },
  'DevOps':         { label: 'DevOps',       color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20',  Icon: Server },
  'AI/ML':          { label: 'AI/ML',        color: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/20',   Icon: Brain },
  'System Design':  { label: 'System Design',color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', Icon: Layout },
  'WEB-DEV':        { label: 'WEB-DEV',      color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', Icon: Globe },
};

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

  // Group by category
  const grouped = {};
  (todayRevisions || []).forEach(rev => {
    const cat = rev.category || 'DSA';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(rev);
  });

  const revLabel = (type) => {
    if (type === 'rev1') return 'Day +1';
    if (type === 'rev2') return 'Day +3';
    if (type === 'rev3') return 'Day +7';
    return type || '';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all active:scale-95"
        title="Today's revisions"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white border-2 border-slate-950">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          {/* Title bar */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/30">
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

          <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
            {count > 0 ? (
              <div className="divide-y divide-slate-800/50">
                {Object.entries(grouped).map(([cat, revs]) => {
                  const meta = CATEGORY_META[cat] || CATEGORY_META['DSA'];
                  const CatIcon = meta.Icon;
                  return (
                    <div key={cat} className="px-4 py-3">
                      {/* Category header */}
                      <div className={`flex items-center gap-2 mb-2 pb-1.5 border-b ${meta.border}`}>
                        <CatIcon className={`w-3.5 h-3.5 ${meta.color}`} />
                        <span className={`text-[11px] font-bold uppercase tracking-widest ${meta.color}`}>
                          {meta.label}
                        </span>
                        <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full ${meta.bg} ${meta.color} border ${meta.border}`}>
                          {revs.length}
                        </span>
                      </div>
                      {/* Items */}
                      {revs.map((rev, idx) => (
                        <div key={idx} className={`flex items-start gap-3 p-2.5 rounded-xl ${meta.bg} border ${meta.border} mb-2 last:mb-0`}>
                          <Clock className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${meta.color}`} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-200 truncate leading-tight">
                              {rev.topic}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 ${meta.color}`}>
                                {revLabel(rev.revisionType)}
                              </span>
                              <span className="text-[10px] text-slate-600">
                                orig: {rev.originalDate}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="p-3 bg-slate-900/50 rounded-2xl border border-slate-800 w-fit mx-auto mb-4">
                  <Inbox className="w-8 h-8 text-slate-700" />
                </div>
                <p className="text-slate-200 font-medium mb-1">All clear!</p>
                <p className="text-slate-500 text-xs">No topics scheduled for revision today.</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-900/20 border-t border-slate-800">
            <Link
              to="/revision"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all group"
            >
              Open Revision Hub
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
