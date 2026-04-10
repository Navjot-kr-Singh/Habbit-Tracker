const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const { requireAuth } = require('../middleware/authMiddleware');

const defaultTasks = [
  { title: "WAKE UP",              timeSlot: '', progress: 0, completed: false },
  { title: "DSA",                  timeSlot: '', progress: 0, completed: false },
  { title: "WEB-DEV",              timeSlot: '', progress: 0, completed: false },
  { title: "DevOps",               timeSlot: '', progress: 0, completed: false },
  { title: "AI/ML",                timeSlot: '', progress: 0, completed: false },
  { title: "System Design",        timeSlot: '', progress: 0, completed: false },
  { title: "OOPS + CORE-Subject",  timeSlot: '', progress: 0, completed: false },
  { title: "JAVA -- Dev",          timeSlot: '', progress: 0, completed: false },
  { title: "Aptitude",             timeSlot: '', progress: 0, completed: false },
];

// Get today's date formatted as YYYY-MM-DD in IST
const getTodayDateString = () => {
  return new Date().toLocaleDateString('en-CA'); // returns YYYY-MM-DD
};

// Apply auth middleware to all routes
router.use(requireAuth);

// GET /habits/today — convenience alias (does NOT auto-create)
router.get('/today', async (req, res) => {
  const userId = req.auth.userId;
  const today = getTodayDateString();
  try {
    const habit = await Habit.findOne({ userId, date: today });
    // Return null if no entry — frontend shows defaults locally
    res.json(habit || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching today habits' });
  }
});

// GET /habits/date/:date — return existing entry or null (do NOT auto-create)
router.get('/date/:date', async (req, res) => {
  const userId = req.auth.userId;
  const { date } = req.params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }

  try {
    const habit = await Habit.findOne({ userId, date });
    // Return null if not found — frontend shows local defaults without saving
    res.json(habit || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching habits for date' });
  }
});

// PUT /habits/update — updates tasks for a specific date (defaults to today)
router.put('/update', async (req, res) => {
  const userId = req.auth.userId;
  const { tasks, date } = req.body;
  const targetDate = date || getTodayDateString();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }

  try {
    let habit = await Habit.findOne({ userId, date: targetDate });
    if (!habit) {
      habit = new Habit({ userId, date: targetDate, tasks });
    } else {
      habit.tasks = tasks;
    }
    await habit.save();
    res.json(habit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating habits' });
  }
});

// POST /habits/save — alias for update
router.post('/save', async (req, res) => {
  const userId = req.auth.userId;
  const { tasks, date } = req.body;
  const targetDate = date || getTodayDateString();

  try {
    let habit = await Habit.findOne({ userId, date: targetDate });
    if (!habit) {
      habit = new Habit({ userId, date: targetDate, tasks });
    } else {
      habit.tasks = tasks;
    }
    await habit.save();
    res.json(habit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error saving habits' });
  }
});

// GET /habits/history — full sorted history (for heatmap + analytics)
router.get('/history', async (req, res) => {
  const userId = req.auth.userId;
  try {
    const habits = await Habit.find({ userId }).sort({ date: 1 });
    res.json(habits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching history' });
  }
});

// Journey constants — 100 days starting April 9 2026
const JOURNEY_START = '2026-04-11';
const JOURNEY_DAYS  = 100;

// GET /habits/journey — 100-day grid from JOURNEY_START; fills gaps with placeholders
router.get('/journey', async (req, res) => {
  const userId = req.auth.userId;
  try {
    const habits = await Habit.find({ userId }).sort({ date: 1 });

    // Build a map for O(1) lookup
    const habitMap = {};
    habits.forEach(h => { habitMap[h.date] = h; });

    const journey = [];
    const start = new Date(JOURNEY_START + 'T00:00:00');

    for (let i = 0; i < JOURNEY_DAYS; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toLocaleDateString('en-CA');

      if (habitMap[dateStr]) {
        journey.push(habitMap[dateStr]);
      } else {
        journey.push({ date: dateStr, tasks: [], _placeholder: true });
      }
    }

    res.json(journey);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching journey' });
  }
});

// GET /habits/analytics
router.get('/analytics', async (req, res) => {
  const userId = req.auth.userId;
  try {
    const habits = await Habit.find({ userId }).sort({ date: 1 });
    res.json(habits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
});

module.exports = router;
