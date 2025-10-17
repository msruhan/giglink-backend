import { TechnicianModel } from "../models/technicianModel.js";
import cloudinary from '../utils/cloudinary.js';

export const getAllTechnicians = async (req, res) => {
  try {
    const technicians = await TechnicianModel.findAll();
    res.json(technicians);
  } catch (error) {
    console.error("❌ Gagal ambil technician:", error);
    res.status(500).json({ message: "Gagal memuat technician." });
  }
};

export const getTechnicianById = async (req, res) => {
  try {
    const technician = await TechnicianModel.findById(req.params.id);
    if (!technician) return res.status(404).json({ message: "Technician tidak ditemukan." });
    res.json(technician);
  } catch (error) {
    console.error("❌ Gagal ambil detail technician:", error);
    res.status(500).json({ message: "Gagal memuat detail technician." });
  }
};

export const createTechnician = async (req, res) => {
  try {
    const userId = req.user?.id; // dari JWT middleware
    if (!userId) return res.status(401).json({ message: "Unauthorized." });

    let image_url = null;
    if (req.file) {
      const streamifier = await import('streamifier');
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "technicians" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.default.createReadStream(buffer).pipe(stream);
        });
      };
      const uploadResult = await streamUpload(req.file.buffer);
      image_url = uploadResult.secure_url;
    }

    const newId = await TechnicianModel.create({ ...req.body, user_id: userId, image_url });
    res.status(201).json({ message: "Technician berhasil ditambahkan", id: newId, image_url });
  } catch (error) {
    console.error("❌ Gagal tambah technician:", error);
    res.status(500).json({ message: "Gagal menambahkan technician." });
  }
};

export const updateTechnician = async (req, res) => {
  try {
    const updated = await TechnicianModel.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Technician tidak ditemukan." });
    res.json({ message: "Technician berhasil diperbarui." });
  } catch (error) {
    console.error("❌ Gagal update technician:", error);
    res.status(500).json({ message: "Gagal memperbarui technician." });
  }
};

export const deleteTechnician = async (req, res) => {
  try {
    const deleted = await TechnicianModel.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Technician tidak ditemukan." });
    res.json({ message: "Technician berhasil dihapus." });
  } catch (error) {
    console.error("❌ Gagal hapus technician:", error);
    res.status(500).json({ message: "Gagal menghapus technician." });
  }
};
