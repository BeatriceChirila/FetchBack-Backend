const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');

jest.mock('../middleware/authMiddleware', () => ({
    verifyToken: (req, res, next) => {
        req.user = { userId: 1, role: 'VET', clinicId: 1 };
        next();
    },
    requireVet: (req, res, next) => {
        next();
    }
}));

const petRoutes = require('../routes/petRoutes');
const repo = require('../data/petRepository');
const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/pets', petRoutes);

const basePet = {
    species: 'Dog',
    breed: 'Golden Retriever',
    gender: 'Female',
    coatColour: 'Golden',
    eyeColour: 'Brown',
    traits: 'Very happy',
    age: 2,
    microchip: 'no',
    healthState: 'Healthy',
    status: 'Unidentified',
    image: null,
    dateAdmitted: 'Nov 12'
};

describe('FetchBack API Routes & Prisma Storage', () => {

    beforeEach(async () => {
        // Delete in dependency order: pets first (they reference clinic), then clinic
        await repo.clearPets();
        await prisma.clinic.deleteMany({ where: { id: 1 } });

        await prisma.clinic.create({
            data: {
                id: 1,
                name: "Test Vet Clinic",
                address: "123 Mockingbird Lane",
                phone: "555-0000",
                mapUrl: "url"
            }
        });
    });

    afterAll(async () => {
        // Clean up and disconnect so Jest doesn't hang
        await repo.clearPets();
        await prisma.clinic.deleteMany({ where: { id: 1 } });
        await prisma.$disconnect();
    });

    test('GET /api/pets > should return an empty list initially', async () => {
        const res = await request(app).get('/api/pets');
        expect(res.status).toBe(200);
        expect(res.body.total).toBe(0);
    });

    test('POST /api/pets > should add a valid pet', async () => {
        const res = await request(app).post('/api/pets').send(basePet);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.species).toBe('Dog');
    });

    test('POST /api/pets > should return 400 if required data is missing', async () => {
        const invalidPet = { ...basePet, species: undefined };
        const res = await request(app).post('/api/pets').send(invalidPet);
        
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    test('GET /api/pets/stats > should return statistics', async () => {
        await request(app).post('/api/pets').send(basePet); 
        
        const res = await request(app).get('/api/pets/stats');
        expect(res.status).toBe(200);
        expect(res.body.unidentified).toBe(1);
    });

    test('PUT /api/pets/:id > should update an existing pet', async () => {
        const createRes = await request(app).post('/api/pets').send(basePet);
        const id = createRes.body.id;

        const res = await request(app)
            .put(`/api/pets/${id}`)
            .send({ ...basePet, age: 10 }); 
        
        expect(res.status).toBe(200);
        expect(res.body.age).toBe(10);
    });

    test('DELETE /api/pets/:id > should delete an existing pet', async () => {
        const createRes = await request(app).post('/api/pets').send(basePet);
        const id = createRes.body.id;

        const res = await request(app).delete(`/api/pets/${id}`);
        expect(res.status).toBe(200);
    });

    test('DELETE /api/pets/:id > should return 404 if pet ID does not exist', async () => {
        const res = await request(app).delete('/api/pets/999999');
        expect(res.status).toBe(404);
    });
});