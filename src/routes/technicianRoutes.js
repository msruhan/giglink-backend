import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import upload from '../middlewares/uploadMiddleware.js';
import {
  getAllTechnicians,
  getTechnicianById,
  createTechnician,
  updateTechnician,
  deleteTechnician,
} from "../controllers/technicianController.js";

const router = express.Router();

// Public
router.get("/", getAllTechnicians);
router.get("/:id", getTechnicianById);

// Protected (admin/owner)
router.post("/", verifyToken, upload.single('image_url'), createTechnician);
router.put("/:id", verifyToken, updateTechnician);
router.delete("/:id", verifyToken, deleteTechnician);

export default router;
