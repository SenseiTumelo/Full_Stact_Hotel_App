import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  createHotelHandler,
  createRoomTypeHandler,
  deleteHotelHandler,
  deleteImageHandler,
  deleteRoomTypeHandler,
  deleteRoomTypeImageHandler,
  updateHotelHandler,
  updateRoomTypeHandler,
  uploadRoomTypeImagesHandler,
} from '../controllers/adminController';
import { uploadImages } from '../middleware/uploads';
import {
  approveBookingHandler,
  cancelBookingHandler,
  completeBookingHandler,
  getBookingHandler,
  listBookingsHandler,
  modifyBookingHandler,
} from '../controllers/adminBookingController';
import { deleteReviewHandler } from '../controllers/reviewController';
import { getAdminDashboardHandler, listAdminReviewsHandler } from '../controllers/adminDashboardController';


const router = Router();

// Everything below this line needs a logged-in admin
router.use(requireAuth, requireRole('admin'));

router.get('/dashboard', getAdminDashboardHandler);
router.get('/reviews', listAdminReviewsHandler);
router.post('/hotels', createHotelHandler);
router.patch('/hotels/:id', updateHotelHandler);
router.delete('/hotels/:id', deleteHotelHandler);
router.delete('/hotels/:id/images/:imageId', deleteImageHandler);

router.post('/hotels/:id/room-types', createRoomTypeHandler);
router.post('/room-types/:id/images', uploadImages.array('images', 10), uploadRoomTypeImagesHandler);
router.delete('/room-types/:id/images/:imageId', deleteRoomTypeImageHandler);
router.patch('/room-types/:id', updateRoomTypeHandler);
router.delete('/room-types/:id', deleteRoomTypeHandler);

router.get('/bookings', listBookingsHandler);
router.get('/bookings/:id', getBookingHandler);
router.patch('/bookings/:id', modifyBookingHandler);
router.post('/bookings/:id/approve', approveBookingHandler);
router.post('/bookings/:id/complete', completeBookingHandler);
router.post('/bookings/:id/cancel', cancelBookingHandler);

router.delete('/reviews/:id', deleteReviewHandler);

export default router;
