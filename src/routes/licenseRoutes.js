import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getAllLicenses,
  getLicenseById,
  createLicense,
  updateLicense,
  deleteLicense,
} from "../controllers/licenseController.js";

const router = express.Router();

// Public
router.get("/", getAllLicenses);
router.get("/:id", getLicenseById);

// Protected (seller/admin)
router.post("/", verifyToken, createLicense);
router.put("/:id", verifyToken, updateLicense);
router.delete("/:id", verifyToken, deleteLicense);

export default router;
