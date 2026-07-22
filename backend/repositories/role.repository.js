const { pool } = require('../config/database');
const BaseRepository = require('./base.repository');

class RoleRepository extends BaseRepository {
  constructor() {
    super('roles');
  }

  async findByName(name) {
    return this.findOneBy('name', name);
  }

  /** Roles held by a user, as an array of role name strings, e.g. ['donor','patient']. */
  async getRoleNamesForUser(userId) {
    const [rows] = await pool.execute(
      `SELECT r.name FROM roles r
       JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [userId]
    );
    return rows.map((r) => r.name);
  }

  /** Adds a role to a user if they don't already have it. Returns true if newly added. */
  async addRoleToUser(userId, roleName) {
    const role = await this.findByName(roleName);
    if (!role) throw new Error(`Unknown role: ${roleName}`);

    const [existing] = await pool.execute(
      'SELECT id FROM user_roles WHERE user_id = ? AND role_id = ?',
      [userId, role.id]
    );
    if (existing.length > 0) return false;

    await pool.execute(
      'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
      [userId, role.id]
    );
    return true;
  }

  async userHasRole(userId, roleName) {
    const [rows] = await pool.execute(
      `SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id
       WHERE ur.user_id = ? AND r.name = ? LIMIT 1`,
      [userId, roleName]
    );
    return rows.length > 0;
  }
}

module.exports = new RoleRepository();
