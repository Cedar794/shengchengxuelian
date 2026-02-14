require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const activityRoutes = require('./routes/activities');
const collaborationRoutes = require('./routes/collaborations');
const venueRoutes = require('./routes/venues');
const materialRoutes = require('./routes/materials');
const tipRoutes = require('./routes/tips');
const listingRoutes = require('./routes/listings');
const orderRoutes = require('./routes/orders');
const groupRoutes = require('./routes/groups');
const projectRoutes = require('./routes/projects');
const chatRoutes = require('./routes/chat');
const aiRoutes = require('./routes/ai');
const chatApiRoutes = require('./routes/chatApi');
const testAIRoutes = require('./routes/test-ai');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '申城学联 API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/tips', tipRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/chat/random', chatRoutes);  // Random matching chat
app.use('/api/chat', chatApiRoutes);     // AI chat API
app.use('/api/ai', aiRoutes);
app.use('/api/test/ai', testAIRoutes);   // AI service testing routes

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📚 API: http://localhost:${PORT}/api`);
});

module.exports = app;
