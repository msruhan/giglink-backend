import { UserModel } from "../models/userModel.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.findAll();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal memuat data pengguna." });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil detail pengguna." });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updated = await UserModel.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    res.json({ message: "Profil berhasil diperbarui." });
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui data pengguna." });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deleted = await UserModel.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    res.json({ message: "Pengguna berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus pengguna." });
  }
};
