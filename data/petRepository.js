const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const repo = {
    getPaginatedPets: async (page, limit, clinicId = null) => {
        const skip = (page - 1) * limit;
        const id = (clinicId !== undefined && clinicId !== null && clinicId !== "undefined") 
               ? parseInt(clinicId) 
               : null;
        const whereClause = id ? { clinicId: id } : {};
        
        console.log("Applying whereClause:", whereClause); // ADD THIS

        const pets = await prisma.pet.findMany({
            skip: skip,
            take: limit,
            where: whereClause,
            include: { clinic: true },
            orderBy: { id: 'desc' }
        });

        const total = await prisma.pet.count({ where: whereClause });
        const unidentified = await prisma.pet.count({ where: { ...whereClause, status: 'Unidentified' } });
        const contacted = await prisma.pet.count({ where: { ...whereClause, status: 'Owner Contacted' } });

        return {
            data: pets,
            total: total,
            unidentified: unidentified,
            contacted: contacted,
            page: page,
            limit: limit
        };
    },

    getStats: async (clinicId = null) => {
        const whereClause = clinicId ? { clinicId: parseInt(clinicId) } : {};
        const unidentified = await prisma.pet.count({ where: { ...whereClause, status: 'Unidentified' } });
        const contacted = await prisma.pet.count({ where: { ...whereClause, status: 'Owner Contacted' } });
        return { unidentified, contacted };
    },

    addPet: async (data) => {
        const clinicId = data.clinicId;

        const petData = {
            species: data.species,
            breed: data.breed,
            gender: data.gender,
            coatColour: data.coatColour,
            eyeColour: data.eyeColour,
            traits: data.traits,
            age: parseInt(data.age) || 0,
            microchip: data.microchip,
            healthState: data.health,
            status: data.status,
            image: data.image,
            dateAdmitted: data.dateAdmitted,
        };

        if (clinicId && clinicId !== "null" && clinicId !== null) {
        petData.clinic = { connect: { id: parseInt(clinicId) } };
    }

        return await prisma.pet.create({
            data: petData,
            include: { clinic: true }
        });
    },

    updatePet: async (id, data) => {
        return await prisma.pet.update({
            where: { id: parseInt(id) },
            data: {
                species: data.species,
                breed: data.breed,
                gender: data.gender,
                coatColour: data.coatColour,
                eyeColour: data.eyeColour,
                traits: data.traits,
                age: parseInt(data.age) || 0,
                microchip: data.microchip,
                healthState: data.health,
                status: data.status,
            }
        });
    },

    deletePet: async (id) => {
        return await prisma.pet.delete({
            where: { id: parseInt(id) }
        });
    },

    clearPets: async () => {
        await prisma.pet.deleteMany({});
        await prisma.clinic.deleteMany({});
    }
};

module.exports = repo;