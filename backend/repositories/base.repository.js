const { pool } = require('../config/database');

/**
 * BaseRepository
 * Generic CRUD helpers shared by every entity repository. Controllers
 * should never call `pool.execute` directly for tables covered by a
 * repository — this is the abstraction layer schema_v2.sql's data model
 * was designed against, so a future DB engine swap or query optimization
 * only has to change one place per entity.
 */
class BaseRepository {
  /**
   * @param {string} table - table name
   * @param {string} [primaryKey='id']
   */
  constructor(table, primaryKey = 'id') {
    this.table = table;
    this.primaryKey = primaryKey;
  }

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.table} WHERE ${this.primaryKey} = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  async findOneBy(column, value) {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.table} WHERE ${column} = ? LIMIT 1`,
      [value]
    );
    return rows[0] || null;
  }

  async findAllBy(column, value) {
    const [rows] = await pool.execute(
      `SELECT * FROM ${this.table} WHERE ${column} = ?`,
      [value]
    );
    return rows;
  }

  async create(data) {
    const columns = Object.keys(data);
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(data);
    const [result] = await pool.execute(
      `INSERT INTO ${this.table} (${columns.join(', ')}) VALUES (${placeholders})`,
      values
    );
    return result.insertId;
  }

  async updateById(id, data) {
    const columns = Object.keys(data);
    if (columns.length === 0) return false;
    const setClause = columns.map((c) => `${c} = ?`).join(', ');
    const values = [...Object.values(data), id];
    const [result] = await pool.execute(
      `UPDATE ${this.table} SET ${setClause} WHERE ${this.primaryKey} = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  async deleteById(id) {
    const [result] = await pool.execute(
      `DELETE FROM ${this.table} WHERE ${this.primaryKey} = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = BaseRepository;
