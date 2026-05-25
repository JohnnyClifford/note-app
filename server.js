// server.js
const express = require('express');
const noteRoutes = require('./routes/noteRoutes');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/noteapp')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/notes', noteRoutes);

// Global error handler (catches unexpected errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});