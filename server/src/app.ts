import express from "express";
import cors from "cors";
import path from 'path';
import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';

import hotelRoutes from './routes/hotelRoutes';

const app = express();
app.use(cors());        // this allow the react app to cll this API
app.use(express.json());  // let the API read JSON sent in requests
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'ok, the API is running' });
});

app.use('/api/v1/hotels', hotelRoutes);
// Error handler: Express recognises it by its four parameters
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError || err.message.startsWith('Only')) {
    res.status(400).json({ message: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
});
export default app;