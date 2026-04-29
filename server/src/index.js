import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db/mongo.js';
import authRoutes from './routes/auth.js';
import billRoutes from './routes/bills.js';
import complaintRoutes from './routes/complaints.js';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
    'https://suvidha-connect.vercel.app',
    'https://*.vercel.app',
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-Kiosk-ID']
}));
app.use(express.json({ limit: '10mb' }));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api', apiRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', db: 'mongodb-atlas', timestamp: new Date().toISOString(), version: '1.0.0' });
});

app.use((_req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint not found.' } }));
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
});

// Connect to MongoDB then start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 SUVIDHA Connect Backend → http://localhost:${PORT}`);
      console.log(`🗄️  Database: MongoDB Atlas (suvidha)`);
      console.log(`📋 Health: http://localhost:${PORT}/health\n`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
