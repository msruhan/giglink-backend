
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
      (seller_id, sellerid, title, price, slug, description, feature, info, penjual, whatsapp, image_url_1, image_url_2, image_url_3, image_url_4, license_type, pembayaran, stock, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const pembayaranStr = typeof data.pembayaran === "object" ? JSON.stringify(data.pembayaran) : data.pembayaran || '{}';
    const [result] = await pool.query(sql, [
      data.seller_id,
      data.sellerid,
      data.title,
      data.price || 0,
      data.slug || null,
      data.description || null,
      data.feature || null,
      data.info || null,
      data.penjual || null,
      data.whatsapp || null,
      data.image_url_1,
      data.image_url_2 || '',
      data.image_url_3 || '',
      data.image_url_4 || '',
      data.license_type || 'license',
      pembayaranStr,
      data.stock || 0,
      data.status || 'active',
    ]);
    return result.insertId;
  },
  async update(id, data) {
    const sql = `
      UPDATE licenses SET
        sellerid = ?,
        title = ?,
        feature = ?,
        info = ?,
        penjual = ?,
        whatsapp = ?,
        slug = ?,
        description = ?,
        image_url_1 = ?,
        image_url_2 = ?,
        image_url_3 = ?,
        image_url_4 = ?,
        price = ?,
        license_type = ?,
        pembayaran = ?,
        stock = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
    `;
    const pembayaranStr = typeof data.pembayaran === "object" ? JSON.stringify(data.pembayaran) : data.pembayaran || '{}';
    const [result] = await pool.query(sql, [
      data.title,
      data.sellerid,
      data.slug,
      data.description,
      data.feature,
      data.info,
      data.penjual,
      data.whatsapp,
      data.image_url_1,
      data.image_url_2,
      data.image_url_3,
      data.image_url_4,
      data.price,
      data.license_type,
      pembayaranStr,
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
  
    // Patch license (update sebagian field)
  async patch(id, data) {
    // Stringify pembayaran jika berupa objek
    if (data.pembayaran && typeof data.pembayaran === "object") {
      data.pembayaran = JSON.stringify(data.pembayaran);
    }
    const fields = Object.keys(data);
    if (fields.length === 0) return false;
    const setClause = fields.map(f => `${f} = ?`).join(", ");
    const sql = `UPDATE licenses SET ${setClause}, updated_at = NOW() WHERE id = ?`;
    const values = fields.map(f => data[f]);
    values.push(id);
    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  },
};
