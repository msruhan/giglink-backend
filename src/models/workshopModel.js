// Model dasar untuk Workshop
// Silakan lengkapi sesuai struktur tabel di database Anda
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

export const WorkshopModel = {
  // Ambil semua workshop beserta nama owner
  async findAll() {
    const [rows] = await pool.query(`
      SELECT 
        w.*, 
        u.name AS owner_name, 
        u.email AS owner_email 
      FROM workshops w
      LEFT JOIN users u ON w.user_id = u.id
      ORDER BY w.id DESC
    `);
    return rows;
  },

  // Ambil workshop berdasarkan ID beserta nama owner
  async findById(id) {
    const [rows] = await pool.query(`
      SELECT 
        w.*, 
        u.name AS owner_name, 
        u.email AS owner_email 
      FROM workshops w
      LEFT JOIN users u ON w.user_id = u.id
      WHERE w.id = ?
    `, [id]);
    return rows[0];
  },

  // Tambah workshop baru
  async create(data) {
    const sql = `
      INSERT INTO workshops 
      (user_id, name, slug, short_description, description, info, specialization, image_url, operation_hours, location, total_devices_fixed, rating, whatsapp, email, facebook, youtube, instagram, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await pool.query(sql, [
      data.user_id,
      data.name,
      data.slug || null,
      data.short_description || null,
      data.description || null,
      data.info || null,
      data.specialization || null,
      data.image_url || null,
      data.operation_hours || null,
      data.location || null,
      data.total_devices_fixed || 0,
      data.rating || null,
      data.whatsapp || null,
      data.email || null,
      data.facebook || null,
      data.youtube || null,
      data.instagram || null,
    ]);
    return result.insertId;
  },

  // Update workshop
  async update(id, data) {
    const sql = `
      UPDATE workshops SET
        name = ?,
        slug = ?,
        short_description = ?,
        description = ?,
        info = ?,
        specialization = ?,
        image_url = ?,
        operation_hours = ?,
        location = ?,
        total_devices_fixed = ?,
        rating = ?,
        whatsapp = ?,
        email = ?,
        facebook = ?,
        youtube = ?,
        instagram = ?
      WHERE id = ?
    `;
    const [result] = await pool.query(sql, [
      data.name,
      data.slug,
      data.short_description,
      data.description,
      data.info,
      data.specialization,
      data.image_url,
      data.operation_hours,
      data.location,
      data.total_devices_fixed,
      data.rating,
      data.whatsapp,
      data.email,
      data.facebook,
      data.youtube,
      data.instagram,
      id,
    ]);
    return result.affectedRows > 0;
  },

  // Hapus workshop
  async delete(id) {
    const [result] = await pool.query("DELETE FROM workshops WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },
};
