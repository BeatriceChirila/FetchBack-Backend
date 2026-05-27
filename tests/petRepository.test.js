const repo = require('../data/petRepository');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Pet Repository Database Operations', () => {
    let testClinicId;
    let testPetId;

    beforeAll(async () => {
        const clinic = await prisma.clinic.create({
            data: { name: 'Test Clinic', address: '123 Test St' }
        });
        testClinicId = clinic.id;
    });

    afterAll(async () => {
        await prisma.pet.deleteMany({ where: { clinicId: testClinicId } });
        await prisma.clinic.delete({ where: { id: testClinicId } });
        await prisma.$disconnect();
    });

    test('CREATE: Should add a new pet to the database', async () => {
        const petData = {
            species: 'Dog',
            breed: 'Golden Retriever',
            gender: 'Male',
            coatColour: 'Golden',
            eyeColour: 'Brown',
            traits: 'Friendly',
            age: 3,
            microchip: 'yes',
            health: 'Healthy',
            status: 'Unidentified',
            image: null,
            dateAdmitted: 'May 22',
            clinicId: testClinicId
        };

        const newPet = await repo.addPet(petData);
        testPetId = newPet.id; // Save ID for future tests

        expect(newPet).toBeDefined();
        expect(newPet.species).toBe('Dog');
        expect(newPet.clinicId).toBe(testClinicId);
    });

    test('READ: Should fetch paginated pets and filter by clinicId', async () => {
        const result = await repo.getPaginatedPets(1, 5, testClinicId);
        
        expect(result.data.length).toBe(1);
        expect(result.data[0].id).toBe(testPetId);
        expect(result.total).toBe(1);
    });

    test('UPDATE: Should update an existing pet', async () => {
        const updateData = { status: 'Owner Contacted' };
        const updatedPet = await repo.updatePet(testPetId, updateData);

        expect(updatedPet.id).toBe(testPetId);
        expect(updatedPet.status).toBe('Owner Contacted');
    });

    test('STATS: Should calculate statistics correctly', async () => {
        const stats = await repo.getStats(testClinicId);
        
        expect(stats.unidentified).toBe(0);
        expect(stats.contacted).toBe(1);
    });

    test('DELETE: Should remove a pet from the database', async () => {
        await repo.deletePet(testPetId);
        
        // Verify it was deleted
        const result = await repo.getPaginatedPets(1, 5, testClinicId);
        expect(result.data.length).toBe(0);
        expect(result.total).toBe(0);
    });
});