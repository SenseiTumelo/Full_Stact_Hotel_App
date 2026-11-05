import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createPaymentIntent } from '../controllers/paymentController';

const router = Router();

router.post('/intent', requireAuth, createPaymentIntent);

export default router;