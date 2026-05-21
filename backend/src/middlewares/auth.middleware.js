const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Malformed token' });

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

const requireRole = (role) => {
    return (req, res, next) => {
        if (req.userRole !== role && req.userRole !== 'Administrador') {
            return res.status(403).json({ message: 'Forbidden: Insufficient role' });
        }
        next();
    };
};

module.exports = { verifyToken, requireRole };
