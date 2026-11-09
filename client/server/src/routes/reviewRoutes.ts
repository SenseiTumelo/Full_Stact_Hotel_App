import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createReviewHandler } from '../controllers/reviewController';

const router = Router();

router.post('/', requireAuth, createReviewHandler);

export default router;