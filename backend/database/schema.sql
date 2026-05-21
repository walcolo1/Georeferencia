CREATE TABLE IF NOT EXISTS captures (
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
);

CREATE TABLE IF NOT EXISTS sync_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    capture_id VARCHAR(36),
    sync_date TIMESTAMP,
    target VARCHAR(50),
    status ENUM('success', 'failed')
);
