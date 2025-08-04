import express from 'express';

import helmet from 'helmet';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import themeRoutes from './routes/themeRoutes.js';
import thoughtRoutes from './routes/thoughtRoutes.js';
import errorHandler from './middleware/errorhandler.js';

dotenv.config();
console.log("inside server.js");
const app = express();
import cors from 'cors';
const ALLOWED_ORIGIN = "use url here";
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  credentials: false,
}));
connectDB();
app.use(express.json());

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  next();
});

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  next();
});

// routes here
app.use('/api/auth', authRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/thoughts', thoughtRoutes);

app.use(errorHandler);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
