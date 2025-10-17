import { WorkshopModel } from "../models/workshopModel.js";
import cloudinary from '../utils/cloudinary.js';

// Controller untuk Workshop CRUD
// Silakan lengkapi logika sesuai kebutuhan aplikasi dan model database Anda

export const getAllWorkshops = async (req, res) => {
  try {
    const workshops = await WorkshopModel.findAll();
    res.json(workshops);
  } catch (error) {
    console.error("❌ Gagal ambil workshop:", error);
    res.status(500).json({ message: "Gagal memuat workshop." });
  }
};

export const getWorkshopById = async (req, res) => {
  try {
    const workshop = await WorkshopModel.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: "Workshop tidak ditemukan." });
    res.json(workshop);
  } catch (error) {
    console.error("❌ Gagal ambil detail workshop:", error);
    res.status(500).json({ message: "Gagal memuat detail workshop." });
  }
};

// export const createWorkshop = async (req, res) => {
//   try {
//     const userId = req.user?.id; // dari JWT middleware
//     if (!userId) return res.status(401).json({ message: "Unauthorized." });

//     const newId = await WorkshopModel.create({ ...req.body, user_id: userId });
//     res.status(201).json({ message: "Workshop berhasil ditambahkan", id: newId });
//   } catch (error) {
//     console.error("❌ Gagal tambah workshop:", error);
//     res.status(500).json({ message: "Gagal menambahkan workshop." });
//   }
// };

export const createWorkshop = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized." });

    let image_url = null;
    if (req.file) {
      // Ganti seluruh blok ini dengan kode streamifier yang Anda berikan
      const streamifier = await import('streamifier');
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "workshops" },
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

    const newId = await WorkshopModel.create({ ...req.body, user_id: userId, image_url });
    res.status(201).json({ message: "Workshop berhasil ditambahkan", id: newId, image_url });
  } catch (error) {
    console.error("❌ Gagal tambah workshop:", error);
    res.status(500).json({ message: "Gagal menambahkan workshop." });
  }
};

export const updateWorkshop = async (req, res) => {
  try {
    const updated = await WorkshopModel.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Workshop tidak ditemukan." });
    res.json({ message: "Workshop berhasil diperbarui." });
  } catch (error) {
    console.error("❌ Gagal update workshop:", error);
    res.status(500).json({ message: "Gagal memperbarui workshop." });
  }
};


export const deleteWorkshop = async (req, res) => {
  try {
    const deleted = await WorkshopModel.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Workshop tidak ditemukan." });
    res.json({ message: "Workshop berhasil dihapus." });
  } catch (error) {
    console.error("❌ Gagal hapus workshop:", error);
    res.status(500).json({ message: "Gagal menghapus workshop." });
  }
};
