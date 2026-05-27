const express = require('express');
const router = express.Router();
const repo = require('../data/petRepository');
const jwt = require('jsonwebtoken'); // Need this to optionally read the token
const { verifyToken, requireVet } = require('../middleware/authMiddleware');

const JWT_SECRET = "super-secret-fetchback-key-change-me";

//Public can view, but Vets get filtered data
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        let clinicId = null;

        const token = req.cookies.authToken;
        console.log("TOKEN:", token ? "present" : "missing");

        if (token) {
            try {
                const verified = jwt.verify(token, JWT_SECRET);
                console.log("VERIFIED PAYLOAD:", verified);
                if (verified.role === 'VET') {
                    clinicId = verified.clinicId;
                }
            } catch (err) {
                 console.log("TOKEN VERIFY ERROR:", err.message);
                // If token expired just ignore it and show the public list
            }
        }

        const paginatedResults = await repo.getPaginatedPets(page, limit, clinicId);
        res.json(paginatedResults);
    } catch (error) {
        console.error("GET /api/pets error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Vet stats
router.get('/stats', verifyToken, requireVet, async (req, res) => {
    try {
        const clinicId = req.user.clinicId; // Read from the verified token payload!
        const stats = await repo.getStats(clinicId);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// add pets
router.post('/', verifyToken, requireVet, async (req, res) => {
    try {
        const clinicId = req.user.clinicId; // Read from the verified token payload!
        const newPet = await repo.addPet({ ...req.body, clinicId });
        res.status(201).json(newPet);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// delete pets
router.delete('/:id', verifyToken, requireVet, async (req, res) => {
    try {
        await repo.deletePet(req.params.id);
        res.json({ message: "Pet deleted successfully" });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// update pets
router.put('/:id', verifyToken, requireVet, async (req, res) => {
    try {
        const updatedPet = await repo.updatePet(req.params.id, req.body);
        res.json(updatedPet);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

module.exports = router;