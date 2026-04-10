const mongoose = require('mongoose');
require('dotenv').config();

const Habit = require('./models/Habit');
const Learning = require('./models/Learning');

async function resetDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/habits_db');
    console.log('Connected to DB');
    
    await Learning.deleteMany({});
    console.log('Cleared Learning (revisions) collection.');
    
    await Habit.deleteMany({});
    console.log('Cleared Habit collection.');
    
    mongoose.connection.close();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

resetDB();
