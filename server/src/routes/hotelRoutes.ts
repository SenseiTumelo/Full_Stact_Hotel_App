import { Router } from "express";
import { uploadImages } from "../middleware/uploads";
import {
  getHotels,
  getHotelById,
  uploadHotelImages,
} from "../controllers/hotelController";
import { requireAuth, requireRole } from "../middleware/auth";
import { getAvailability } from '../controllers/bookingController';
import { getHotelReviewsHandler } from '../controllers/reviewController';



const router = Router();

router.get("/", getHotels);
router.get("/:id", getHotelById);
router.post("/:id/images", uploadImages.array("images", 10), uploadHotelImages);
router.get('/:id/availability', getAvailability);
router.get('/:id/reviews', getHotelReviewsHandler);

router.post(
  "/:id/images",
  requireAuth,
  requireRole("admin"),
  uploadImages.array("images", 10),
  uploadHotelImages,
);
export default router;
