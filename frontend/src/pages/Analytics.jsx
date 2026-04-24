import { useHabit } from '../context/HabitContext';
import ProgressChart from '../components/ProgressChart';

export default function Analytics() {
  const { history, loading } = useHabit();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
          Your Performance Insights
        </h1>
        <p className="text-slate-400 text-lg">
          Dive deep into your metrics to optimize your routine. Let data guide your path to mastery.
        </p>
      </header>

      <ProgressChart history={history} />
      
    </div>
  );
}
