require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const habitRoutes = require('./routes/habitRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/habits', habitRoutes);
app.use('/api/learning', require('./routes/learningRoutes'));

// Basic route for ping checking
app.get('/api', (req, res) => {
  res.json({ message: 'Habit Tracker API is running' });
});

// Start the server
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  // Graceful handling of MongoDB connection errors
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('MongoDB connected successfully');
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('MongoDB connection error. Fix your URI in .env', err.message);
      // Still start backend so frontend API calls fail cleanly with 500s rather than cors errors
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} with broken DB`);
      });
    });
} else {
  console.log('WARNING: MONGO_URI not found in .env');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} (Database not connected)`);
  });
}
