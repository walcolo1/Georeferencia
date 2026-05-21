const pool = require('./backend/src/config/db');
const sql = `CREATE TABLE IF NOT EXISTS captures (
    id VARCHAR(36) PRIMARY KEY,
    barcode VARCHAR(255) NOT NULL,
    payload JSON,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    captured_at TIMESTAMP,
    status ENUM('pending', 'synced') DEFAULT 'pending',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);`;
pool.query('DROP TABLE IF EXISTS captures').then(() => pool.query(sql)).then(() => { console.log('Recreated captures table'); process.exit(0); }).catch(console.error);
