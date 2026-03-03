const express = require('express');
const cors = require('cors');
const path = require('path');

const membersRouter = require('./routes/members');
const habitsRouter = require('./routes/habits');
const checkinsRouter = require('./routes/checkins');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/members', membersRouter);
app.use('/api/habits', habitsRouter);
app.use('/api/checkins', checkinsRouter);
app.use('/api/stats', statsRouter);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
