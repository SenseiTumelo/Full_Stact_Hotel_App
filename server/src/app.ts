import express from "express";
import cors from "cors";

import hotelRoutes from './routes/hotelRoutes';

const app = express();
app.use(cors());        // this allow the react app to cll this API
app.use(express.json());  // let the API read JSON sent in requests

app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'ok, the API is running' });
});

app.use('/api/v1/hotels', hotelRoutes);
export default app;