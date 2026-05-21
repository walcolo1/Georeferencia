const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

// Only Administrador can view global sync_logs
router.get('/', verifyToken, requireRole('Administrador'), (req, res) => {
    res.json({ message: 'Global sync logs list' });
});

module.exports = router;
