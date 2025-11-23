/**
 * Import hymns from Hymnary.org
 *
 * Usage: npx tsx scripts/import-hymnary.ts
 */

import { prisma } from '../lib/db/prisma';
import { parseHymnText } from '../lib/hymn-processor/parser';

const HYMNAL_CODE = 'CAH2000';
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
  // More flexible pattern that just looks for the #text link pattern
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

  // Extract pagination links: "1-94 | 95-183 | ..." format
  const paginationPattern = /href="\/hymnal\/CAH2000\?page=(\d+)"/g;
  const matches = [...html.matchAll(paginationPattern)];

  for (const match of matches) {
    const pageNum = match[1];
    urls.push(`${BASE_URL}/hymnal/${HYMNAL_CODE}?page=${pageNum}`);
  }

  return [...new Set(urls)]; // Remove duplicates
}

/**
 * Extract hymn metadata and text from a hymn page
 */
async function getHymnData(hymnNumber: string): Promise<HymnMetadata | null> {
  const url = `${BASE_URL}/hymn/${HYMNAL_CODE}/${hymnNumber}`;
  const html = await fetchHTML(url);

  try {
    // Extract title from h2 tag (format: "2. Abide with me")
    // Find the h2 that starts with a number - that's the hymn title
    const h2Matches = [...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)];
    let title = `Hymn ${hymnNumber}`;
    for (const match of h2Matches) {
      const text = match[1].trim();
      // Look for h2 that starts with a number (hymn number)
      if (text.match(/^[\d]+[a-z]?\./)) {
        title = text.replace(/^[\d]+[a-z]?\.\s*/, '');
        break;
      }
    }

    // Extract text information from BOTH the hy_infoLabel AND <strong> sections
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

    // Extract topics/tags
    const topics: string[] = [];
    const topicsMatch = html.match(/<dt[^>]*>Topics[^<]*<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/i);
    if (topicsMatch) {
      topics.push(...topicsMatch[1].split(/[;,]/).map(t => t.trim()));
    }

    // Extract hymn text
    const textSectionMatch = html.match(/<div[^>]*id="text"[^>]*>([\s\S]*?)<\/div>/);
    if (!textSectionMatch) {
      console.log(`No text found for hymn ${hymnNumber}`);
      return null;
    }

    let rawText = textSectionMatch[1];

    // Clean up HTML tags and entities
    rawText = rawText
      .replace(/<br\s*\/?>\s*/gi, '\n')  // Replace br tags and trailing whitespace with single newline
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\[Refrain\]/gi, '')  // Remove [Refrain] markers
      .replace(/\n\n+/g, '\n\n')  // Collapse 3+ newlines to just 2
      .trim();

    // Hymnary text comes pre-formatted with verse numbers like:
    // "1 Abide with me; fast falls the eventide;\nthe darkness deepens..."
    // We need to format it for our parser: put verse number on its own line
    const formattedText = rawText
      .split(/\n\n+/)  // Split by paragraph breaks
      .map(paragraph => {
        const trimmed = paragraph.trim();
        if (!trimmed) return '';

        // Check if paragraph starts with a verse number (e.g., "1 ", "2 ", "3a ")
        const verseMatch = trimmed.match(/^(\d+[a-z]?)\s+(.+)$/s);
        if (verseMatch) {
          // Put verse number on its own line
          return `${verseMatch[1]}\n${verseMatch[2]}`;
        }

        // Check if it's a chorus/refrain marker
        if (trimmed.toLowerCase().startsWith('chorus') ||
            trimmed.toLowerCase().startsWith('refrain')) {
          const content = trimmed.replace(/^(chorus|refrain)[:\s]*/i, '');
          // If there's no content after the marker, just return "Chorus" (no extra newline)
          // The actual chorus content will be in the next paragraph
          if (!content) {
            return 'Chorus';
          }
          return `Chorus\n${content}`;
        }

        return trimmed;
      })
      .filter(Boolean)
      .join('\n\n');

    return {
      hymnNumber,
      title,
      author,
      translator,
      firstLine,
      meter,
      language,
      year,
      publisher: publisherText,
      ccliNumber: null, // Hymnary doesn't typically include CCLI numbers
      rawText: formattedText,
      topics,
    };
  } catch (error) {
    console.error(`Error parsing hymn ${hymnNumber}:`, error);
    return null;
  }
}

