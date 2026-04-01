import { useHabit } from '../context/HabitContext';
import Heatmap from '../components/Heatmap';
import { Flame, Calendar, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function Tracker() {
  const { history, journey, loading } = useHabit();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Current streak — count consecutive days going back from today that have > 0% progress
  let streak = 0;
  const reversedHistory = [...history].reverse();
  for (const day of reversedHistory) {
    const overallProgress = day.tasks.length === 0 ? 0
      : Math.round(day.tasks.reduce((acc, t) => acc + t.progress, 0) / day.tasks.length);
    if (overallProgress > 0) streak++;
    else break;
  }

  // Best day progress
  let bestDay = null;
  let bestProgress = 0;
  for (const day of history) {
    const p = day.tasks.length === 0 ? 0
      : Math.round(day.tasks.reduce((acc, t) => acc + t.progress, 0) / day.tasks.length);
    if (p > bestProgress) { bestProgress = p; bestDay = day.date; }
  }

  // Overall average
  const daysWithData = history.filter(d => d.tasks.length > 0);
  const avgProgress = daysWithData.length === 0 ? 0
    : Math.round(daysWithData.reduce((acc, d) => {
        return acc + Math.round(d.tasks.reduce((a, t) => a + t.progress, 0) / d.tasks.length);
      }, 0) / daysWithData.length);

  // Journey progress (days logged out of 100)
  const journeyLogged = journey.filter(d => !d._placeholder && d.tasks.length > 0).length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
          Habit Heatmap
        </h1>
        <p className="text-slate-400 text-lg">
          Apr 1 → Dec 31, 2026 &nbsp;·&nbsp;{' '}
          Consistency is the key to mastery.{' '}
          {streak > 0
            ? <span>You are on a <span className="font-bold text-green-400">🔥 {streak}-day streak!</span> Keep it up.</span>
            : <span>Log today's progress to start your streak!</span>
          }
        </p>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-xl">
            <Flame size={22} className="text-orange-400" />
          </div>
          <div>
            <div className="text-slate-400 text-xs">Current Streak</div>
            <div className="text-xl font-bold text-white">{streak} days</div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-xl">
            <Calendar size={22} className="text-green-400" />
          </div>
          <div>
            <div className="text-slate-400 text-xs">Total Days Logged</div>
            <div className="text-xl font-bold text-white">{history.length}</div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <TrendingUp size={22} className="text-blue-400" />
          </div>
          <div>
            <div className="text-slate-400 text-xs">Average Progress</div>
            <div className="text-xl font-bold text-white">{avgProgress}%</div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-xl">
            <CheckCircle2 size={22} className="text-purple-400" />
          </div>
          <div>
            <div className="text-slate-400 text-xs">Journey Progress</div>
            <div className="text-xl font-bold text-white">{journeyLogged}<span className="text-slate-500 text-base">/100</span></div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <Heatmap history={history} />

      {/* Best day callout */}
      {bestDay && (
        <div className="mt-6 bg-green-950/30 border border-green-800/40 rounded-2xl p-4 flex items-center gap-4">
          <span className="text-3xl">🏆</span>
          <div>
            <div className="text-green-400 font-semibold">Best Day</div>
            <div className="text-slate-300 text-sm">
              {new Date(bestDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} — <span className="font-bold text-green-400">{bestProgress}%</span> overall progress
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
