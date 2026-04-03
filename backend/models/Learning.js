const mongoose = require('mongoose');

const LearningSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  date: {
    type: String, // Stored as "YYYY-MM-DD"
    required: true,
  },
  hourRange: {
    type: String, // e.g., "08:00 AM - 09:00 AM"
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  revisionDates: [
    {
      date: String, // "YYYY-MM-DD"
      completed: { type: Boolean, default: false },
      type: { type: String, enum: ['rev1', 'rev2', 'rev3'] } // Optional: track which review it is
    }
  ],
}, { timestamps: true });

// Index for efficiently searching today's revisions
LearningSchema.index({ userId: 1, 'revisionDates.date': 1 });

module.exports = mongoose.model('Learning', LearningSchema);
