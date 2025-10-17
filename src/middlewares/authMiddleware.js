import jwt from "jsonwebtoken";
import { tokenBlacklist } from "../controllers/authController.js";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token tidak ditemukan atau invalid." });
    }

    const token = authHeader.split(" ")[1];
    if (tokenBlacklist.has(token)) {
      return res.status(403).json({ message: "Token sudah tidak berlaku (logout)." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Simpan data user ke req.user agar bisa digunakan di route berikutnya
    req.user = decoded;

    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    res.status(403).json({ message: "Token tidak valid atau sudah kadaluarsa." });
  }
};
