import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { cancelMyBooking, createMyBooking, getMyBookings } from '../controllers/bookingController';

const router = Router();

router.use(requireAuth); // every booking route needs a logged-in user

router.post('/', createMyBooking);
router.get('/me', getMyBookings);
router.patch('/:id/cancel', cancelMyBooking);

export default router;