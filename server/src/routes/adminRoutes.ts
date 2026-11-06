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
import {
  approveBookingHandler,
  cancelBookingHandler,
  getBookingHandler,
  listBookingsHandler,
  modifyBookingHandler,
} from '../controllers/adminBookingController';


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

router.get('/bookings', listBookingsHandler);
router.get('/bookings/:id', getBookingHandler);
router.patch('/bookings/:id', modifyBookingHandler);
router.post('/bookings/:id/approve', approveBookingHandler);
router.post('/bookings/:id/cancel', cancelBookingHandler);

export default router;