import { useState, useRef, useEffect } from 'react';

// ─── Date range: Apr 6 → Dec 31, 2026 ────────────────────────────────────────
const JOURNEY_START = new Date('2026-04-11T00:00:00');
const JOURNEY_END   = new Date('2026-12-31T00:00:00');
const JOURNEY_DAYS  = Math.floor((JOURNEY_END - JOURNEY_START) / 86400000) + 1; // 272

const WEEKDAYS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS    = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const LABEL_W   = 30; // px reserved for weekday labels
const GAP       = 3;  // px between cells

const getColor = (progress, isFuture) => {
  if (isFuture)        return '#0f172a';
  if (progress === 0)  return '#1e293b';
  if (progress <= 20)  return '#14532d';
  if (progress <= 40)  return '#166534';
  if (progress <= 60)  return '#15803d';
  if (progress <= 80)  return '#16a34a';
  return '#22c55e';
};

export default function Heatmap({ history }) {
  const [tooltip, setTooltip]   = useState(null);
  const [cellSize, setCellSize] = useState(12);
  const containerRef            = useRef(null);

  // Build lookup
  const dataMap = {};
  history.forEach(d => { dataMap[d.date] = d; });

  // Build 275-day array
  const today = new Date().toLocaleDateString('en-CA');
  const days  = Array.from({ length: JOURNEY_DAYS }, (_, i) => {
    const d       = new Date(JOURNEY_START);
    d.setDate(d.getDate() + i);
    const dateStr = d.toLocaleDateString('en-CA');
    const record  = dataMap[dateStr];
    const tasks   = record?.tasks || [];
    const total   = tasks.reduce((a, t) => a + t.progress, 0);
    const overall = tasks.length ? Math.round(total / tasks.length) : 0;
    return {
      date: dateStr,
      dayOfWeek: d.getDay(),
      month: d.getMonth(),
      dayNum: d.getDate(),
      overall,
      completedTasks: tasks.filter(t => t.completed).length,
      totalTasks: tasks.length,
      tasks,
      isToday:  dateStr === today,
      isFuture: dateStr > today,
    };
  });

  // Grid layout: Apr 1 2026 = Wednesday = index 3
  const startDOW = JOURNEY_START.getDay(); // 3
  const numCols  = Math.ceil((startDOW + JOURNEY_DAYS) / 7); // 40

  // Compute cell size to fill container width
  useEffect(() => {
    const compute = () => {
      if (!containerRef.current) return;
      const available = containerRef.current.clientWidth - LABEL_W;
      const size      = Math.max(8, Math.floor((available - (numCols - 1) * GAP) / numCols));
      setCellSize(size);
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [numCols]);

  // Build column array
  const columns = Array.from({ length: numCols }, () => Array(7).fill(null));
  days.forEach((day, i) => {
    const slot = startDOW + i;
    columns[Math.floor(slot / 7)][slot % 7] = day;
  });

  // Month label positions
  const monthLabels = [];
  let lastMonth = -1;
  columns.forEach((col, ci) => {
    const first = col.find(d => d !== null);
    if (first && first.month !== lastMonth) {
      monthLabels.push({ col: ci, label: MONTHS[first.month] });
      lastMonth = first.month;
    }
  });

  const MONTH_H  = 18;
  const GRID_H   = 7 * cellSize + 6 * GAP;
  const YEAR_H   = 20;

  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="w-2 h-6 bg-green-500 rounded-full inline-block"></span>
          Contribution Heatmap
        </h3>
        <span className="text-slate-400 font-bold text-lg tracking-wider">2026</span>
      </div>
      <p className="text-slate-500 text-xs mb-5">Apr 11 → Dec 31, 2026 · Hover any day for details</p>

      {/* Grid */}
      <div ref={containerRef} style={{ width: '100%', userSelect: 'none' }}>
        <div style={{ position: 'relative', paddingTop: YEAR_H + MONTH_H, paddingLeft: LABEL_W }}>

          {/* Month labels */}
          {monthLabels.map(({ col, label }) => (
            <span
              key={col + label}
              style={{
                position: 'absolute',
                top: YEAR_H,
                left: LABEL_W + col * (cellSize + GAP),
                fontSize: 10,
                color: '#94a3b8',
                fontWeight: 600,
                lineHeight: `${MONTH_H}px`,
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </span>
          ))}

          {/* Weekday labels */}
          {[1, 3, 5].map(row => (
            <span
              key={row}
              style={{
                position: 'absolute',
                top: YEAR_H + MONTH_H + row * (cellSize + GAP),
                left: 0,
                width: LABEL_W - 4,
                fontSize: 9,
                color: '#64748b',
                lineHeight: `${cellSize}px`,
                textAlign: 'right',
                fontWeight: 500,
              }}
            >
              {WEEKDAYS[row]}
            </span>
          ))}

          {/* Cell grid */}
          <div style={{ display: 'flex', gap: GAP }}>
            {columns.map((col, ci) => (
              <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                {col.map((day, ri) => {
                  if (!day) {
                    return (
                      <div
                        key={ri}
                        style={{ width: cellSize, height: cellSize, borderRadius: 2, flexShrink: 0 }}
                      />
                    );
                  }
                  return (
                    <div
                      key={ri}
                      onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, day })}
                      onMouseMove={(e)  => setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                      onMouseLeave={()  => setTooltip(null)}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        borderRadius: 2,
                        background: getColor(day.overall, day.isFuture),
                        outline: day.isToday ? '2px solid #22c55e' : 'none',
                        outlineOffset: 1,
                        cursor: day.isFuture ? 'not-allowed' : 'pointer',
                        transition: 'transform 0.1s, opacity 0.1s',
                        flexShrink: 0,
                      }}
                      onMouseOver={e => { if (!day.isFuture) e.currentTarget.style.transform = 'scale(1.4)'; }}
                      onMouseOut={e  => { e.currentTarget.style.transform = 'scale(1)'; }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-slate-600 text-xs">Hover a cell to see task details</span>
        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <span>Less</span>
          {['#1e293b','#14532d','#166534','#15803d','#16a34a','#22c55e'].map(c => (
            <div key={c} style={{ width: 11, height: 11, borderRadius: 2, background: c, flexShrink: 0 }} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Tooltip (fixed to viewport) */}
      {tooltip && <HeatmapTooltip tooltip={tooltip} />}
    </div>
  );
}

function HeatmapTooltip({ tooltip }) {
  const { x, y, day } = tooltip;
  const left = Math.min(x + 12, window.innerWidth - 295);
  const top  = Math.max(y - 20, 8);

  const fmt = (ds) =>
    new Date(ds + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });

  return (
    <div
      style={{
        position: 'fixed', left, top,
        transform: 'translateY(-100%)',
        zIndex: 9999, pointerEvents: 'none',
        minWidth: 230, maxWidth: 280,
      }}
    >
      <div className="bg-slate-900 border border-slate-600 rounded-2xl shadow-2xl shadow-black/60 p-4">
        {/* Date + ring */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-700/60">
          <div>
            <div className="text-white font-semibold text-sm">{fmt(day.date)}</div>
            <div className="text-xs mt-0.5">
              {day.isFuture ? (
                <span className="text-slate-500 italic">🔒 Future day</span>
              ) : day.totalTasks === 0 ? (
                <span className="text-slate-500">No tasks logged</span>
              ) : (
                <span className="text-slate-400">
                  {day.totalTasks} tasks ·{' '}
                  <span className="text-green-400 font-semibold">{day.overall}% overall</span>
                </span>
              )}
            </div>
          </div>
          {!day.isFuture && day.totalTasks > 0 && (
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: `conic-gradient(#22c55e ${day.overall}%, #1e293b ${day.overall}%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', background: '#0f172a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 8, fontWeight: 800, color: '#22c55e' }}>{day.overall}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Task list */}
        {!day.isFuture && day.tasks.length > 0 ? (
          <ul className="space-y-2">
            {day.tasks.map((task, i) => (
              <li key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={`font-medium truncate ${task.completed ? 'text-green-400' : 'text-slate-200'}`}>
                    {task.completed ? '✅' : '⏳'} {task.title}
                  </span>
                  <span className="ml-2 font-bold shrink-0" style={{
                    color: task.progress >= 80 ? '#22c55e' : task.progress >= 50 ? '#eab308' : '#94a3b8'
                  }}>
                    {task.progress}%
                  </span>
                </div>
                <div style={{ height: 4, background: '#1e293b', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${task.progress}%`, borderRadius: 999,
                    background: task.progress >= 80 ? '#22c55e' : task.progress >= 50 ? '#eab308' : '#3b82f6',
                  }} />
                </div>
              </li>
            ))}
          </ul>
        ) : !day.isFuture ? (
          <p className="text-slate-600 text-xs text-center py-1">No tasks logged.</p>
        ) : null}

        {/* Footer */}
        {!day.isFuture && day.totalTasks > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700/60 flex justify-between text-xs text-slate-400">
            <span>✅ {day.completedTasks} done</span>
            <span>⏳ {day.totalTasks - day.completedTasks} remaining</span>
          </div>
        )}
      </div>
    </div>
  );
}
