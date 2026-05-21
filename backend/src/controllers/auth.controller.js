const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');

const register = async (req, res) => {
    try {
        const { username, password, role_id } = req.body;
        
        if (!username || !password || !role_id) {
            return res.status(400).json({ message: 'Missing fields' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
            [username, username, hashedPassword, role_id]
        );

        res.status(201).json({ message: 'User registered successfully', email: username });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Missing credentials' });
        }

        const [rows] = await pool.query(
            `SELECT id, name, email, password FROM users WHERE email = ?`,
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = rows[0];
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '12h' }
        );

        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

module.exports = { register, login };
