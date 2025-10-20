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
    // Parse spesification dan pembayaran JSON string ke object
    return rows.map(row => {
      if (row.spesification && typeof row.spesification === "string") {
        try {
          row.spesification = JSON.parse(row.spesification);
        } catch {}
      }
      if (row.pembayaran && typeof row.pembayaran === "string") {
        try {
          row.pembayaran = JSON.parse(row.pembayaran);
        } catch {}
      }
      return row;
    });
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
    const row = rows[0];
    if (row && row.spesification && typeof row.spesification === "string") {
      try {
        row.spesification = JSON.parse(row.spesification);
      } catch {}
    }
    if (row && row.pembayaran && typeof row.pembayaran === "string") {
      try {
        row.pembayaran = JSON.parse(row.pembayaran);
      } catch {}
    }
    return row;
  },

  // Tambah produk baru
  async create(data) {
    // Pastikan spesification di-stringify jika berupa objek
    if (data.spesification && typeof data.spesification === "object") {
      data.spesification = JSON.stringify(data.spesification);
    }
    // Pastikan pembayaran di-stringify jika berupa objek
    if (data.pembayaran && typeof data.pembayaran === "object") {
      data.pembayaran = JSON.stringify(data.pembayaran);
    }
    const sql = `
      INSERT INTO products 
      (seller_id, sellerid, whatsapp, title, slug, short_description, description, kondisi, kelengkapan, kekurangan, kapasitas, penjual, spesification, pembayaran, info, price, currency, stock, status, image_url_1, image_url_2, image_url_3, image_url_4)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [
      data.seller_id,
      data.sellerid,
      data.whatsapp,
      data.title,
      data.slug || null,
      data.short_description || null,
      data.description || null,
      data.kondisi || null,
      data.kelengkapan || null,
      data.kekurangan || null,
      data.kapasitas || null,
      data.penjual || null,
      data.spesification || null,
      data.pembayaran || null,
      data.info || null,
      data.price || 0,
      data.currency || "IDR",
      data.stock || 1,
      data.status || "active",
      data.image_url_1 || "",
      data.image_url_2 || "",
      data.image_url_3 || "",
      data.image_url_4 || "",
      data.image_url_5 || "",
    ]);
    return result.insertId;
  },

  // Patch produk (update sebagian field)
  async patch(id, data) {
    // Stringify spesification dan pembayaran jika berupa objek
    if (data.spesification && typeof data.spesification === "object") {
      data.spesification = JSON.stringify(data.spesification);
    }
    if (data.pembayaran && typeof data.pembayaran === "object") {
      data.pembayaran = JSON.stringify(data.pembayaran);
    }
  // Build dynamic SQL
  const fields = Object.keys(data);
  if (fields.length === 0) return false;
  const setClause = fields.map(f => `${f} = ?`).join(", ");
  const sql = `UPDATE products SET ${setClause}, updated_at = NOW() WHERE id = ?`;
  const values = fields.map(f => data[f]);
  values.push(id);
  console.log("PATCH SQL:", sql, values);
  const [result] = await pool.query(sql, values);
  return result.affectedRows > 0;
  },

  // Update produk
  async update(id, data) {
    // Pastikan spesification di-stringify jika berupa objek
    if (data.spesification && typeof data.spesification === "object") {
      data.spesification = JSON.stringify(data.spesification);
    }
    // Pastikan pembayaran di-stringify jika berupa objek
    if (data.pembayaran && typeof data.pembayaran === "object") {
      data.pembayaran = JSON.stringify(data.pembayaran);
    }
    const sql = `
      UPDATE products SET
        sellerid = ?,
        whatsapp = ?,
        title = ?, 
        slug = ?, 
        short_description = ?, 
        description = ?, 
        kondisi = ?, 
        kelengkapan = ?, 
        kekurangan = ?, 
        kapasitas = ?, 
        penjual = ?, 
        spesification = ?,
        pembayaran = ?,
        info = ?, 
        price = ?, 
        currency = ?, 
        stock = ?, 
        status = ?, 
        updated_at = NOW()
      WHERE id = ?
    `;
    const [result] = await pool.query(sql, [
      data.sellerid,
      data.whatsapp,
      data.title,
      data.slug,
      data.short_description,
      data.description,
      data.kondisi,
      data.kelengkapan,
      data.kekurangan,
      data.kapasitas,
      data.penjual,
      data.spesification,
      data.pembayaran,
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
