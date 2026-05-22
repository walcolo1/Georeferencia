const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.post('/login', login);
console.log("Ruta login activa");

// Only Administrador can register new users
router.post('/register', verifyToken, requireRole('Administrador'), register);

module.exports = router;
