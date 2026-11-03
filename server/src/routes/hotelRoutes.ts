import { Router } from "express";
import { uploadImages } from "../middleware/uploads";
import {
  getHotels,
  getHotelById,
  uploadHotelImages,
} from "../controllers/hotelController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", getHotels);
router.get("/:id", getHotelById);
router.post("/:id/images", uploadImages.array("images", 10), uploadHotelImages);

router.post(
  "/:id/images",
  requireAuth,
  requireRole("admin"),
  uploadImages.array("images", 10),
  uploadHotelImages,
);
export default router;
