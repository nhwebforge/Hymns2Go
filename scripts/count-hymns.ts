import { prisma } from '../lib/db/prisma';

async function main() {
  const total = await prisma.hymn.count();
  console.log(`Total hymns in database: ${total}`);

  // Get a few sample hymns from NEH
  const samples = await prisma.hymn.findMany({
    where: {
      title: {
        contains: 'Wake, O wake',
      },
    },
    select: {
      id: true,
      title: true,
      author: true,
      firstLine: true,
    },
    take: 5,
  });

  console.log('\nSample hymns imported:');
  samples.forEach(hymn => {
    console.log(`- ${hymn.title} by ${hymn.author || 'Unknown'}`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);
