import { useState } from 'react';
import { useHabit } from '../context/HabitContext';
import { Plus, BookOpen, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RevisionSection() {
  const { learningSessions, addLearningSession, selectedDate } = useHabit();
  const [topic, setTopic] = useState('');
  const [hourStart, setHourStart] = useState('08:00');
  const [hourEnd, setHourEnd] = useState('09:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return setError('Please enter a topic');
    
    setIsSubmitting(true);
    setError('');
    try {
      const hourRange = `${hourStart} - ${hourEnd}`;
      await addLearningSession({
        date: selectedDate,
        hourRange,
        topic: topic.trim()
      });
      setTopic('');
    } catch (err) {
      setError('Failed to save learning session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const upcomingRevisions = learningSessions.flatMap(session => 
    session.revisionDates
      .filter(rd => !rd.completed && new Date(rd.date) >= new Date())
      .map(rd => ({
        ...rd,
        topic: session.topic,
        originalDate: session.date,
        hourRange: session.hourRange
      }))
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="mt-12 space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <BookOpen className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Ebbinghaus Revision System</h2>
          <p className="text-slate-400 text-sm">Track learning and automate your revision cycles (+1, +3, +6 days)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-400" />
            Log Today's Learning
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                What did you learn?
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. DevOps Linux Services"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                  Start Time
                </label>
                <input
                  type="time"
                  value={hourStart}
                  onChange={(e) => setHourStart(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                  End Time
                </label>
                <input
                  type="time"
                  value={hourEnd}
                  onChange={(e) => setHourEnd(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Schedule Revision
                </>
              )}
            </button>
          </form>
        </div>

        {/* Upcoming Revisions */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Upcoming Revisions
          </h3>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {upcomingRevisions.length > 0 ? (
              upcomingRevisions.map((rev, idx) => (
                <div 
                  key={idx}
                  className="group flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-slate-900/80 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                      <Clock className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-slate-200 font-medium">{rev.topic}</h4>
                      <p className="text-slate-500 text-xs flex items-center gap-2">
                        <span>{new Date(rev.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                        <span className="capitalize text-indigo-400/80 font-medium">{rev.type.replace('rev', 'Review ')}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-600 block mb-1">Status</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      Pending
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
                <Calendar className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No revisions scheduled yet.</p>
                <p className="text-slate-600 text-xs mt-1">Add what you've learned to see the curve.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
