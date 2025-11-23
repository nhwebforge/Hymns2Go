/**
 * Import hymns from Ancient & Modern 2013 hymnal on Hymnary.org
 *
 * Usage: npx tsx scripts/import-am2013.ts
 */

import { prisma } from '../lib/db/prisma';
import { parseHymnText } from '../lib/hymn-processor/parser';

const HYMNAL_CODE = 'AM2013';
const BASE_URL = 'https://hymnary.org';
const DELAY_MS = 1000; // 1 second delay between requests to be respectful

interface HymnMetadata {
  hymnNumber: string;
  title: string;
  author: string | null;
  translator: string | null;
  firstLine: string | null;
  meter: string | null;
  language: string | null;
  year: number | null;
  publisher: string | null;
  ccliNumber: string | null;
  rawText: string;
  topics: string[];
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch and parse HTML from a URL
 */
async function fetchHTML(url: string): Promise<string> {
  console.log(`Fetching: ${url}`);
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.text();
}

/**
 * Extract hymn numbers that have text available from a hymnal index page
 */
async function getHymnsWithText(pageUrl: string): Promise<string[]> {
  const html = await fetchHTML(pageUrl);
  const hymnNumbers: string[] = [];

  // Debug: Check if we're getting any hymn links at all
  const allHymnLinks = html.match(new RegExp(`/hymn/${HYMNAL_CODE}/\\d+`, 'g'));
  if (allHymnLinks) {
    console.log(`  Found ${allHymnLinks.length} total hymn references`);
  }

  // Look for links with #text anchor - these indicate text is available
  const textLinkPattern = new RegExp(`/hymn/${HYMNAL_CODE}/(\\d+[a-z]?)#text`, 'g');
  const matches = [...html.matchAll(textLinkPattern)];

  for (const match of matches) {
    const hymnNumber = match[1];
    if (!hymnNumbers.includes(hymnNumber)) {
      hymnNumbers.push(hymnNumber);
    }
  }

  return hymnNumbers;
}

/**
 * Get all pagination page URLs from the hymnal index
 */
async function getAllPaginationUrls(): Promise<string[]> {
  const indexUrl = `${BASE_URL}/hymnal/${HYMNAL_CODE}`;
  const html = await fetchHTML(indexUrl);

  const urls: string[] = [indexUrl];

  // Extract pagination links
  const paginationPattern = new RegExp(`href="\\/hymnal\\/${HYMNAL_CODE}\\?page=(\\d+)"`, 'g');
  const matches = [...html.matchAll(paginationPattern)];

  for (const match of matches) {
    const pageNum = match[1];
    urls.push(`${BASE_URL}/hymnal/${HYMNAL_CODE}?page=${pageNum}`);
  }

  return [...new Set(urls)]; // Remove duplicates
}

/**
 * Extract metadata from hymn page HTML
 */
function extractMetadata(html: string, hymnNumber: string): Omit<HymnMetadata, 'rawText' | 'topics'> {
  // Extract title from h2 tag with hymn number prefix
  let title = '';

  // Try h2 with hymn number prefix: "811. Thou didst leave thy throne..."
  const h2Pattern = new RegExp(`<h2[^>]*>\\s*${hymnNumber}\\.\\s*([^<]+)</h2>`);
  const h2Match = html.match(h2Pattern);
  if (h2Match) {
    title = h2Match[1].trim();
  }

  // If no h2 match, try hy_infoLabel Title field
  if (!title) {
    const titlePattern = /<span class="hy_infoLabel">Title:?<\/span><\/td>\s*<td><span class="hy_infoItem">([^<]+)<\/span>/i;
    const titleMatch = html.match(titlePattern);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
  }

  // Helper function to extract fields from BOTH the hy_infoLabel AND <strong> sections
  const extractField = (label: string): string | null => {
    // Pattern 1: hy_infoLabel (detailed section)
    const pattern1 = new RegExp(
      `<span class="hy_infoLabel">${label}:?</span></td>\\s*<td><span class="hy_infoItem">(.*?)</span>`,
      'is'
    );
    const match1 = html.match(pattern1);
    if (match1) {
      let value = match1[1]
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .trim();
      value = value.replace(/\s*\([^)]*alt\.\)\s*$/i, ''); // Remove (alt.) suffix
      return value || null;
    }

    // Pattern 2: <strong> tags (infoBubble section)
    const pattern2 = new RegExp(
      `<strong>${label}:?</strong>\\s*(?:</td>\\s*<td>)?\\s*(?:<a[^>]*>)?([^<]+)`,
      'i'
    );
    const match2 = html.match(pattern2);
    if (match2) {
      return match2[1].trim() || null;
    }

    return null;
  };

