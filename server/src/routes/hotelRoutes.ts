import { Router } from 'express';
import { getHotelById, getHotels } from '../controllers/hotelController';

const router = Router();

router.get('/', getHotels);
router.get('/:id', getHotelById)
export default router;