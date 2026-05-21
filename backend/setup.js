const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setup() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });
        
        console.log('Connected to MySQL server.');
        await connection.query('CREATE DATABASE IF NOT EXISTS georreferencia_db;');
        console.log('Database georreferencia_db created/verified.');
        
        await connection.query('USE georreferencia_db;');
        
        const schemaPath = path.join(__dirname, '../backend/database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        const statements = schema.split(';').filter(stmt => stmt.trim() !== '');
        for (const stmt of statements) {
            await connection.query(stmt);
        }
        
        console.log('Schema executed successfully.');
        await connection.end();
    } catch (error) {
        console.error('Error in setup:', error);
    }
}

setup();
