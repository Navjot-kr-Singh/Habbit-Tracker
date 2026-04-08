import { useState } from 'react';
import { useHabit } from '../context/HabitContext';
import TaskCard from '../components/TaskCard';
import { Plus, CalendarDays, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

// Convert "HH:MM" to "h:MM AM/PM" display format
export function formatTimeAMPM(time24) {
  if (!time24) return null;
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

// Sort tasks by timeSlot ascending; tasks with no time go last
function sortByTime(tasks) {
  return [...tasks].sort((a, b) => {
    if (!a.timeSlot && !b.timeSlot) return 0;
    if (!a.timeSlot) return 1;
    if (!b.timeSlot) return -1;
    return a.timeSlot.localeCompare(b.timeSlot);
  });
}

const getLocalToday = () => new Date().toLocaleDateString('en-CA');

// Returns a nice label for the selected date
function formatDateLabel(dateStr) {
  const today = getLocalToday();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toLocaleDateString('en-CA');

  if (dateStr === today) return "Today's Focus";
  if (dateStr === yStr) return "Yesterday";
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

const JOURNEY_START = '2026-04-09';
const JOURNEY_DAYS  = 100;

// Calculate the journey day number (1–100) from April 9 2026
function getJourneyDay(dateStr) {
  const start = new Date(JOURNEY_START + 'T00:00:00');
  const target = new Date(dateStr + 'T00:00:00');
  const diff = Math.floor((target - start) / (1000 * 60 * 60 * 24)) + 1;
  return diff >= 1 && diff <= JOURNEY_DAYS ? diff : null;
}

export default function Today() {
  const { currentHabit, selectedDate, setSelectedDate, updateTasksForDate, dateLoading, loading } = useHabit();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime]   = useState('');

  const today = getLocalToday();

  const changeDate = (offset) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    const newDate = d.toLocaleDateString('en-CA');
    // Don't navigate forward past today
    if (newDate <= today) setSelectedDate(newDate);
  };

  const handleDateInput = (e) => {
    const picked = e.target.value; // YYYY-MM-DD
    if (picked && picked <= today) setSelectedDate(picked);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const habit = currentHabit;
  const tasks = habit?.tasks || [];
  const tasksCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const overallProgress = tasksCount === 0 ? 0 : Math.round(tasks.reduce((a, b) => a + b.progress, 0) / tasksCount);
  const journeyDay = getJourneyDay(selectedDate);

  const handleUpdate = (index, updatedTask) => {
    const newTasks = [...tasks];
    newTasks[index] = updatedTask;
    // Re-sort after any edit so time changes are reflected immediately
    const sorted = sortByTime(newTasks);
    updateTasksForDate(sorted, selectedDate);
  };

  const handleDelete = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    updateTasksForDate(newTasks, selectedDate);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      title:    newTaskTitle.trim(),
      timeSlot: newTaskTime || '',
      progress: 0,
      completed: false,
    };
    const sorted = sortByTime([...tasks, newTask]);
    updateTasksForDate(sorted, selectedDate);
    setNewTaskTitle('');
    setNewTaskTime('');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Date Navigator */}
      <div className="mb-8 bg-slate-800/60 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            title="Previous Day"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-3">
            <CalendarDays size={20} className="text-green-400" />
            <div>
              <div className="text-white font-semibold text-lg leading-tight">{formatDateLabel(selectedDate)}</div>
              <div className="text-slate-400 text-sm">{selectedDate}</div>
            </div>
          </div>

          <button
            onClick={() => changeDate(1)}
            disabled={selectedDate >= today}
            className="p-2 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Next Day"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {journeyDay && (
            <span className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-bold px-3 py-1 rounded-full">
              Day {journeyDay} / 100
            </span>
          )}
          <input
            type="date"
            value={selectedDate}
            max={today}
            onChange={handleDateInput}
            className="bg-slate-700 text-white border border-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-500 cursor-pointer"
          />
          {selectedDate !== today && (
            <button
              onClick={() => setSelectedDate(today)}
              className="text-sm text-green-400 hover:text-green-300 font-medium px-3 py-2 bg-green-500/10 hover:bg-green-500/20 rounded-xl transition-all"
            >
              Go to Today
            </button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
            {formatDateLabel(selectedDate)}
          </h1>
          <p className="text-slate-400">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-center gap-6 shadow-lg">
          <div>
            <div className="text-sm text-slate-400 mb-1">Overall Progress</div>
            <div className="text-2xl font-bold text-green-400">{overallProgress}%</div>
          </div>
          <div className="w-[1px] h-10 bg-slate-700"></div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Completed</div>
            <div className="text-2xl font-bold text-white">{completedCount}<span className="text-slate-500 text-lg">/{tasksCount}</span></div>
          </div>
          {overallProgress > 0 && (
            <>
              <div className="w-[1px] h-10 bg-slate-700"></div>
              <div>
                <div className="text-sm text-slate-400 mb-1">Status</div>
                <div className={`font-bold ${overallProgress >= 80 ? 'text-green-400' : overallProgress >= 50 ? 'text-yellow-400' : 'text-orange-400'}`}>
                  {overallProgress >= 80 ? '🔥 On Fire!' : overallProgress >= 50 ? '💪 Good' : '⚡ Keep Going'}
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Loading shimmer for date change */}
      {dateLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-36 bg-slate-800 border border-slate-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Add task form */}
          <form onSubmit={handleAddTask} className="mb-8 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder={selectedDate === today ? "What do you want to achieve today?" : `Add a task for ${selectedDate}...`}
              className="flex-1 bg-slate-800 border border-slate-700 text-white px-5 py-3 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all shadow-lg"
            />

            {/* Time Slot Picker */}
            <div className="relative flex items-center">
              <Clock size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="time"
                value={newTaskTime}
                onChange={(e) => setNewTaskTime(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white pl-9 pr-3 py-3 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all shadow-lg cursor-pointer w-full sm:w-auto"
                title="Select time slot (optional)"
              />
              {newTaskTime && (
                <button
                  type="button"
                  onClick={() => setNewTaskTime('')}
                  className="absolute right-2 text-slate-500 hover:text-slate-300 text-xs transition-colors"
                  title="Clear time"
                >✕</button>
              )}
            </div>

            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-green-900/20"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </form>

          {tasksCount === 0 ? (
            <div className="text-center py-16 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed">
              <CalendarDays className="mx-auto mb-3 text-slate-600" size={40} />
              <p className="text-slate-400 mb-2">No tasks recorded for this day.</p>
              <p className="text-sm text-slate-500">Add a task above to start logging this day's journey!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortByTime(tasks).map((task) => {
                const origIdx = tasks.indexOf(task);
                return (
                  <TaskCard
                    key={`${origIdx}-${task.timeSlot}`}
                    index={origIdx}
                    task={task}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
