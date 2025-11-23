/**
 * Comprehensive metadata discovery script
 * Scans ALL hymns in both CAH2000 and AM2013 hymnals to find all possible metadata fields
 */

const HYMNALS = [
  { code: 'CAH2000', name: 'Complete Anglican Hymns Old and New' },
  { code: 'AM2013', name: 'Ancient & Modern 2013' },
];

const DELAY_MS = 500; // Be respectful to the server

interface FieldDiscovery {
  fieldName: string;
  exampleValue: string;
  count: number;
  hymnalCode: string;
  hymnNumber: string;
}

const discoveredFields = new Map<string, FieldDiscovery>();

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchHTML(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });
    if (!response.ok) return null;
    return response.text();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

async function getAllPaginationUrls(hymnalCode: string): Promise<string[]> {
  const baseUrl = `https://hymnary.org/hymnal/${hymnalCode}`;
  const html = await fetchHTML(baseUrl);
  if (!html) return [baseUrl];

  const urls: string[] = [baseUrl];
  const paginationPattern = new RegExp(`href="\\/hymnal\\/${hymnalCode}\\?page=(\\d+)"`, 'g');
  const matches = [...html.matchAll(paginationPattern)];

  for (const match of matches) {
    urls.push(`https://hymnary.org/hymnal/${hymnalCode}?page=${match[1]}`);
  }

  return [...new Set(urls)];
}

async function getHymnsWithText(pageUrl: string, hymnalCode: string): Promise<string[]> {
  const html = await fetchHTML(pageUrl);
  if (!html) return [];

  const textLinkPattern = new RegExp(`/hymn/${hymnalCode}/(\\d+[a-z]?)#text`, 'g');
  const matches = [...html.matchAll(textLinkPattern)];
  const hymnNumbers: string[] = [];

  for (const match of matches) {
    if (!hymnNumbers.includes(match[1])) {
      hymnNumbers.push(match[1]);
    }
  }

  return hymnNumbers;
}

function extractAllFields(html: string, hymnNumber: string, hymnalCode: string): void {
  // Extract all hy_infoLabel fields
  const labelPattern = /<span class="hy_infoLabel">([^<]+)<\/span><\/td>\s*<td><span class="hy_infoItem">(.*?)<\/span>/gs;
  const matches = [...html.matchAll(labelPattern)];

  for (const match of matches) {
    const fieldName = match[1].replace(':', '').trim();
    let fieldValue = match[2]
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .trim()
      .substring(0, 100); // Limit length for display

    if (fieldValue) {
      const key = `${hymnalCode}:${fieldName}`;
      if (!discoveredFields.has(key)) {
        discoveredFields.set(key, {
          fieldName,
          exampleValue: fieldValue,
          count: 1,
          hymnalCode,
          hymnNumber,
        });
      } else {
        const existing = discoveredFields.get(key)!;
        existing.count++;
      }
    }
  }

  // Also check for fields in <b> tags (infoBubble section)
  const boldLabelPattern = /<b>([^<]+)<\/b><\/td>\s*<td>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>)?[^<]*)/gs;
  const boldMatches = [...html.matchAll(boldLabelPattern)];

  for (const match of boldMatches) {
    const fieldName = match[1].replace(':', '').trim();
    let fieldValue = match[2]
      .replace(/<[^>]+>/g, '') //Remove HTML tags
      .trim()
      .substring(0, 100);

    if (fieldValue && fieldName !== 'Hymnal') {
      const key = `${hymnalCode}:${fieldName}:bold`;
      if (!discoveredFields.has(key)) {
        discoveredFields.set(key, {
          fieldName: `${fieldName} (infoBubble)`,
          exampleValue: fieldValue,
          count: 1,
          hymnalCode,
          hymnNumber,
        });
      } else {
        const existing = discoveredFields.get(key)!;
        existing.count++;
      }
    }
  }
}

async function scanHymnal(hymnalCode: string, hymnalName: string): Promise<void> {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Scanning: ${hymnalName} (${hymnalCode})`);
  console.log('='.repeat(70));

  // Get all pagination pages
  console.log('Finding all hymnal pages...');
  const pageUrls = await getAllPaginationUrls(hymnalCode);
  console.log(`Found ${pageUrls.length} pages`);

  // Get all hymn numbers with text
  const allHymnNumbers: string[] = [];
  for (const pageUrl of pageUrls) {
    await delay(DELAY_MS);
    const hymnNumbers = await getHymnsWithText(pageUrl, hymnalCode);
    allHymnNumbers.push(...hymnNumbers);
    console.log(`Page ${pageUrls.indexOf(pageUrl) + 1}/${pageUrls.length}: Found ${hymnNumbers.length} hymns with text`);
  }

  console.log(`\nTotal hymns with text: ${allHymnNumbers.length}`);
  console.log('Scanning all hymns for metadata fields...\n');

  // Scan each hymn
  let scanned = 0;
  for (const hymnNumber of allHymnNumbers) {
    await delay(DELAY_MS);
    const url = `https://hymnary.org/hymn/${hymnalCode}/${hymnNumber}`;
    const html = await fetchHTML(url);

    if (html) {
      extractAllFields(html, hymnNumber, hymnalCode);
      scanned++;

      if (scanned % 10 === 0) {
        process.stdout.write(`\rScanned: ${scanned}/${allHymnNumbers.length} hymns`);
      }
    }
  }

  console.log(`\n✓ Completed scanning ${scanned} hymns from ${hymnalCode}\n`);
}

async function main() {
  console.log('\n' + '═'.repeat(70));
  console.log('  COMPREHENSIVE METADATA DISCOVERY');
  console.log('  Scanning ALL hymns in CAH2000 and AM2013');
  console.log('═'.repeat(70));

  // Scan both hymnals
  for (const hymnal of HYMNALS) {
    await scanHymnal(hymnal.code, hymnal.name);
  }

  // Generate report
  console.log('\n' + '═'.repeat(70));
  console.log('  METADATA FIELDS DISCOVERED');
  console.log('═'.repeat(70));

  // Group by hymnal
  for (const hymnal of HYMNALS) {
    console.log(`\n\n${hymnal.name} (${hymnal.code}):`);
    console.log('-'.repeat(70));

    const hymnalFields = Array.from(discoveredFields.values())
      .filter(f => f.hymnalCode === hymnal.code)
      .sort((a, b) => b.count - a.count);

    for (const field of hymnalFields) {
      console.log(`\n  ${field.fieldName}`);
      console.log(`    Occurrences: ${field.count}`);
      console.log(`    Example: "${field.exampleValue}"`);
      console.log(`    First seen in: Hymn ${field.hymnNumber}`);
    }
  }

  // Save to file
  const fs = await import('fs/promises');
  const report = {
    scanDate: new Date().toISOString(),
    hymnals: HYMNALS,
    fields: Array.from(discoveredFields.values()),
  };

  await fs.writeFile('metadata-discovery-report.json', JSON.stringify(report, null, 2), 'utf-8');
  console.log('\n\n✓ Full report saved to: metadata-discovery-report.json');
  console.log('\n' + '═'.repeat(70) + '\n');
}

main().catch(console.error);
