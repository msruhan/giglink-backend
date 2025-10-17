import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

export const TechnicianModel = {
  // Ambil semua technician beserta nama user
  async findAll() {
    const [rows] = await pool.query(`
      SELECT 
        t.*, 
        u.name AS user_name, 
        u.email AS user_email 
      FROM technicians t
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.id DESC
    `);
    return rows;
  },

  // Ambil technician berdasarkan ID beserta nama user
  async findById(id) {
    const [rows] = await pool.query(`
      SELECT 
        t.*, 
        u.name AS user_name, 
        u.email AS user_email 
      FROM technicians t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `, [id]);
    return rows[0];
  },

  // Tambah technician baru
  async create(data) {
    const sql = `
      INSERT INTO technicians 
      (user_id, display_name, title, short_description, description, experience, image_url, info, location, hourly_rate_min, hourly_rate_max, skills, experience_years, completed_projects, rating, whatsapp, email, facebook, youtube, instagram, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await pool.query(sql, [
      data.user_id,
      data.display_name,
      data.title || null,
      data.short_description || null,
      data.description || null,
      data.experience || null,
      data.image_url || null,
      data.info || null,
      data.location || null,
      data.hourly_rate_min || null,
      data.hourly_rate_max || null,
      data.skills || null,
      data.experience_years || 0,
      data.completed_projects || 0,
      data.rating || null,
      data.whatsapp || null,
      data.email || null,
      data.facebook || null,
      data.youtube || null,
      data.instagram || null,
    ]);
    return result.insertId;
  },

  // Update technician
  async update(id, data) {
    const sql = `
      UPDATE technicians SET
        display_name = ?,
        title = ?,
        short_description = ?,
        description = ?,
        experience = ?,
        image_url = ?,
        info = ?,
        location = ?,
        hourly_rate_min = ?,
        hourly_rate_max = ?,
        skills = ?,
        experience_years = ?,
        completed_projects = ?,
        rating = ?,
        whatsapp = ?,
        email = ?,
        facebook = ?,
        youtube = ?,
        instagram = ?
      WHERE id = ?
    `;
    const [result] = await pool.query(sql, [
      data.display_name,
      data.title,
      data.short_description,
      data.description,
      data.experience,
      data.image_url,
      data.info,
      data.location,
      data.hourly_rate_min,
      data.hourly_rate_max,
      data.skills,
      data.experience_years,
      data.completed_projects,
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

  // Hapus technician
  async delete(id) {
    const [result] = await pool.query("DELETE FROM technicians WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },
};
