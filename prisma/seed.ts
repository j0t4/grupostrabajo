import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rootGroup = await prisma.workgroup.upsert({
    where: { id: 1 }, // Assuming id 1 for the root group
    update: {},
    create: {
      id: 1,
      name: 'root group',
      parentId: null, // Set parentId to null for the root group
    },
  });
  console.log({ rootGroup });

  // You can add more seeding logic here, for example:
  // const member1 = await prisma.member.upsert(...);
  // const meeting1 = await prisma.meeting.upsert(...);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
