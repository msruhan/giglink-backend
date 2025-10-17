import { LicenseModel } from "../models/licenseModel.js";

export const getAllLicenses = async (req, res) => {
  try {
    const licenses = await LicenseModel.findAll();
    res.json(licenses);
  } catch (error) {
    console.error("❌ Gagal ambil license:", error);
    res.status(500).json({ message: "Gagal memuat license." });
  }
};

export const getLicenseById = async (req, res) => {
  try {
    const license = await LicenseModel.findById(req.params.id);
    if (!license) return res.status(404).json({ message: "License tidak ditemukan." });
    res.json(license);
  } catch (error) {
    console.error("❌ Gagal ambil detail license:", error);
    res.status(500).json({ message: "Gagal memuat detail license." });
  }
};

export const createLicense = async (req, res) => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) return res.status(401).json({ message: "Unauthorized." });
    const newId = await LicenseModel.create({ ...req.body, seller_id: sellerId });
    res.status(201).json({ message: "License berhasil ditambahkan", id: newId });
  } catch (error) {
    console.error("❌ Gagal tambah license:", error);
    res.status(500).json({ message: "Gagal menambahkan license." });
  }
};

export const updateLicense = async (req, res) => {
  try {
    const updated = await LicenseModel.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "License tidak ditemukan." });
    res.json({ message: "License berhasil diperbarui." });
  } catch (error) {
    console.error("❌ Gagal update license:", error);
    res.status(500).json({ message: "Gagal memperbarui license." });
  }
};

export const deleteLicense = async (req, res) => {
  try {
    const deleted = await LicenseModel.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "License tidak ditemukan." });
    res.json({ message: "License berhasil dihapus." });
  } catch (error) {
    console.error("❌ Gagal hapus license:", error);
    res.status(500).json({ message: "Gagal menghapus license." });
  }
};
