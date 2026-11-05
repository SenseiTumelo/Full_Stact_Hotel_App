import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  createHotelHandler,
  createRoomTypeHandler,
  deleteHotelHandler,
  deleteImageHandler,
  deleteRoomTypeHandler,
  updateHotelHandler,
  updateRoomTypeHandler,
} from '../controllers/adminController';

const router = Router();

// Everything below this line needs a logged-in admin
router.use(requireAuth, requireRole('admin'));

router.post('/hotels', createHotelHandler);
router.patch('/hotels/:id', updateHotelHandler);
router.delete('/hotels/:id', deleteHotelHandler);
router.delete('/hotels/:id/images/:imageId', deleteImageHandler);

router.post('/hotels/:id/room-types', createRoomTypeHandler);
router.patch('/room-types/:id', updateRoomTypeHandler);
router.delete('/room-types/:id', deleteRoomTypeHandler);

export default router;