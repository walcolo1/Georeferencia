const pool = require('../config/db');
const crypto = require('crypto');

const getCaptures = async (req, res) => {
    try {
        let query = 'SELECT * FROM captures';
        const params = [];

        if (req.userRole !== 'Administrador') {
            query += ' WHERE created_by = ?';
            params.push(req.userId);
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await pool.query(query, params);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving captures', error: error.message });
    }
};

const createCapture = async (req, res) => {
    try {
        const { barcode, payload, latitude, longitude } = req.body;
        const id = crypto.randomUUID();
        const created_by = req.userId; // Enforced from token

        if (!barcode) {
            return res.status(400).json({ message: 'Barcode is required' });
        }
        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Location (latitude and longitude) is required' });
        }

        const payloadStr = typeof payload === 'object' ? JSON.stringify(payload) : payload;

        await pool.query(
            `INSERT INTO captures (id, barcode, payload, latitude, longitude, captured_at, status, created_by) 
             VALUES (?, ?, ?, ?, ?, NOW(), 'pending', ?)`,
            [id, barcode, payloadStr, latitude, longitude, created_by]
        );

        res.status(201).json({ message: 'Capture created successfully', id });
    } catch (error) {
        res.status(500).json({ message: 'Error creating capture', error: error.message });
    }
};

const updateCapture = async (req, res) => {
    try {
        const { id } = req.params;
        const { barcode, payload, status } = req.body;

        // Check ownership if not Administrador
        if (req.userRole !== 'Administrador') {
            const [existing] = await pool.query('SELECT created_by FROM captures WHERE id = ?', [id]);
            if (existing.length === 0) return res.status(404).json({ message: 'Capture not found' });
            if (String(existing[0].created_by) !== String(req.userId)) return res.status(403).json({ message: 'Forbidden' });
        }

        const payloadStr = typeof payload === 'object' ? JSON.stringify(payload) : payload;

        await pool.query(
            'UPDATE captures SET barcode = COALESCE(?, barcode), payload = COALESCE(?, payload), status = COALESCE(?, status) WHERE id = ?',
            [barcode, payloadStr, status, id]
        );

        res.status(200).json({ message: 'Capture updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating capture', error: error.message });
    }
};

const deleteCapture = async (req, res) => {
    try {
        const { id } = req.params;

        // Check ownership if not Administrador
        if (req.userRole !== 'Administrador') {
            const [existing] = await pool.query('SELECT created_by FROM captures WHERE id = ?', [id]);
            if (existing.length === 0) return res.status(404).json({ message: 'Capture not found' });
            if (String(existing[0].created_by) !== String(req.userId)) return res.status(403).json({ message: 'Forbidden' });
        }

        await pool.query('DELETE FROM captures WHERE id = ?', [id]);
        res.status(200).json({ message: 'Capture deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting capture', error: error.message });
    }
};

const syncCaptures = async (req, res) => {
    try {
        const userId = req.userId;

        // Update status to 'synced' for all pending captures belonging to the user
        const [result] = await pool.query(
            "UPDATE captures SET status = 'synced' WHERE created_by = ? AND status = 'pending'",
            [userId]
        );

        res.status(200).json({ 
            message: 'Sincronización completada con éxito', 
            syncedCount: result.affectedRows 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en la sincronización', error: error.message });
    }
};

module.exports = { getCaptures, createCapture, updateCapture, deleteCapture, syncCaptures };
