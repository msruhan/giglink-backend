import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel.js";

export const register = async (req, res) => {
  try {
    console.log("📩 Request body:", req.body);

    const { name, email, password, role, whatsapp, telegram, avatar, bio } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Nama, email, dan password wajib diisi." });
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: role || "buyer",
      whatsapp,
      telegram,
      avatar,
      bio,
    });

    res.status(201).json({ message: "Registrasi berhasil", userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Email tidak ditemukan." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password salah." });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

// Blacklist token (memory, untuk demo; produksi sebaiknya pakai Redis)
const tokenBlacklist = new Set();

export const logout = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token tidak ditemukan atau invalid." });
    }
    const token = authHeader.split(" ")[1];
    tokenBlacklist.add(token);
    res.json({ message: "Logout berhasil." });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

// Export tokenBlacklist agar bisa diakses middleware
export { tokenBlacklist };
