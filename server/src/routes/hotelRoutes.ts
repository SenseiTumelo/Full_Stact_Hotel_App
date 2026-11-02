import { Router } from 'express';
import { uploadImages } from '../middleware/uploads';
import { getHotels, getHotelById, uploadHotelImages } from '../controllers/hotelController';



const router = Router();

router.get('/', getHotels);
router.get('/:id', getHotelById);
router.post('/:id/images', uploadImages.array('images', 10), uploadHotelImages);
export default router;