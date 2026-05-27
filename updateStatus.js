/// THIS WAS FOR DEUG, IGNORE IN THE FUTURE
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update the first pet we find to 'Contacted'
  const pet = await prisma.pet.findFirst();
  if (pet) {
    await prisma.pet.update({
      where: { id: pet.id },
      data: { status: 'Contacted' }
    });
    console.log(`✅ Updated pet ${pet.id} to status: Contacted`);
  }
}
main();