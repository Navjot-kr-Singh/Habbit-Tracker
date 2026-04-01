const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  date: {
    type: String, // Stored as "YYYY-MM-DD"
    required: true,
  },
  tasks: [
    {
      title: String,
      progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      completed: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

// Ensure a user has only one record per day
HabitSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Habit', HabitSchema);
