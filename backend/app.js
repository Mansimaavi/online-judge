import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from 'dotenv';

config(); // Load environment variables from .env

const app = express();

// Enable CORS with credentials, allow origin from env or default localhost:5173
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Middleware to parse cookies
app.use(cookieParser());

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
import problemRoutes from './routes/problemRoutes.js';
import userRoutes from './routes/userRoutes.js';
import compilerRoutes from './routes/compilerRoutes.js';
import submitRoutes from './routes/submitRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import mongoose from 'mongoose';

// Health check: reports unhealthy (503) if the database connection is
// down, not just whether the Express process itself is alive - a health
// check that always returns 200 regardless of DB state would be
// misleading to whatever's polling it (e.g. a deployment's health gate).
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
  });
});

// Setup API routes
app.use('/api/auth', userRoutes);          // User auth (login, register, logout, me)
app.use('/api/problems', problemRoutes);   // Problems CRUD
app.use('/api/compiler', compilerRoutes);  // Code compile
app.use('/api/submit', submitRoutes);      // Submit code
app.use('/api/submissions', submissionRoutes); // User submissions
app.use('/api/admin', adminRoutes);        // Admin: user management, statistics

// Fallback for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

export default app;
