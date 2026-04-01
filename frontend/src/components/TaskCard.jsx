import { useState } from 'react';
import { Edit2, Trash2, CheckCircle, Circle } from 'lucide-react';

export default function TaskCard({ task, index, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleProgressChange = (e) => {
    let newProgress = parseInt(e.target.value);
    
    // Auto complete if progress is 100
    let isCompleted = task.completed;
    if (newProgress === 100) isCompleted = true;
    if (newProgress < 100 && task.completed) isCompleted = false;

    onUpdate(index, { ...task, progress: newProgress, completed: isCompleted });
  };

  const toggleComplete = () => {
    const isCompleted = !task.completed;
    let newProgress = isCompleted ? 100 : 0;
    onUpdate(index, { ...task, completed: isCompleted, progress: newProgress });
  };

  const handleTitleSave = () => {
    if (editTitle.trim()) {
      onUpdate(index, { ...task, title: editTitle.trim() });
      setIsEditing(false);
    }
  };

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 ${task.completed ? 'bg-green-900/10 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.05)]' : 'bg-slate-800 border-slate-700 hover:border-slate-600 shadow-lg'}`}>
      <div className="flex items-center justify-between mb-4">
        
        <div className="flex items-center gap-3">
          <button onClick={toggleComplete} className="text-green-500 hover:scale-110 transition-transform focus:outline-none">
            {task.completed ? <CheckCircle className="fill-green-900 stroke-green-500" size={24} /> : <Circle className="stroke-slate-400" size={24} />}
          </button>
          
          {isEditing ? (
            <input 
              autoFocus
              type="text" 
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
              className="bg-slate-900 border border-slate-600 px-3 py-1 rounded-lg text-white focus:outline-none focus:border-green-500 w-full"
            />
          ) : (
            <h3 className={`font-semibold text-lg transition-colors duration-300 ${task.completed ? 'text-green-400 line-through opacity-70' : 'text-slate-100'}`}>
              {task.title}
            </h3>
          )}
        </div>

        <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
          <button onClick={() => setIsEditing(!isEditing)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDelete(index)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>

      </div>

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
