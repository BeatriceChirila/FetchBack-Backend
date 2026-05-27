const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('../routes/authRoutes');
const repo = require('../data/petRepository');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

describe('Auth Routes - Login & Register', () => {

    beforeEach(async () => {
        await prisma.user.deleteMany({});
        await prisma.clinic.deleteMany({});
        
        await prisma.clinic.create({
            data: {
                id: 1,
                name: "Test Clinic",
                address: "123 Test St",
                phone: "000-0000",
                mapUrl: "url"
            }
        });
    });

    describe('POST /api/auth/register', () => {
        test('Should successfully register a normal USER', async () => {
            const res = await request(app).post('/api/auth/register').send({
                email: 'user@test.com',
                password: 'password123',
                name: 'Test User',
                role: 'USER'
            });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.email).toBe('user@test.com');
            expect(res.body.role).toBe('USER');
        });

        test('Should successfully register a VET and attach clinicId', async () => {
            const res = await request(app).post('/api/auth/register').send({
                email: 'vet@test.com',
                password: 'password123',
                name: 'Test Vet',
                role: 'VET',
                clinicId: 1
            });

            expect(res.status).toBe(201);
            expect(res.body.role).toBe('VET');
            expect(res.body.clinicId).toBe(1);
        });

        test('Should return 400 if email already exists', async () => {
            // Register once
            await request(app).post('/api/auth/register').send({
                email: 'duplicate@test.com',
                password: 'password123'
            });

            // Try to register the exact same email again
            const res = await request(app).post('/api/auth/register').send({
                email: 'duplicate@test.com',
                password: 'newpassword'
            });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Email already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Pre-register a user before login tests
            await request(app).post('/api/auth/register').send({
                email: 'login@test.com',
                password: 'securepassword',
                name: 'Login Tester',
                role: 'USER'
            });
        });

        test('Should login successfully and return a cookie', async () => {
            const res = await request(app).post('/api/auth/login').send({
                email: 'login@test.com',
                password: 'securepassword'
            });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            // Check that the Set-Cookie header exists!
            expect(res.headers['set-cookie']).toBeDefined(); 
        });

        test('Should return 401 for invalid password', async () => {
            const res = await request(app).post('/api/auth/login').send({
                email: 'login@test.com',
                password: 'WRONGPASSWORD'
            });

            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Invalid credentials');
        });
    });

    describe('POST /api/auth/logout', () => {
        test('Should clear the authToken cookie', async () => {
            const res = await request(app).post('/api/auth/logout');
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            // Verify the cookie is instructed to expire immediately
            expect(res.headers['set-cookie'][0]).toMatch(/authToken=;/);
        });
    });
});