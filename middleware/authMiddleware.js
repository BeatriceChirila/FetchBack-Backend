const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-fetchback-key-change-me";

const verifyToken = (req, res, next) => {
    const token = req.cookies.authToken;
    
    if (!token) {
        return res.status(401).json({ error: "Access denied. Please log in." });
    }

    try {
        // Verify the token hasn't expired
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified; // Attach the payload (userId, role, clinicId) to the request
        next()
    } catch (err) {
        res.status(401).json({ error: "Session expired. Please log in again." });
    }
};

// Check if they have VET role
const requireVet = (req, res, next) => {
    if (!req.user || req.user.role !== 'VET') {
        return res.status(403).json({ error: "Access denied. Vet privileges required." });
    }
    next();
};

module.exports = { verifyToken, requireVet };