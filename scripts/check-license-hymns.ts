import { prisma } from '../lib/db/prisma';
import { HymnStructure } from '../lib/hymn-processor/parser';

async function main() {
  const hymns = await prisma.hymn.findMany({
    select: {
      id: true,
      title: true,
      publisher: true,
      structure: true,
      rawText: true,
    },
  });

  const affectedHymns: Array<{
    id: string;
    title: string;
    publisher: string;
    firstRawTextLine: string;
  }> = [];

  for (const hymn of hymns) {
    const structure = hymn.structure as unknown as HymnStructure | null;
    const firstLine = structure?.sections?.[0]?.lines?.[0]?.text || '';
    if (firstLine.toLowerCase().includes('license')) {
      affectedHymns.push({
        id: hymn.id,
        title: hymn.title,
        publisher: hymn.publisher || 'Unknown',
        firstRawTextLine: hymn.rawText?.split('\n')[0] || 'No raw text',
      });
    }
  }

  // Group by publisher
  const byPublisher: Record<string, string[]> = {};
  affectedHymns.forEach((h) => {
    if (!byPublisher[h.publisher]) byPublisher[h.publisher] = [];
    byPublisher[h.publisher].push(h.title);
  });

  console.log(`Found ${affectedHymns.length} hymns with license agreement text`);
  console.log(`\nGrouped by publisher:`);
  Object.entries(byPublisher).forEach(([pub, hymnsList]) => {
    console.log(`\n${pub}: ${hymnsList.length} hymns`);
    console.log(`  Examples: ${hymnsList.slice(0, 3).join(', ')}`);
  });

  // Check raw text patterns
  console.log(`\nRaw text patterns:`);
  const patterns = new Set<string>();
  affectedHymns.slice(0, 20).forEach((h) => {
    patterns.add(h.firstRawTextLine.substring(0, 60));
  });
  patterns.forEach((p) => console.log(`  - ${p}...`));

  // Return the affected hymn IDs for further processing
  console.log(`\n\nAffected hymn IDs (${affectedHymns.length} total):`);
  console.log(affectedHymns.map(h => h.id).join('\n'));

  await prisma.$disconnect();
}

main();
