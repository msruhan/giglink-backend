import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

export const ProductModel = {
  // Ambil semua produk
  async findAll() {
    const [rows] = await pool.query(`
      SELECT 
        p.*, 
        u.name AS seller_name, 
        u.email AS seller_email 
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      ORDER BY p.id DESC
    `);
    return rows;
  },

  // Ambil produk berdasarkan ID
  async findById(id) {
    const [rows] = await pool.query(`
      SELECT 
        p.*, 
        u.name AS seller_name, 
        u.email AS seller_email 
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.id = ?
    `, [id]);
    return rows[0];
  },

  // Tambah produk baru
  async create(data) {
    const sql = `
      INSERT INTO products 
      (seller_id, title, slug, short_description, description, spesification, info, price, currency, stock, status, image_url, image_url_1, image_url_2, image_url_3, image_url_4)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [
      data.seller_id,
      data.title,
      data.slug || null,
      data.short_description || null,
      data.description || null,
      data.spesification || null,
      data.info || null,
      data.price || 0,
      data.currency || "IDR",
      data.stock || 1,
      data.status || "active",
      data.image_url_1 || null,
      data.image_url_2 || null,
      data.image_url_3 || null,
      data.image_url_4 || null,
      data.image_url_5 || null,
    ]);
    return result.insertId;
  },

  // Update produk
  async update(id, data) {
    const sql = `
      UPDATE products SET
        title = ?, 
        slug = ?, 
        short_description = ?, 
        description = ?, 
        spesification = ?, 
        info = ?, 
        price = ?, 
        currency = ?, 
        stock = ?, 
        status = ?, 
        updated_at = NOW()
      WHERE id = ?
    `;
    const [result] = await pool.query(sql, [
      data.title,
      data.slug,
      data.short_description,
      data.description,
      data.spesification,
      data.info,
      data.price,
      data.currency,
      data.stock,
      data.status,
      id,
    ]);
    return result.affectedRows > 0;
  },

  // Hapus produk
  async delete(id) {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },
};
