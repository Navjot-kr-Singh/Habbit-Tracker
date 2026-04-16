import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';

const JOURNEY_START = new Date('2026-04-20T00:00:00');
const JOURNEY_DAYS  = 100;

// Build the full 100-day grid: Day 1 (Apr 20) → Day 100 (Jul 28)
// Days with no recorded data show as null so the line has gaps
function buildJourneyLineData(history) {
  const dataMap = {};
  history.forEach(d => {
    const p = d.tasks.length === 0 ? 0
      : Math.round(d.tasks.reduce((a, t) => a + t.progress, 0) / d.tasks.length);
    dataMap[d.date] = p;
  });

  return Array.from({ length: JOURNEY_DAYS }, (_, i) => {
    const d = new Date(JOURNEY_START);
    d.setDate(d.getDate() + i);
    const dateStr = d.toLocaleDateString('en-CA');
    const label   = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      day:      i + 1,            // 1–100
      label,                       // "Apr 1", "Apr 2" …
      date:     dateStr,
      progress: dataMap[dateStr] !== undefined ? dataMap[dateStr] : null,
    };
  });
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const LineTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-slate-900 border border-slate-600 rounded-xl shadow-xl px-4 py-3">
      <p className="text-slate-400 text-xs font-semibold mb-1">Day {d.day} · {d.label}</p>
      {d.progress !== null
        ? <p className="text-green-400 text-lg font-bold">{d.progress}% completion</p>
        : <p className="text-slate-500 text-sm italic">No data logged</p>
      }
    </div>
  );
};

const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-600 rounded-xl shadow-xl px-4 py-3">
      <p className="text-slate-300 text-sm font-semibold mb-1">{label}</p>
      <p className="text-green-400 text-lg font-bold">{payload[0].value}% avg</p>
    </div>
  );
};

export default function ProgressChart({ history }) {
  const lineData = buildJourneyLineData(history);

  // Only show x-axis ticks for logged days (don't show every single day label)
  // Show every 10th day tick
  const xTicks = lineData.filter(d => d.day % 10 === 0 || d.day === 1).map(d => d.day);

  // ── Bar chart: task averages across all logged history
  const taskStats = {};
  history.forEach(day => {
    day.tasks.forEach(task => {
      if (!taskStats[task.title]) taskStats[task.title] = { total: 0, count: 0 };
      taskStats[task.title].total += task.progress;
      taskStats[task.title].count += 1;
    });
  });

  const barData = Object.keys(taskStats)
    .map(title => ({ name: title, avg: Math.round(taskStats[title].total / taskStats[title].count) }))
    .sort((a, b) => b.avg - a.avg);

  // Only count days with actual meaningful progress (at least one task > 0%)
  const daysLogged = history.filter(d =>
    d.tasks.length > 0 && d.tasks.some(t => t.progress > 0 || t.completed)
  ).length;

  if (!history || history.length === 0) {
    return (
      <div className="p-10 text-center text-slate-500 bg-slate-800 rounded-2xl border border-slate-700">
        Log your first day to start seeing analytics!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">

      {/* Line Chart — 100-Day Journey */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2 h-6 bg-green-500 rounded-full inline-block"></span>
              100-Day Progress Journey
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Apr 20 (Day 1) → Jul 28, 2026 (Day 100) &nbsp;·&nbsp;
              <span className="text-green-400 font-medium">{daysLogged} days logged</span>
            </p>
          </div>
          <div className="bg-slate-700/50 rounded-xl px-3 py-2 text-right">
            <div className="text-green-400 font-bold text-xl">{daysLogged}<span className="text-slate-500 text-sm">/100</span></div>
            <div className="text-slate-500 text-xs">days recorded</div>
          </div>
        </div>

        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

              {/* Highlight today's position */}
              {(() => {
                const today = new Date().toLocaleDateString('en-CA');
                const todayEntry = lineData.find(d => d.date === today);
                return todayEntry ? (
                  <ReferenceLine
                    x={todayEntry.day}
                    stroke="#22c55e"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: 'Today', fill: '#22c55e', fontSize: 10, position: 'top' }}
                  />
                ) : null;
              })()}

              <XAxis
                dataKey="day"
                ticks={xTicks}
                tickFormatter={d => `Day ${d}`}
                stroke="#334155"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                dy={8}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={v => `${v}%`}
                stroke="#334155"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                dx={-4}
                width={38}
              />
              <Tooltip content={<LineTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="progress"
                stroke="#22c55e"
                strokeWidth={2.5}
                connectNulls={false}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.progress === null) return null;
                  return (
                    <circle
                      key={`dot-${payload.day}`}
                      cx={cx} cy={cy} r={3.5}
                      fill="#0f172a" stroke="#22c55e" strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 6, fill: '#22c55e', stroke: '#0f172a', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Day milestone markers legend */}
        <div className="mt-4 flex justify-between text-xs text-slate-600 px-10">
          {[1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(d => (
            <span key={d} className={d <= daysLogged ? 'text-green-600 font-semibold' : ''}>
              {d === 1 ? 'Day 1' : d === 100 ? 'Day 100' : `${d}`}
            </span>
          ))}
        </div>
      </div>

      {/* Bar Chart — Task Averages */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <h3 className="text-xl font-bold mb-1 text-slate-100 flex items-center gap-2">
          <span className="w-2 h-6 bg-slate-400 rounded-full inline-block"></span>
          Task Averages
        </h3>
        <p className="text-slate-500 text-xs mb-6">Average completion % per task across all {daysLogged} logged days</p>

        {barData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-slate-600">
            No task data yet. Log your first day to see averages.
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 40, left: 50, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis
                  type="number" domain={[0, 100]}
                  tickFormatter={v => `${v}%`}
                  stroke="#334155" tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={false} axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  dataKey="name" type="category"
                  stroke="#334155" tick={{ fill: '#cbd5e1', fontSize: 12 }}
                  tickLine={false} axisLine={false} dx={-6} width={55}
                />
                <Tooltip cursor={{ fill: '#1e293b' }} content={<BarTooltip />} />
                <Bar dataKey="avg" radius={[0, 4, 4, 0]} maxBarSize={32}>
                  {barData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.avg >= 80 ? '#22c55e' : entry.avg >= 60 ? '#16a34a' : entry.avg >= 40 ? '#166534' : '#1e293b'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </div>
  );
}
