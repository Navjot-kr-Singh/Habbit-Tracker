import { useState } from 'react';
import { Edit2, Trash2, CheckCircle, Circle, Clock, X } from 'lucide-react';
import { formatTimeAMPM } from '../pages/Today';

export default function TaskCard({ task, index, onUpdate, onDelete }) {
  const [isEditing, setIsEditing]       = useState(false);
  const [editTitle, setEditTitle]       = useState(task.title);
  const [editTime, setEditTime]         = useState(task.timeSlot || '');
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleProgressChange = (e) => {
    let newProgress = parseInt(e.target.value);
    let isCompleted = task.completed;
    if (newProgress === 100) isCompleted = true;
    if (newProgress < 100 && task.completed) isCompleted = false;
    onUpdate(index, { ...task, progress: newProgress, completed: isCompleted });
  };

  const toggleComplete = () => {
    const isCompleted = !task.completed;
    onUpdate(index, { ...task, completed: isCompleted, progress: isCompleted ? 100 : 0 });
  };

  const handleTitleSave = () => {
    if (editTitle.trim()) {
      onUpdate(index, { ...task, title: editTitle.trim(), timeSlot: editTime });
      setIsEditing(false);
    }
  };

  const handleTimeSave = (newTime) => {
    setEditTime(newTime);
    onUpdate(index, { ...task, timeSlot: newTime });
    setShowTimePicker(false);
  };

  const handleClearTime = (e) => {
    e.stopPropagation();
    setEditTime('');
    onUpdate(index, { ...task, timeSlot: '' });
  };

  const displayTime = formatTimeAMPM(task.timeSlot);

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 ${task.completed ? 'bg-green-900/10 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.05)]' : 'bg-slate-800 border-slate-700 hover:border-slate-600 shadow-lg'}`}>

      {/* Time badge row */}
      <div className="flex items-center justify-between mb-3">
        {/* Time badge / picker trigger */}
        <div className="relative">
          {showTimePicker ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="time"
                defaultValue={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                onBlur={(e) => handleTimeSave(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTimeSave(e.target.value);
                  if (e.key === 'Escape') setShowTimePicker(false);
                }}
                className="bg-slate-900 border border-green-500/50 text-white px-2 py-1 rounded-lg text-xs focus:outline-none focus:border-green-500"
              />
              <button
                type="button"
                onClick={() => setShowTimePicker(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : displayTime ? (
            <button
              type="button"
              onClick={() => setShowTimePicker(true)}
              className="group flex items-center gap-1.5 bg-slate-700/60 hover:bg-slate-700 border border-slate-600 hover:border-green-500/50 text-slate-300 hover:text-green-400 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
              title="Click to change time"
            >
              <Clock size={11} className="text-green-400" />
              <span>{displayTime}</span>
              <button
                type="button"
                onClick={handleClearTime}
                className="ml-0.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-all"
                title="Remove time"
              >
                <X size={10} />
              </button>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowTimePicker(true)}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-400 text-xs transition-colors py-1"
              title="Set time slot"
            >
              <Clock size={11} />
              <span>Set time</span>
            </button>
          )}
        </div>

        {/* Edit / Delete controls */}
        <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
          <button onClick={() => setIsEditing(!isEditing)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDelete(index)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Title row */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={toggleComplete} className="flex-shrink-0 text-green-500 hover:scale-110 transition-transform focus:outline-none">
          {task.completed
            ? <CheckCircle className="fill-green-900 stroke-green-500" size={24} />
            : <Circle className="stroke-slate-400" size={24} />}
        </button>

        {isEditing ? (
          <div className="flex flex-col gap-2 flex-1">
            <input
              autoFocus
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
              className="bg-slate-900 border border-slate-600 px-3 py-1 rounded-lg text-white focus:outline-none focus:border-green-500 w-full"
              placeholder="Task title"
            />
            <div className="flex items-center gap-2">
              <Clock size={12} className="text-slate-400" />
              <input
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="bg-slate-900 border border-slate-600 text-white px-2 py-1 rounded-lg text-xs focus:outline-none focus:border-green-500"
              />
              {editTime && (
                <button
                  type="button"
                  onClick={() => setEditTime('')}
                  className="text-slate-500 hover:text-red-400 text-xs transition-colors"
                >Clear</button>
              )}
            </div>
          </div>
        ) : (
          <h3 className={`font-semibold text-lg transition-colors duration-300 ${task.completed ? 'text-green-400 line-through opacity-70' : 'text-slate-100'}`}>
            {task.title}
          </h3>
        )}
      </div>

      {/* Progress */}
      <div className="pl-9 pr-2">
        <div className="flex justify-between text-xs font-medium mb-2 text-slate-400">
          <span>Progress</span>
          <span className={task.progress > 0 ? 'text-green-400 font-bold' : ''}>{task.progress}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={task.progress}
          onChange={handleProgressChange}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500 outline-none"
        />
      </div>
    </div>
  );
}
