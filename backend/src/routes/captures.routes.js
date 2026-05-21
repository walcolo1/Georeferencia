const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');

// In future phase, captures controller logic will be here
router.get('/', verifyToken, (req, res) => {
    res.json({ message: 'Captures list', user: req.userId });
});

router.post('/', verifyToken, (req, res) => {
    // Audit log: injecting user ID into created_by automatically
    res.json({ message: 'Capture received', created_by: req.userId });
});

module.exports = router;
