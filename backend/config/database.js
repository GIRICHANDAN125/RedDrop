const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'reddropai',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const initializeSchemaV2 = async (connection) => {
  try {
    // 1. Alter users table columns to be nullable/compatible
    try {
      await connection.query(`ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE`);
    } catch {}

    try {
      await connection.query(`ALTER TABLE users MODIFY COLUMN name VARCHAR(100) NULL`);
    } catch {}

    try {
      await connection.query(`ALTER TABLE users MODIFY COLUMN phone VARCHAR(20) NULL`);
    } catch {}

    try {
      await connection.query(`ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL`);
    } catch {}

    // 2. Roles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name ENUM('donor', 'patient', 'hospital', 'admin', 'volunteer', 'organization') NOT NULL UNIQUE,
          description VARCHAR(255) NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Seed roles
    await connection.query(`
      INSERT INTO roles (name, description) VALUES
          ('donor', 'Can respond to blood requests and donate'),
          ('patient', 'Can create blood requests for themselves or a dependent'),
          ('hospital', 'Verified hospital/blood bank account'),
          ('admin', 'Platform administrator'),
          ('volunteer', 'Verified event & camp coordinator'),
          ('organization', 'NGO / Corporate / College partner account')
      ON DUPLICATE KEY UPDATE description = VALUES(description);
    `);

    // 3. User Roles junction table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          role_id INT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
          UNIQUE (user_id, role_id)
      ) ENGINE=InnoDB;
    `);

    // 4. User Profiles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL UNIQUE,
          name VARCHAR(100) NULL,
          phone VARCHAR(20) NULL UNIQUE,
          gender ENUM('male', 'female', 'other', 'prefer_not_to_say') NULL,
          dob DATE NULL,
          blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NULL,
          avatar_url VARCHAR(255) NULL,
          avatar_public_id VARCHAR(255) NULL,
          emergency_contact_name VARCHAR(100) NULL,
          emergency_contact_phone VARCHAR(20) NULL,
          emergency_contact_relation VARCHAR(50) NULL,
          address VARCHAR(255) NULL,
          city VARCHAR(100) NULL,
          state VARCHAR(100) NULL,
          pincode VARCHAR(20) NULL,
          location_lat DECIMAL(10, 8) NULL,
          location_lng DECIMAL(11, 8) NULL,
          medical_conditions TEXT NULL,
          is_profile_complete BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 5. OTP Logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS otp_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NULL,
          email VARCHAR(150) NOT NULL,
          otp_code_hash VARCHAR(255) NOT NULL,
          purpose ENUM('login', 'signup', 'email_verify', 'password_reset') NOT NULL,
          expires_at DATETIME NOT NULL,
          consumed_at DATETIME NULL,
          attempt_count INT DEFAULT 0,
          ip_address VARCHAR(45) NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 6. Donor Profiles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS donor_profiles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL UNIQUE,
          is_available BOOLEAN DEFAULT TRUE,
          last_donation_date DATE NULL,
          hemoglobin_level DECIMAL(5, 2) NULL,
          weight DECIMAL(5, 2) NULL,
          age INT NULL,
          has_chronic_disease BOOLEAN DEFAULT FALSE,
          is_fit_to_donate BOOLEAN DEFAULT TRUE,
          total_donations INT DEFAULT 0,
          lives_saved INT DEFAULT 0,
          requests_accepted INT DEFAULT 0,
          requests_declined INT DEFAULT 0,
          response_rate DECIMAL(5, 2) DEFAULT 100.00,
          is_verified BOOLEAN DEFAULT FALSE,
          max_distance_km INT DEFAULT 20,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    console.log('⚡ Database Schema V2 synchronized successfully.');
  } catch (err) {
    console.warn('⚠️ Schema V2 sync warning:', err.message);
  }
};

const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ MySQL Connected: ${connection.config.host}`);
    await initializeSchemaV2(connection);
    connection.release();
  } catch (error) {
    console.error('❌ MySQL Connection Failed:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };