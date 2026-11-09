import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';
import { env } from './config/env';
import './config/passport';
import authRoutes from './routes/authRoutes';
import hotelRoutes from './routes/hotelRoutes';
import bookingRoutes from './routes/bookingRoutes';
import paymentRoutes from './routes/paymentRoutes';
import { stripeWebhook } from './controllers/paymentController';
import adminRoutes from './routes/adminRoutes';
import { getAmenities } from './controllers/hotelController';
import { pool } from './config/db';
import reviewRoutes from './routes/reviewRoutes';




const app = express();
// Render sits behind one proxy; trust it so per-IP sign-in limits use the visitor's IP.
if (env.isProd) app.set('trust proxy', 1);

// Only our React app may call the API, and cookies are allowed
app.use(cors({ origin: env.clientUrl, credentials: true }));
// The webhook needs the raw, unparsed body so the signature check works.
app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json());

app.use(cookieParser());
app.use(passport.initialize());

app.get('/uploads/:id', async (req, res) => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.id)) {
    res.status(404).end();
    return;
  }
  try {
    const result = await pool.query('SELECT content_type, data FROM uploaded_images WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) {
      res.status(404).end();
      return;
    }
    res.setHeader('Content-Type', result.rows[0].content_type);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(result.rows[0].data);
  } catch (error) {
    console.error('Image retrieval failed:', error instanceof Error ? error.name : 'UnknownError');
    res.status(500).end();
  }
});

app.get('/api/v1/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Health check database query failed:', error instanceof Error ? error.name : 'UnknownError');
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hotels', hotelRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.get('/api/v1/amenities', getAmenities);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/reviews', reviewRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError || err.message.startsWith('Only')) {
    res.status(400).json({ message: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
});

export default app;
