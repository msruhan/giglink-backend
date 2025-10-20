export const patchLicense = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    const files = req.files || {};
    const imageFields = ["image_url_1", "image_url_2", "image_url_3", "image_url_4"];

    // 1. Ambil data license lama
    const oldLicense = await LicenseModel.findById(id);
    if (!oldLicense) return res.status(404).json({ message: "License tidak ditemukan." });

    // 2. Proses upload gambar baru jika ada file baru
    if (Object.keys(files).length > 0) {
      const streamifier = await import('streamifier');
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "licenses" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.default.createReadStream(buffer).pipe(stream);
        });
      };
      for (const field of imageFields) {
        if (files[field] && files[field][0]) {
          // Jika ada gambar lama, hapus dari Cloudinary
          if (oldLicense[field]) {
            const match = oldLicense[field].match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
            const publicId = match ? match[1] : null;
            if (publicId) {
              try { await cloudinary.uploader.destroy(publicId); } catch {}
            }
          }
          const uploadResult = await streamUpload(files[field][0].buffer);
          data[field] = uploadResult.secure_url;
        }
      }
    }

    // 3. Jika field gambar dikosongkan/null dari frontend, hapus gambar lama dari Cloudinary & kosongkan di DB
    for (const field of imageFields) {
      if ((field in data) && (!data[field] || data[field] === "null")) {
        if (oldLicense[field]) {
          const match = oldLicense[field].match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
          const publicId = match ? match[1] : null;
          if (publicId) {
            try { await cloudinary.uploader.destroy(publicId); } catch {}
          }
        }
        data[field] = "";
      }
    }

    const updated = await LicenseModel.patch(id, data);
    if (updated) {
      res.status(200).json({ message: "License berhasil diperbarui sebagian" });
    } else {
      res.status(404).json({ message: "License tidak ditemukan atau tidak ada perubahan" });
    }
  } catch (error) {
    console.error("Gagal patch license:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
import { LicenseModel } from "../models/licenseModel.js";
import cloudinary from '../utils/cloudinary.js';

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

    // Upload semua gambar yang dikirim
    const imageFields = ["image_url_1", "image_url_2", "image_url_3", "image_url_4"];
    const imageUrls = {};
    if (req.files) {
      const streamifier = await import('streamifier');
      for (const field of imageFields) {
        if (req.files[field] && req.files[field][0]) {
          const buffer = req.files[field][0].buffer;
          const streamUpload = (buffer) => {
            return new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { folder: "licenses" },
                (error, result) => {
                  if (result) resolve(result);
                  else reject(error);
                }
              );
              streamifier.default.createReadStream(buffer).pipe(stream);
            });
          };
          const uploadResult = await streamUpload(buffer);
          imageUrls[field] = uploadResult.secure_url;
        } else {
          imageUrls[field] = ""; // kosong jika tidak ada file
        }
      }
    } else {
      for (const field of imageFields) {
        imageUrls[field] = "";
      }
    }
    // Validasi image_url_1 wajib ada
    if (!imageUrls.image_url_1) {
      return res.status(400).json({ message: "Gambar utama (image_url_1) wajib diupload." });
    }

    const newId = await LicenseModel.create({
      ...req.body,
      seller_id: sellerId,
      ...imageUrls
    });
    res.status(201).json({ message: "License berhasil ditambahkan", id: newId, ...imageUrls });
  } catch (error) {
    console.error("❌ Gagal tambah license:", error);
    res.status(500).json({ message: "Gagal menambahkan license." });
  }
};

export const updateLicense = async (req, res) => {
  try {
    // ...mirip createLicense, upload file baru jika ada...
    const imageFields = ["image_url_1", "image_url_2", "image_url_3", "image_url_4"];
    const imageUrls = {};
    if (req.files) {
      const streamifier = await import('streamifier');
      for (const field of imageFields) {
        if (req.files[field] && req.files[field][0]) {
          const buffer = req.files[field][0].buffer;
          const streamUpload = (buffer) => {
            return new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { folder: "licenses" },
                (error, result) => {
                  if (result) resolve(result);
                  else reject(error);
                }
              );
              streamifier.default.createReadStream(buffer).pipe(stream);
            });
          };
          const uploadResult = await streamUpload(buffer);
          imageUrls[field] = uploadResult.secure_url;
        } else {
          imageUrls[field] = ""; // kosong jika tidak ada file
        }
      }
    } else {
      // Jika tidak ada file sama sekali, isi semua field gambar dengan string kosong
      for (const field of imageFields) {
        imageUrls[field] = "";
      }
    }
    const updated = await LicenseModel.update(req.params.id, {
      ...req.body,
      ...imageUrls
    });
    if (!updated) return res.status(404).json({ message: "License tidak ditemukan." });
    res.json({ message: "License berhasil diperbarui.", ...imageUrls });
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
