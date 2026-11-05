import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import path from 'path';
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





const app = express();

// Only our React app may call the API, and cookies are allowed
app.use(cors({ origin: env.clientUrl, credentials: true }));
// The webhook needs the raw, unparsed body so the signature check works.
app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json());

app.use(cookieParser());
app.use(passport.initialize());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hotels', hotelRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.get('/api/v1/amenities', getAmenities);
app.use('/api/v1/admin', adminRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError || err.message.startsWith('Only')) {
    res.status(400).json({ message: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
});

export default app;