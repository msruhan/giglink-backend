import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: "Berhasil mengakses route terlindungi ✅",
    user: req.user, // ini berisi { id, role, iat, exp }
  });
});

export default router;