/**
 * Import a single hymn into the database
 */
async function importHymn(hymnData: HymnMetadata): Promise<void> {
  console.log(`Importing: ${hymnData.title}`);

  // Parse the text structure
  const structure = parseHymnText(hymnData.rawText);

  // Check if hymn exists with same title and first line
  const existing = await prisma.hymn.findFirst({
    where: {
      title: hymnData.title,
      firstLine: hymnData.firstLine,
    },
  });

  let hymn;
  if (existing) {
    // Update existing hymn
    hymn = await prisma.hymn.update({
      where: { id: existing.id },
      data: {
        author: hymnData.author,
        translator: hymnData.translator,
        year: hymnData.year,
        rawText: hymnData.rawText,
        structure: structure as any,
        isPublicDomain: hymnData.year ? hymnData.year < 1928 : false,
        publisher: hymnData.publisher,
        ccliNumber: hymnData.ccliNumber,
        firstLine: hymnData.firstLine,
        meter: hymnData.meter,
        language: hymnData.language,
      },
    });
  } else {
    // Create new hymn
    hymn = await prisma.hymn.create({
      data: {
        title: hymnData.title,
        author: hymnData.author,
        translator: hymnData.translator,
        year: hymnData.year,
        rawText: hymnData.rawText,
        structure: structure as any,
        isPublicDomain: hymnData.year ? hymnData.year < 1928 : false,
        publisher: hymnData.publisher,
        ccliNumber: hymnData.ccliNumber,
        firstLine: hymnData.firstLine,
        meter: hymnData.meter,
        language: hymnData.language,
      },
    });
  }

  // Add tags for topics
  for (const topic of hymnData.topics) {
    if (!topic) continue;

    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const tag = await prisma.tag.upsert({
      where: { slug },
      create: {
        name: topic,
        slug,
        category: 'topic',
      },
      update: {},
    });

    // Link hymn to tag (skip if already linked)
    await prisma.hymnTag.upsert({
      where: {
        hymnId_tagId: {
          hymnId: hymn.id,
          tagId: tag.id,
        },
      },
      create: {
        hymnId: hymn.id,
        tagId: tag.id,
      },
      update: {},
    });
  }

  console.log(`✓ Imported: ${hymnData.title}`);
}

/**
 * Main import function
 */
async function main() {
  console.log(`Starting import from Complete Anglican Hymns Old and New (${HYMNAL_CODE})...`);

  try {
    // Get all pagination URLs
    console.log('Finding all hymnal pages...');
    const paginationUrls = await getAllPaginationUrls();
    console.log(`Found ${paginationUrls.length} pages`);

    // Get all hymn numbers with text available
    const allHymnNumbers: string[] = [];
    for (const url of paginationUrls) {
      await delay(DELAY_MS);
      const hymnNumbers = await getHymnsWithText(url);
      allHymnNumbers.push(...hymnNumbers);
      console.log(`Found ${hymnNumbers.length} hymns with text on this page`);
    }

    console.log(`\nTotal hymns with text available: ${allHymnNumbers.length}`);

    // Import each hymn
    let imported = 0;
    let failed = 0;

    for (const hymnNumber of allHymnNumbers) {
      try {
        await delay(DELAY_MS);
        const hymnData = await getHymnData(hymnNumber);

        if (hymnData) {
          await importHymn(hymnData);
          imported++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Failed to import hymn ${hymnNumber}:`, error);
        failed++;
      }
    }

    console.log(`\n=== Import Complete ===`);
    console.log(`Successfully imported: ${imported}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total processed: ${imported + failed}`);
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
main().catch(console.error);
