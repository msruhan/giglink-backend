import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

export const UserModel = {
  async findAll() {
    const [rows] = await pool.query(
      "SELECT id, name, email, whatsapp, role, is_verified, created_at FROM users ORDER BY id DESC"
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(
      "SELECT id, name, email, whatsapp, bio, role, is_verified, created_at FROM users WHERE id = ?",
      [id]
    );
    return rows[0];
  },

  async update(id, data) {
    const sql = `
      UPDATE users 
      SET name = ?, email = ?, whatsapp = ?, bio = ?, role = ?, updated_at = NOW()
      WHERE id = ?
    `;
    const [result] = await pool.query(sql, [
      data.name,
      data.email,
      data.whatsapp,
      data.bio,
      data.role,
      id,
    ]);
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },

  // Cari user berdasarkan email
  async findByEmail(email) {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
  },

  // Buat user baru
  async create(data) {
    const sql = `
      INSERT INTO users (name, email, password, role, whatsapp, telegram, avatar, bio, is_verified, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())
    `;
    const [result] = await pool.query(sql, [
      data.name,
      data.email,
      data.password,
      data.role || "buyer",
      data.whatsapp || null,
      data.telegram || null,
      data.avatar || null,
      data.bio || null,
    ]);
    return result.insertId;
  },
};
