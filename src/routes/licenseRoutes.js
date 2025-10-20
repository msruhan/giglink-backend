import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getAllLicenses,
  getLicenseById,
  createLicense,
  updateLicense,
  deleteLicense,
  patchLicense,
} from "../controllers/licenseController.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Public
router.get("/", getAllLicenses);
router.get("/:id", getLicenseById);

// Protected (seller/admin)
router.post(
  "/",
  verifyToken,
  upload.fields([
    { name: "image_url_1", maxCount: 1 },
    { name: "image_url_2", maxCount: 1 },
    { name: "image_url_3", maxCount: 1 },
    { name: "image_url_4", maxCount: 1 },
  ]),
  createLicense
);
router.put(
  "/:id",
  verifyToken,
  upload.fields([
    { name: "image_url_1", maxCount: 1 },
    { name: "image_url_2", maxCount: 1 },
    { name: "image_url_3", maxCount: 1 },
    { name: "image_url_4", maxCount: 1 },
  ]),
  updateLicense
);
router.patch(
  "/:id",
  verifyToken,
  upload.fields([
    { name: "image_url_1", maxCount: 1 },
    { name: "image_url_2", maxCount: 1 },
    { name: "image_url_3", maxCount: 1 },
    { name: "image_url_4", maxCount: 1 },
  ]),
  patchLicense
);
router.delete("/:id", verifyToken, deleteLicense);

export default router;
