require('dotenv').config();
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());

// Minimal routes
app.get('/', (req, res) => {
  res.json({ message: 'Root working' });
});

app.get('/test', (req, res) => {
  console.log('Basic test route hit');
  res.json({ message: 'Basic test working' });
});

app.get('/api/test', (req, res) => {
  console.log('API test route hit');
  res.json({ message: 'API test working' });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Minimal server running on port ${port}`);
  });
}

module.exports = app;