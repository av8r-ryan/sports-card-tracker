// Debug version of the server
const express = require('express');
const cors = require('cors');

console.log('Starting debug server...');

const app = express();
const PORT = 8000;

console.log('Express app created');

// Add error handlers before middleware
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

try {
  // Middleware
  console.log('Adding middleware...');
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));
  
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  console.log('Middleware added');

  // Simple route
  app.get('/api/health', (req, res) => {
    console.log('Health check requested');
    res.json({ status: 'OK', message: 'Debug server running' });
  });

  console.log('Routes defined');

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Express error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  // 404 handler
  app.use('*', (req, res) => {
    console.log('404 for:', req.originalUrl);
    res.status(404).json({ error: 'Route not found' });
  });

  console.log('Starting server on port', PORT);
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Debug server running on port ${PORT}`);
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
  });

} catch (error) {
  console.error('Error during server setup:', error);
}