export const patchProduct = async (req, res) => {
  console.log("PATCH controller called", req.params, req.body, req.files);
  try {
    const { id } = req.params;
    const data = { ...req.body };
    const files = req.files || {};
    const imageFields = ["image_url_1", "image_url_2", "image_url_3", "image_url_4"];

    // Ambil data produk lama
    const oldProduct = await ProductModel.findById(id);
    if (!oldProduct) return res.status(404).json({ message: "Produk tidak ditemukan." });

    // Jika spesification/pembayaran string (dari FormData), parse ke objek
    if (typeof data.spesification === "string") {
      try { data.spesification = JSON.parse(data.spesification); } catch {}
    }
    if (typeof data.pembayaran === "string") {
      try { data.pembayaran = JSON.parse(data.pembayaran); } catch {}
    }

    // Proses upload untuk setiap gambar jika ada file baru
    if (Object.keys(files).length > 0) {
      const streamifier = await import('streamifier');
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
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
          if (oldProduct[field]) {
            const match = oldProduct[field].match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
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

    // Jika field gambar dikosongkan/null dari frontend, hapus gambar lama dari Cloudinary & kosongkan di DB
    for (const field of imageFields) {
      if ((field in data) && (!data[field] || data[field] === "null")) {
        if (oldProduct[field]) {
          const match = oldProduct[field].match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
          const publicId = match ? match[1] : null;
          if (publicId) {
            try { await cloudinary.uploader.destroy(publicId); } catch {}
          }
        }
        data[field] = "";
      }
    }

    const updated = await ProductModel.patch(id, data);
    if (updated) {
      res.status(200).json({ message: "Produk berhasil diperbarui sebagian" });
    } else {
      res.status(404).json({ message: "Produk tidak ditemukan atau tidak ada perubahan" });
    }
  } catch (error) {
    console.error("Gagal patch produk:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
import { ProductModel } from "../models/productModel.js";
import cloudinary from "../utils/cloudinary.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await ProductModel.findAll();
    res.json(products);
  } catch (error) {
    console.error("❌ Gagal ambil produk:", error);
    res.status(500).json({ message: "Gagal memuat produk." });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Produk tidak ditemukan." });
    res.json(product);
  } catch (error) {
    console.error("❌ Gagal ambil detail produk:", error);
    res.status(500).json({ message: "Gagal memuat detail produk." });
  }
};


export const createProduct = async (req, res) => {
  try {
    const sellerId = req.user?.id; // dari JWT middleware
    if (!sellerId) return res.status(401).json({ message: "Unauthorized." });

    const data = { ...req.body, seller_id: sellerId };
    const files = req.files || {};
    const streamifier = await import('streamifier');
    // Helper upload ke Cloudinary
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.default.createReadStream(buffer).pipe(stream);
      });
    };

    // Proses upload untuk setiap gambar
    for (let i = 1; i <= 4; i++) {
      const field = `image_url_${i}`;
      if (files[field] && files[field][0]) {
        const uploadResult = await streamUpload(files[field][0].buffer);
        data[field] = uploadResult.secure_url;
      } else {
        data[field] = "";
      }
    }

    const newId = await ProductModel.create(data);
    res.status(201).json({ message: "Produk berhasil ditambahkan", id: newId, images: [data.image_url_1, data.image_url_2, data.image_url_3, data.image_url_4] });
  } catch (error) {
    console.error("❌ Gagal tambah produk:", error);
    res.status(500).json({ message: "Gagal menambahkan produk." });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const updated = await ProductModel.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Produk tidak ditemukan." });
    res.json({ message: "Produk berhasil diperbarui." });
  } catch (error) {
    console.error("❌ Gagal update produk:", error);
    res.status(500).json({ message: "Gagal memperbarui produk." });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    // 1. Ambil data produk dulu (untuk dapatkan URL gambar)
    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Produk tidak ditemukan." });

    // 2. Hapus gambar dari Cloudinary jika ada
    const imageFields = ["image_url_1", "image_url_2", "image_url_3", "image_url_4"];
    const cloudinaryUrls = imageFields.map(f => product[f]).filter(Boolean);
    const getPublicId = (url) => {
      // Cloudinary URL: https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<folder>/<public_id>.<ext>
      // Ambil path setelah '/upload/' dan sebelum ekstensi
      if (!url) return null;
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
      return match ? match[1] : null;
    };
    for (const url of cloudinaryUrls) {
      const publicId = getPublicId(url);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.warn("Gagal hapus gambar Cloudinary:", publicId, err?.message);
        }
      }
    }

    // 3. Hapus produk dari database
    const deleted = await ProductModel.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Produk tidak ditemukan." });
    res.json({ message: "Produk & gambar berhasil dihapus." });
  } catch (error) {
    console.error("❌ Gagal hapus produk:", error);
    res.status(500).json({ message: "Gagal menghapus produk." });
  }
};
