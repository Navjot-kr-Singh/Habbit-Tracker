import { useHabit } from '../context/HabitContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Flame, Lock } from 'lucide-react';

const JOURNEY_START = '2026-04-20';
const JOURNEY_DAYS  = 100;
const JOURNEY_END_DATE = (() => {
  const d = new Date(JOURNEY_START + 'T00:00:00');
  d.setDate(d.getDate() + JOURNEY_DAYS - 1);
  return d.toLocaleDateString('en-CA');
})();

const getLocalToday = () => new Date().toLocaleDateString('en-CA');

function DayCard({ day, dayNumber, onClick }) {
  const totalProgress = day.tasks.length === 0 ? 0
    : Math.round(day.tasks.reduce((acc, t) => acc + t.progress, 0) / day.tasks.length);
  const completedCount = day.tasks.filter(t => t.completed).length;
  const totalTasks = day.tasks.length;
  const isPlaceholder = day._placeholder || totalTasks === 0;
  const today = getLocalToday();
  const isFuture = day.date > today;

  const getBgColor = () => {
    if (isFuture) return 'bg-slate-900/50 border-slate-800 opacity-40 cursor-not-allowed';
    if (totalProgress === 0) return 'bg-slate-800 border-slate-700';
    if (totalProgress <= 25) return 'bg-green-950/60 border-green-900/60';
    if (totalProgress <= 50) return 'bg-green-900/40 border-green-800/60';
    if (totalProgress <= 75) return 'bg-green-800/40 border-green-700/60';
    return 'bg-green-700/30 border-green-500/60 shadow-green-900/20 shadow-lg';
  };

  return (
    <button
      onClick={isFuture ? undefined : onClick}
      disabled={isFuture}
      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center group ${
        isFuture ? getBgColor() : `${getBgColor()} hover:scale-105 hover:shadow-lg cursor-pointer`
      } ${day.date === today ? 'ring-2 ring-green-500' : ''}`}
      title={isFuture ? `Day ${dayNumber} — unlocks on ${day.date}` : `${day.date}: ${totalProgress}% overall`}
    >
      <span className="text-xs text-slate-500 font-medium mb-1">Day {dayNumber}</span>
      <span className="text-[10px] text-slate-600 mb-2">{day.date.slice(5)}</span>
      {isFuture ? (
        <Lock size={16} className="text-slate-700" />
      ) : isPlaceholder ? (
        <Circle size={20} className="text-slate-700 group-hover:text-slate-500 transition-colors" />
      ) : totalProgress === 100 ? (
        <Flame size={20} className="text-green-400" />
      ) : (
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
          background: `conic-gradient(#22c55e ${totalProgress}%, #1e293b ${totalProgress}%)`
        }}>
          <div className="w-7 h-7 bg-slate-900 rounded-full flex items-center justify-center">
            <span className="text-[9px] font-bold text-white">{totalProgress}%</span>
          </div>
        </div>
      )}
      {!isPlaceholder && !isFuture && (
        <span className="mt-1 text-[10px] text-slate-400">{completedCount}/{totalTasks}</span>
      )}
      {day.date === today && (
        <span className="absolute -top-2 text-[9px] bg-green-500 text-black font-bold px-1.5 py-0.5 rounded-full">TODAY</span>
      )}
    </button>
  );
}

export default function JourneyPage() {
  const { journey, loading, setSelectedDate } = useHabit();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const daysWithData = journey.filter(d => !d._placeholder && d.tasks.length > 0);
  const totalProgress = daysWithData.length === 0 ? 0
    : Math.round(daysWithData.reduce((acc, day) => {
        const dp = day.tasks.length === 0 ? 0
          : Math.round(day.tasks.reduce((a, t) => a + t.progress, 0) / day.tasks.length);
        return acc + dp;
      }, 0) / daysWithData.length);

  const handleDayClick = (day) => {
    setSelectedDate(day.date);
    navigate('/');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
            🔥 100-Day Journey
          </h1>
          <p className="text-slate-400">
            Apr 20 → Jul 28, 2026 &nbsp;·&nbsp; Click any past day to view or edit. Future days are locked.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{daysWithData.length}</div>
            <div className="text-xs text-slate-400 mt-1">Days Logged</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{100 - daysWithData.length}</div>
            <div className="text-xs text-slate-400 mt-1">Remaining</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{totalProgress}%</div>
            <div className="text-xs text-slate-400 mt-1">Avg Progress</div>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="mb-8 bg-slate-800 border border-slate-700 rounded-2xl p-5">
        <div className="flex justify-between text-sm mb-3">
          <span className="text-slate-400 font-medium">Journey Progress</span>
          <span className="text-green-400 font-bold">{daysWithData.length} / 100 days</span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-700"
            style={{ width: `${daysWithData.length}%` }}
          />
        </div>
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {journey.map((day, index) => (
          <DayCard
            key={day.date}
            day={day}
            dayNumber={index + 1}
            onClick={() => handleDayClick(day)}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-slate-700"></div> Not started</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-green-900"></div> 1–25%</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-green-700"></div> 26–50%</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-green-600"></div> 51–75%</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-green-500"></div> 76–100%</div>
      </div>
    </div>
  );
}
