import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  patchProduct, // tambahkan ini
} from "../controllers/productController.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Public
router.get("/", getAllProducts);
router.get("/:id", getProductById);

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
  createProduct
);
router.put("/:id", verifyToken, updateProduct);
router.patch(
  "/:id",
   verifyToken,
   upload.fields([
     { name: "image_url_1", maxCount: 1 },
     { name: "image_url_2", maxCount: 1 },
     { name: "image_url_3", maxCount: 1 },
     { name: "image_url_4", maxCount: 1 },
   ]),
   patchProduct
 );
router.delete("/:id", verifyToken, deleteProduct);

export default router;
