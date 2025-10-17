import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { isAdmin, isOwnerOrAdmin } from "../middlewares/roleMiddleware.js";
import { getAllUsers, getUserById, updateUser, deleteUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, getAllUsers);
router.get("/:id", verifyToken, isOwnerOrAdmin, getUserById);
router.put("/:id", verifyToken, isOwnerOrAdmin, updateUser);
router.delete("/:id", verifyToken, isAdmin, deleteUser);

export default router;
