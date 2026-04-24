import { useState, useMemo } from 'react';
import { useHabit } from '../context/HabitContext';
import {
  Plus, BookOpen, Clock, CheckCircle2, AlertCircle,
  Code2, Server, Brain, Layout, Database, Cpu, Globe
} from 'lucide-react';

// ─── Section Definitions ─────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'DSA',
    label: 'DSA',
    subtitle: 'Data Structures & Algorithms',
    icon: Code2,
    color: 'from-blue-600 to-cyan-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    ring: 'ring-blue-500/40',
  },
  {
    id: 'OOPS',
    label: 'OOPS',
    subtitle: 'Object Oriented Programming',
    icon: Cpu,
    color: 'from-purple-600 to-violet-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    ring: 'ring-purple-500/40',
  },
  {
    id: 'CORE-Subject',
    label: 'CORE Subject',
    subtitle: 'OS · DBMS · CN · Compiler Design',
    icon: Database,
    color: 'from-orange-600 to-amber-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    ring: 'ring-orange-500/40',
  },
  {
    id: 'DevOps',
    label: 'DevOps',
    subtitle: 'Docker · K8s · CI/CD · Linux',
    icon: Server,
    color: 'from-green-600 to-emerald-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    ring: 'ring-green-500/40',
  },
  {
    id: 'AI/ML',
    label: 'AI / ML',
    subtitle: 'Machine Learning · Deep Learning · NLP',
    icon: Brain,
    color: 'from-pink-600 to-rose-500',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    ring: 'ring-pink-500/40',
  },
  {
    id: 'System Design',
    label: 'System Design',
    subtitle: 'LLD · HLD · Patterns',
    icon: Layout,
    color: 'from-yellow-600 to-amber-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    ring: 'ring-yellow-500/40',
  },
  {
    id: 'WEB-DEV',
    label: 'WEB-DEV',
    subtitle: 'Frontend + Backend',
    icon: Globe,
    color: 'from-indigo-600 to-sky-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
    ring: 'ring-indigo-500/40',
  },
];

// ─── Single Section Card ──────────────────────────────────────────────────────
function SectionCard({ section, sessions, onAdd }) {
  const [topic, setTopic]       = useState('');
  const [timeStart, setStart]   = useState('08:00');
  const [timeEnd, setEnd]       = useState('09:00');
  const [submitting, setSubmit] = useState(false);
  const [error, setError]       = useState('');
  const [open, setOpen]         = useState(false);

  const Icon = section.icon;

  // Sessions that belong to this section
  const mySessions = useMemo(
    () => sessions.filter(s => s.category === section.id).slice(0, 50),
    [sessions, section.id]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return setError('Please enter a topic');
    setSubmit(true);
    setError('');
    try {
      await onAdd({
        date: new Date().toLocaleDateString('en-CA'),
        hourRange: `${timeStart} - ${timeEnd}`,
        topic: topic.trim(),
        category: section.id,
      });
      setTopic('');
    } catch {
      setError('Failed to save. Try again.');
    } finally {
      setSubmit(false);
    }
  };

  return (
    <div className={`rounded-2xl border ${section.border} bg-slate-900/60 backdrop-blur-md shadow-xl overflow-hidden transition-all`}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 group"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl ${section.bg} border ${section.border}`}>
            <Icon className={`w-5 h-5 ${section.text}`} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{section.label}</h2>
              {mySessions.length > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${section.bg} ${section.text} border ${section.border}`}>
                  {mySessions.length} logged
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{section.subtitle}</p>
          </div>
        </div>
        <div className={`transition-transform duration-200 ${open ? 'rotate-45' : ''}`}>
          <Plus className={`w-5 h-5 ${section.text}`} />
        </div>
      </button>

      {/* Expandable body */}
      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-slate-800/60">
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="pt-4 space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                What did you study today?
              </label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder={`e.g. ${section.id === 'DSA' ? 'Sliding Window + Two Pointers' : section.subtitle.split('·')[0].trim()}...`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Start</label>
                <input
                  type="time"
                  value={timeStart}
                  onChange={e => setStart(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">End</label>
                <input
                  type="time"
                  value={timeEnd}
                  onChange={e => setEnd(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full bg-gradient-to-r ${section.color} text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm`}
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Log &amp; Schedule Revision
                </>
              )}
            </button>
          </form>

          {/* Recent sessions for this section */}
          {mySessions.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-widest font-semibold text-slate-600 mb-2">
                Recent Sessions
              </p>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                {mySessions.map((s, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${section.bg} border ${section.border}`}>
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${section.text}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{s.topic}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {s.date} · {s.hourRange}
                      </p>
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {s.revisionDates?.map((rd, j) => (
                          <span
                            key={j}
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              rd.completed
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}
                          >
                            Rev {j + 1} · {rd.date?.slice(5)} {rd.completed ? '✓' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Revision Page ───────────────────────────────────────────────────────
export default function Revision() {
  const { learningSessions, addLearningSession, loading } = useHabit();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const totalLogged = learningSessions.length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
            <BookOpen className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-slate-400">
              Revision Hub
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Log what you study · Auto-scheduled: Day+1, Day+3, Day+7
            </p>
          </div>
        </div>

        {/* Summary strip */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Logged', value: totalLogged, color: 'text-white' },
            { label: 'Sections', value: SECTIONS.length, color: 'text-indigo-400' },
            { label: 'Rev Schedule', value: '+1 · +3 · +7', color: 'text-green-400' },
            { label: 'System', value: 'Ebbinghaus', color: 'text-purple-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-center">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </header>

      {/* Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTIONS.map(section => (
          <SectionCard
            key={section.id}
            section={section}
            sessions={learningSessions}
            onAdd={addLearningSession}
          />
        ))}
      </div>
    </div>
  );
}
