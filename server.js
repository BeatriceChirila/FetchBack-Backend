const express = require('express');
const cors = require('cors');
const os = require('os');
const petRoutes = require('./routes/petRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 3001;
const HOST = '0.0.0.0';

const https = require('https');
const fs = require('fs');

const cookieParser = require('cookie-parser');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
})); 
app.use(express.json({limit: '50mb'})); 

app.use('/api/pets', petRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/clinics', async (req, res) => {
    try {
        const clinics = await prisma.clinic.findMany();
        res.json(clinics);
    } catch (error) {
        console.error("Error fetching clinics:", error);
        res.status(500).json({ error: "Could not fetch clinics" });
    }
});

app.get('/', (req, res) => {
    res.send('Welcome!');
});

const getNetworkIp = () => {
    const interfaces = os.networkInterfaces();
    for(const name of Object.keys(interfaces)) {
        for(const iface of interfaces[name]) {
            if(iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
};


const sslOptions = {
    key: fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.cert')
};

    https.createServer(sslOptions, app).listen(3001, '0.0.0.0', () => {
    console.log('Server running on https://localhost:3001');
});
