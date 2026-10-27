import { Router } from 'express';
import { getHotels } from '../controllers/hotelController';

const router = Router();

router.get('/', getHotels);

export default router;