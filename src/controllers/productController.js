import { ProductModel } from "../models/productModel.js";

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

    const newId = await ProductModel.create({ ...req.body, seller_id: sellerId });
    res.status(201).json({ message: "Produk berhasil ditambahkan", id: newId });
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
    const deleted = await ProductModel.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Produk tidak ditemukan." });
    res.json({ message: "Produk berhasil dihapus." });
  } catch (error) {
    console.error("❌ Gagal hapus produk:", error);
    res.status(500).json({ message: "Gagal menghapus produk." });
  }
};
