const express = require('express');
const router = express.Router();
const { getCaptures, createCapture, updateCapture, deleteCapture, syncCaptures } = require('../controllers/capture.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/', getCaptures);
router.post('/', createCapture);
router.post('/sync', syncCaptures);
router.put('/:id', updateCapture);
router.delete('/:id', deleteCapture);

module.exports = router;
