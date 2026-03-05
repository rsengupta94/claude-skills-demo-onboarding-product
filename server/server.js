import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    llmProvider: process.env.LLM_PROVIDER || 'openai',
    timestamp: new Date().toISOString()
  });
});

// API Routes (to be implemented)
// TODO: Import and use route handlers
// import analyzeRoutes from './routes/analyze.js';
// import plansRoutes from './routes/plans.js';
// import employeesRoutes from './routes/employees.js';
// import dashboardRoutes from './routes/dashboard.js';

// app.use('/api/analyze-jd', analyzeRoutes);
// app.use('/api/plans', plansRoutes);
// app.use('/api/employees', employeesRoutes);
// app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Coursera Onboarding Platform API running on port ${PORT}`);
  console.log(`📊 LLM Provider: ${process.env.LLM_PROVIDER || 'openai'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});

export default app;
