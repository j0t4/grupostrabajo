import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rootGroup = await prisma.workgroup.upsert({
    where: { id: 1 }, // Assuming id 1 for the root group
    update: {},
    create: {
      id: 1,
      name: 'root group',
      parentId: 1, // Set parentId to its own id
    },
  });
  console.log({ rootGroup });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });