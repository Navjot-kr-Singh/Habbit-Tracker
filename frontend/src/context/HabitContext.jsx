import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

const HabitContext = createContext();

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api' });

const getLocalToday = () => new Date().toLocaleDateString('en-CA');

// Default tasks shown locally when a day has no saved record yet
const DEFAULT_TASKS = [
  { title: "Wake Up",              timeSlot: '05:45', progress: 0, completed: false },
  { title: "WEB-DEV",              timeSlot: '06:00', progress: 0, completed: false },
  { title: "DevOps",               timeSlot: '08:00', progress: 0, completed: false },
  { title: "AI/ML",                timeSlot: '09:00', progress: 0, completed: false },
  { title: "System Design--LLD",   timeSlot: '10:00', progress: 0, completed: false },
  { title: "OOPS + CORE-Subject",  timeSlot: '11:00', progress: 0, completed: false },
  { title: "APTITUDE",             timeSlot: '13:00', progress: 0, completed: false },
  { title: "Java-Dev",             timeSlot: '17:00', progress: 0, completed: false },
  { title: "DSA",                  timeSlot: '19:00', progress: 0, completed: false },
];

export const HabitProvider = ({ children }) => {
  const { getToken, isSignedIn } = useAuth();

  const [selectedDate, setSelectedDate]   = useState(getLocalToday());
  const [currentHabit, setCurrentHabit]   = useState(null);  // real DB record or local stub
  const [isNewDay, setIsNewDay]           = useState(false);  // true = no DB record yet
  const [history, setHistory]             = useState([]);
  const [journey, setJourney]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [dateLoading, setDateLoading]     = useState(false);

  const getConfig = useCallback(async () => {
    const token = await getToken();
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [getToken]);

  // Fetch by date — if null returned from server, create local stub (don't save)
  const fetchByDate = useCallback(async (date) => {
    setDateLoading(true);
    try {
      const config = await getConfig();
      const res = await api.get(`/habits/date/${date}`, config);

      if (res.data) {
        setCurrentHabit(res.data);
        setIsNewDay(false);
      } else {
        // No record exists — show defaults locally without writing to DB
        setCurrentHabit({ date, tasks: [...DEFAULT_TASKS] });
        setIsNewDay(true);
      }
    } catch (error) {
      console.error('Error fetching habits for date', error);
      setCurrentHabit({ date, tasks: [...DEFAULT_TASKS] });
      setIsNewDay(true);
    } finally {
      setDateLoading(false);
    }
  }, [getConfig]);

  const fetchHistory = useCallback(async () => {
    try {
      const config = await getConfig();
      const res = await api.get('/habits/history', config);
      setHistory(res.data);
    } catch (error) {
      console.error('Error fetching history', error);
    }
  }, [getConfig]);

  const fetchJourney = useCallback(async () => {
    try {
      const config = await getConfig();
      const res = await api.get('/habits/journey', config);
      setJourney(res.data);
    } catch (error) {
      console.error('Error fetching journey', error);
    }
  }, [getConfig]);

  // Save tasks — always writes to DB (creates record on first save)
  const updateTasksForDate = async (tasks, date) => {
    const targetDate = date || selectedDate;

    // Optimistic UI
    setCurrentHabit(prev => ({ ...prev, tasks }));

    try {
      const config = await getConfig();
      const res = await api.put('/habits/update', { tasks, date: targetDate }, config);
      setCurrentHabit(res.data);
      setIsNewDay(false);       // record now exists in DB
      fetchHistory();
      fetchJourney();
    } catch (error) {
      console.error('Error updating tasks', error);
    }
  };

  // Refetch when selected date changes
  useEffect(() => {
    if (isSignedIn && selectedDate) {
      fetchByDate(selectedDate);
    }
  }, [selectedDate, isSignedIn]);

  // Initial load
  useEffect(() => {
    if (isSignedIn) {
      setLoading(true);
      Promise.all([
        fetchByDate(selectedDate),
        fetchHistory(),
        fetchJourney(),
      ]).finally(() => setLoading(false));
    } else {
      setCurrentHabit(null);
      setHistory([]);
      setJourney([]);
      setLoading(false);
    }
  }, [isSignedIn]);

  // ── Auto-advance when midnight rolls over (tab left open overnight) ──────────
  useEffect(() => {
    if (!isSignedIn) return;

    // Snapshot of "today" when this effect runs
    let lastKnownToday = getLocalToday();

    const checkDateChange = () => {
      const newToday = getLocalToday();
      if (newToday !== lastKnownToday) {
        lastKnownToday = newToday;
        // If user was viewing "today", advance them to the new today automatically
        setSelectedDate(prev => (prev === lastKnownToday ? prev : newToday));
        fetchHistory();
        fetchJourney();
      }
    };

    // Poll every 60 seconds
    const interval = setInterval(checkDateChange, 60_000);

    // Also check when the browser tab becomes active again
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkDateChange();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isSignedIn, fetchHistory, fetchJourney]);

  return (
    <HabitContext.Provider value={{
      selectedDate, setSelectedDate,
      currentHabit,
      isNewDay,
      history, journey,
      loading, dateLoading,
      updateTasksForDate,
      fetchHistory, fetchJourney,
    }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabit = () => useContext(HabitContext);
