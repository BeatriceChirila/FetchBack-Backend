const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const pets = await prisma.pet.findMany({
        include: { clinic: true }
    });
    pets.forEach(p => {
        console.log(`Pet: ${p.species} | ClinicID: ${p.clinicId} | ClinicName: ${p.clinic?.name || 'None'}`);
    });
}
main();