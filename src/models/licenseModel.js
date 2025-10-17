import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

export const LicenseModel = {
  async findAll() {
    const [rows] = await pool.query(`
      SELECT l.*, u.name AS seller_name, u.email AS seller_email
      FROM licenses l
      LEFT JOIN users u ON l.seller_id = u.id
      ORDER BY l.id DESC
    `);
    return rows;
  },
  async findById(id) {
    const [rows] = await pool.query(`
      SELECT l.*, u.name AS seller_name, u.email AS seller_email
      FROM licenses l
      LEFT JOIN users u ON l.seller_id = u.id
      WHERE l.id = ?
    `, [id]);
    return rows[0];
  },
  async create(data) {
    const sql = `
      INSERT INTO licenses
      (seller_id, name, slug, description, spesification, image_url, price, license_type, stock, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [
      data.seller_id,
      data.name,
      data.slug || null,
      data.description || null,
      data.spesification || null,
      data.image_url || null,
      data.price || 0,
      data.license_type || 'license',
      data.stock || 0,
      data.status || 'active',
    ]);
    return result.insertId;
  },
  async update(id, data) {
    const sql = `
      UPDATE licenses SET
        name = ?,
        slug = ?,
        description = ?,
        spesification = ?,
        image_url = ?,
        price = ?,
        license_type = ?,
        stock = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
    `;
    const [result] = await pool.query(sql, [
      data.name,
      data.slug,
      data.description,
      data.spesification,
      data.image_url,
      data.price,
      data.license_type,
      data.stock,
      data.status,
      id,
    ]);
    return result.affectedRows > 0;
  },
  async delete(id) {
    const [result] = await pool.query("DELETE FROM licenses WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },
};
