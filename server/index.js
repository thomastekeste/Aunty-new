require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { port } = require('./src/config');

const intakeRouter = require('./src/routes/intake');
const photosRouter = require('./src/routes/photos');
const councilRouter = require('./src/routes/council');
const routineRouter = require('./src/routes/routine');
const sendoffRouter = require('./src/routes/sendoff');
const checkinRouter = require('./src/routes/checkin');
const notificationsRouter = require('./src/routes/notifications');
const adminRouter = require('./src/admin/dashboard');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'aunty-curl-council-api' } });
});

// API routes
app.use('/api/onboarding/intake', intakeRouter);
app.use('/api/photos', photosRouter);
app.use('/api/council', councilRouter);
app.use('/api/routine', routineRouter);
app.use('/api/sendoff', sendoffRouter);
app.use('/api/checkin', checkinRouter);
app.use('/api/notifications', notificationsRouter);

// Admin dashboard
app.use('/admin', adminRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, data: null, error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, data: null, error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`\n🌀 Aunty API running on http://localhost:${port}`);
  console.log(`📊 Admin dashboard: http://localhost:${port}/admin`);
  console.log(`💚 Health: http://localhost:${port}/health\n`);
});