  const author = extractField('Author');
  const translator = extractField('Translator');
  const firstLine = extractField('First Line');
  const meter = extractField('Meter');
  const language = extractField('Language') || 'English';
  const publisherText = extractField('Copyright');

  // Note: We don't extract year from Publication Date as that's the hymnal's publication date, not the hymn's
  const year = null;

  return {
    hymnNumber,
    title: title || `Hymn ${hymnNumber}`,
    author,
    translator,
    firstLine,
    meter,
    language,
    year,
    publisher: publisherText,
    ccliNumber: null, // Extract from copyright if available
  };
}

/**
 * Extract hymn text from HTML
 */
function extractHymnText(html: string): string | null {
  // Look for the hymn text container - AM2013 uses div with id "text"
  const textMatch = html.match(/<div id="text"[^>]*>([\s\S]*?)<\/div>/);
  if (!textMatch) {
    return null;
  }

  let text = textMatch[1];

  // Remove HTML tags but preserve line breaks
  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Clean up whitespace
  text = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');

  return text || null;
}

/**
 * Check if a hymn with the same title and first line already exists
 */
async function isDuplicate(title: string, firstLine: string | null): Promise<boolean> {
  if (!firstLine) {
    // If no first line, just check title (less reliable)
    const existing = await prisma.hymn.findFirst({
      where: {
        title: {
          equals: title,
          mode: 'insensitive',
        },
      },
    });
    return !!existing;
  }

  // Check for exact match on both title and first line
  const existing = await prisma.hymn.findFirst({
    where: {
      AND: [
        {
          title: {
            equals: title,
            mode: 'insensitive',
          },
        },
        {
          firstLine: {
            equals: firstLine,
            mode: 'insensitive',
          },
        },
      ],
    },
  });

  return !!existing;
}

/**
 * Import a single hymn
 */
async function importHymn(hymnNumber: string): Promise<boolean> {
  const url = `${BASE_URL}/hymn/${HYMNAL_CODE}/${hymnNumber}`;

  try {
    const html = await fetchHTML(url);

    // Extract metadata
    const metadata = extractMetadata(html, hymnNumber);

    // Extract hymn text
    const rawText = extractHymnText(html);
    if (!rawText) {
      console.log(`  ⚠️  No text found for hymn ${hymnNumber}`);
      return false;
    }

    // Check for duplicates
    const duplicate = await isDuplicate(metadata.title, metadata.firstLine);
    if (duplicate) {
      console.log(`  ⊘ Skipped (duplicate): ${metadata.title}`);
      return false;
    }

    console.log(`Importing: ${metadata.title}`);

    // Parse the hymn structure
    const structure = parseHymnText(rawText);

    // Create hymn in database
    await prisma.hymn.create({
      data: {
        title: metadata.title,
        author: metadata.author,
        translator: metadata.translator,
        year: metadata.year,
        rawText,
        structure: structure as any,
        isPublicDomain: true, // Most hymnal content is public domain
        publisher: metadata.publisher,
        ccliNumber: metadata.ccliNumber,
        firstLine: metadata.firstLine,
        meter: metadata.meter,
        language: metadata.language,
      },
    });

    console.log(`✓ Imported: ${metadata.title}`);
    return true;
  } catch (error) {
    console.error(`Error importing hymn ${hymnNumber}:`, error);
    return false;
  }
}

/**
 * Main import function
 */
async function main() {
  console.log(`Starting import from Ancient & Modern (${HYMNAL_CODE})...`);

  // Get all pagination pages
  console.log('Finding all hymnal pages...');
  const pageUrls = await getAllPaginationUrls();
  console.log(`Found ${pageUrls.length} pages`);

  // Get all hymns with text from all pages
  const allHymnNumbers: string[] = [];
  for (const pageUrl of pageUrls) {
    await delay(DELAY_MS);
    const hymnNumbers = await getHymnsWithText(pageUrl);
    console.log(`Found ${hymnNumbers.length} hymns with text on this page`);
    allHymnNumbers.push(...hymnNumbers);
  }

  // Remove duplicates
  const uniqueHymnNumbers = [...new Set(allHymnNumbers)];
  console.log(`\nTotal hymns with text available: ${uniqueHymnNumbers.length}`);

  // Import each hymn
  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (const hymnNumber of uniqueHymnNumbers) {
    await delay(DELAY_MS);
    const success = await importHymn(hymnNumber);
    if (success === true) {
      imported++;
    } else if (success === false) {
      skipped++;
    } else {
      failed++;
    }
  }

  console.log('\n=== Import Complete ===');
  console.log(`Imported: ${imported}`);
  console.log(`Skipped (duplicates): ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total processed: ${uniqueHymnNumbers.length}`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
