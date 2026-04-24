const express = require('express');
const router = express.Router();
const Learning = require('../models/Learning');
const { requireAuth } = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(requireAuth);

// Calculate revision dates using Day 1, 3, 7 (Ebbinghaus Forgetting Curve)
const calculateRevDates = (startDate) => {
  const dates = [1, 3, 7];
  return dates.map(days => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0]; // Return YYYY-MM-DD
  });
};

// @route   POST /api/learning
// @desc    Add a learning session and schedule revisions
router.post('/', async (req, res) => {
  const { date, hourRange, topic, category } = req.body;
  const userId = req.auth.userId;

  try {
    const revDates = calculateRevDates(date);
    const revisionDates = revDates.map((d, index) => ({
      date: d,
      completed: false,
      type: `rev${index + 1}`
    }));

    const newLearning = new Learning({
      userId,
      date,
      hourRange,
      topic,
      category: category || 'DSA',
      revisionDates
    });

    const learning = await newLearning.save();
    res.json(learning);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/learning
// @desc    Get all learning sessions for a user
router.get('/', async (req, res) => {
  try {
    const learnings = await Learning.find({ userId: req.auth.userId }).sort({ date: -1 });
    res.json(learnings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/learning/today-revisions
// @desc    Get topics scheduled for revision today
router.get('/today-revisions', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const learnings = await Learning.find({
      userId: req.auth.userId,
      'revisionDates.date': today,
      'revisionDates.completed': false
    });

    // Extract only the relevant revision data for today
    const revisionsToday = learnings.map(l => ({
      _id: l._id,
      topic: l.topic,
      hourRange: l.hourRange,
      originalDate: l.date,
      category: l.category || 'DSA',
      revisionType: l.revisionDates.find(rd => rd.date === today)?.type
    }));

    res.json(revisionsToday);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
