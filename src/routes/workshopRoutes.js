import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import upload from '../middlewares/uploadMiddleware.js';
import {
  getAllWorkshops,
  getWorkshopById,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
} from "../controllers/workshopController.js";

const router = express.Router();

// Public
router.get("/", getAllWorkshops);
router.get("/:id", getWorkshopById);

// Protected (admin/owner)
router.post("/", verifyToken, upload.single('image_url'), createWorkshop);
router.put("/:id", verifyToken, updateWorkshop);
router.delete("/:id", verifyToken, deleteWorkshop);

export default router;
