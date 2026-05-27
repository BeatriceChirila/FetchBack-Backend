const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-fetchback-key-change-me";
const setupUsers = async () => {

    if (process.env.NODE_ENV === 'test') return;


    
    const count = await prisma.user.count();
    if (count === 0) {

        const clinic1 = await prisma.clinic.create({ data: {name: "EuroVet Cluj", address: "Strada Clinicilor 1, Cluj-Napoca", phone: "0264-123456", mapUrl: "https://maps.google.com/?q=Strada+Clinicilor+1,+Cluj-Napoca" } });
        const clinic2 = await prisma.clinic.create({ data: {name: "NetVet Bucharest", address: "Bulevardul Veterinarilor 10, Bucharest", phone: "021-654321", mapUrl: "https://maps.google.com/?q=Bulevardul+Veterinarilor+10,+Bucharest" } });

        await prisma.user.create({ data: { email: 'smith@eurovet.com', password: 'pwd', name: 'John Smith', role: 'VET', clinicId: clinic1.id } });
        await prisma.user.create({ data: { email: 'john.doe@netvet.com', password: 'pwd', name: 'Jane Doe', role: 'VET', clinicId: clinic2.id } });
        await prisma.user.create({ data: { email: 'jane@gmail.com', password: 'pwd', name: 'Jane Austen', role: 'USER' } });
        console.log('✅ Created default users: smith@eurovet.com (VET) and john.doe@netvet.com (VET) and jane@gmail.com (USER)');
    }
};

setupUsers(); // Call the setup function immediately to ensure users are created when the server starts

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email }, include: { clinic: true } });

    console.log("Found user:", user);

    if (user && user.password === password) {
        const payload = {
            userId: user.id,
            role: user.role,
            clinicId: user.clinicId
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('authToken', token, { 
            httpOnly: true, 
            secure: true,
            sameSite: 'none',
            maxAge: 3600000 // 1 hour in milliseconds
        });

        res.json({
            success: true,
            email: user.email,
            name: user.name,
            role: user.role,
            clinicName: user.clinic ? user.clinic.name : null
        })

    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

router.post('/register', async (req, res) => {
    const {email, password, name, role, clinicId} = req.body;
    try {
        const newUser = await prisma.user.create({
            data: {
                email,
                password,
                name,
                role: role || 'USER',
                clinicId: clinicId ? parseInt(clinicId) : null
            }
        });
        res.status(201).json({ success: true, role: newUser.role, email: newUser.email, clinicId: newUser.clinicId });
    } catch (error) {
        res.status(400).json({ error: "Email already exists" });
    }
});


router.post('/logout', (req, res) => {
    res.clearCookie('authToken', { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none' 
    });
    res.json({ success: true, message: "Logged out successfully" });
});

module.exports = router;