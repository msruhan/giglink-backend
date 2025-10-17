import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// Public
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Protected (seller/admin)
router.post("/", verifyToken, createProduct);
router.put("/:id", verifyToken, updateProduct);
router.delete("/:id", verifyToken, deleteProduct);

export default router;
