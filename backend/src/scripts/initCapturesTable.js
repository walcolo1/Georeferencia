const pool = require('../config/db');

const sql = `
CREATE TABLE IF NOT EXISTS captures (
    id VARCHAR(36) PRIMARY KEY,
    barcode VARCHAR(255) NOT NULL,
    payload JSON NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    captured_at TIMESTAMP NULL DEFAULT NULL,
    status ENUM('pending', 'synced') DEFAULT 'pending',
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
`;

async function init() {
    try {
        console.log("Verificando la conexión a la base de datos...");
        // Test connection
        await pool.query("SELECT 1");
        console.log("Conexión exitosa a MySQL.");

        console.log("Creando tabla 'captures' si no existe...");
        await pool.query(sql);
        console.log("Tabla 'captures' creada o verificada exitosamente.");
        process.exit(0);
    } catch (error) {
        console.error("Error crítico durante la inicialización de la tabla 'captures':", error);
        process.exit(1);
    }
}

init();
