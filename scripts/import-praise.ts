/**
 * Import hymns from praise.org.uk
 *
 * Usage: npx tsx scripts/import-praise.ts
 */

import { prisma } from '../lib/db/prisma';
import { parseHymnText } from '../lib/hymn-processor/parser';
import { findDuplicate, type HymnForComparison } from '../lib/import-utils/duplicate-detector';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://www.praise.org.uk';
const DELAY_MS = 1500; // 1.5 second delay to be respectful
const HYMNAL_CODE = 'PRAISE';

interface HymnMetadata {
  url: string;
  title: string;
  author: string | null;
  firstLine: string | null;
  rawText: string;
  themes: string[];
  tuneName: string | null;
  tuneComposer: string | null;
  copyright: string | null;
  ccliNumber: string | null;
  bookNumber: string | null;
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch HTML from a URL
 */
async function fetchHTML(url: string): Promise<string> {
  console.log(`Fetching: ${url}`);
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  return response.text();
}

/**
 * Get all hymn URLs from the listing pages
 */
async function getAllHymnUrls(): Promise<string[]> {
  const hymnUrls: string[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = page === 1
      ? `${BASE_URL}/hymns`
      : `${BASE_URL}/hymns?page=${page}`;

    try {
      const html = await fetchHTML(url);
      const $ = cheerio.load(html);

      // Find all hymn links
      // Looking for links that go to /hymns/[slug]
      const pageHymnLinks: string[] = [];
      $('a[href^="/hymns/"]').each((_, element) => {
        const href = $(element).attr('href');
        if (href && href !== '/hymns' && href !== '/hymns/' && !href.includes('?')) {
          const fullUrl = `${BASE_URL}${href}`;
          if (!hymnUrls.includes(fullUrl) && !pageHymnLinks.includes(fullUrl)) {
            pageHymnLinks.push(fullUrl);
          }
        }
      });

      console.log(`  Page ${page}: Found ${pageHymnLinks.length} hymns`);

      if (pageHymnLinks.length === 0) {
        hasMore = false;
      } else {
        hymnUrls.push(...pageHymnLinks);
        page++;
        await delay(DELAY_MS);
      }

      // Safety limit
      if (page > 100) {
        console.log('  Reached page limit, stopping');
        hasMore = false;
      }
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      hasMore = false;
    }
  }

  return hymnUrls;
}

/**
 * Parse a hymn page and extract metadata
 */
async function parseHymnPage(url: string): Promise<HymnMetadata | null> {
  try {
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    // Extract title from h1
    const title = $('h1').first().text().trim();
    if (!title) {
      console.log(`  ⚠️  No title found, skipping`);
      return null;
    }

    // Try to find JSON-LD structured data first
    let jsonLdData: any = null;
    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        const json = JSON.parse($(element).html() || '{}');
        if (json['@type'] === 'MusicComposition' || json['hymn:authors']) {
          jsonLdData = json;
        }
      } catch (e) {
        // Ignore parse errors
      }
    });

    // Extract author from JSON-LD or page
    let author: string | null = null;
    if (jsonLdData && jsonLdData['hymn:authors'] && jsonLdData['hymn:authors'].length > 0) {
      author = jsonLdData['hymn:authors'][0].name;
    } else {
      // Look for "Authors:" label
      const authorsLabel = $('strong:contains("Authors:"), label:contains("Authors:")');
      if (authorsLabel.length > 0) {
        const authorsList = authorsLabel.parent().find('a');
        if (authorsList.length > 0) {
          author = $(authorsList[0]).text().trim();
        }
      }
    }

    // Extract themes
    const themes: string[] = [];
    if (jsonLdData && jsonLdData['hymn:themes']) {
      jsonLdData['hymn:themes'].forEach((theme: any) => {
        if (theme.name) themes.push(theme.name);
      });
    }

    // Extract tune information
    let tuneName: string | null = null;
    let tuneComposer: string | null = null;
    if (jsonLdData && jsonLdData['hymn:tunes'] && jsonLdData['hymn:tunes'].length > 0) {
      const tune = jsonLdData['hymn:tunes'][0];
      tuneName = tune.name || null;
      tuneComposer = tune.composer?.name || null;
    }

    // Extract copyright
    let copyright: string | null = null;
    const copyrightLabel = $('strong:contains("Copyright:"), label:contains("Copyright:")');
    if (copyrightLabel.length > 0) {
      copyright = copyrightLabel.parent().text().replace(/Copyright:/i, '').trim();
    }

    // Extract CCLI number
    let ccliNumber: string | null = null;
    const ccliLabel = $('strong:contains("CCLI:"), label:contains("CCLI:")');
    if (ccliLabel.length > 0) {
      const ccliText = ccliLabel.parent().text().replace(/CCLI:/i, '').trim();
      ccliNumber = ccliText || null;
    }

    // Extract book number
    let bookNumber: string | null = null;
    const bookLabel = $('strong:contains("Book Number:"), label:contains("Book Number:")');
    if (bookLabel.length > 0) {
      bookNumber = bookLabel.parent().text().replace(/Book Number:/i, '').trim();
    }

    // Extract hymn text
    // The text is usually in a specific section - we need to find verse blocks
    // Verses are plain text with line breaks, italicized text is refrain
    let rawText = '';

    // Look for the main content area containing verses
    // This varies by page, so we'll try multiple strategies
    const textContainer = $('.hymn-text, .lyrics, .verses, article').first();
    if (textContainer.length > 0) {
      // Process each paragraph or verse section
      textContainer.find('p, .verse, .stanza').each((_, element) => {
        let verseText = '';
        $(element).contents().each((_, node) => {
          if (node.type === 'text') {
            verseText += $(node).text();
          } else if (node.type === 'tag') {
            const tagName = node.name.toLowerCase();
            if (tagName === 'br') {
              verseText += '\n';
            } else if (tagName === 'em' || tagName === 'i') {
              // Italicized text (refrain) - just add the text
              verseText += $(node).text();
            } else {
              verseText += $(node).text();
            }
          }
        });

        if (verseText.trim()) {
          rawText += verseText.trim() + '\n\n';
        }
      });
    }

    // If no structured content found, try to extract all text from the page
    if (!rawText.trim()) {
      console.log(`  ⚠️  Could not find hymn text in structured format`);
      return null;
    }

    rawText = rawText.trim();
    const firstLine = rawText.split('\n').filter(l => l.trim())[0] || null;

    return {
      url,
      title,
      author,
      firstLine,
      rawText,
      themes,
      tuneName,
      tuneComposer,
      copyright,
      ccliNumber,
      bookNumber,
    };
  } catch (error) {
    console.error(`Error parsing hymn page ${url}:`, error);
    return null;
  }
}

/**
 * Main import function
 */
async function main() {
  console.log('Starting praise.org.uk import...\n');

  try {
    // Get all existing hymns for duplicate detection
    const existingHymns = await prisma.hymn.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        firstLine: true,
        rawText: true,
        sourceUrl: true,
      },
    });

    console.log(`Loaded ${existingHymns.length} existing hymns for duplicate detection\n`);

    // Get all hymn URLs
    console.log('Fetching hymn URLs from praise.org.uk...');
    const hymnUrls = await getAllHymnUrls();
    console.log(`\nFound ${hymnUrls.length} hymns to process\n`);

    let imported = 0;
    let skipped = 0;
    let duplicates = 0;
    let errors = 0;

    for (let i = 0; i < hymnUrls.length; i++) {
      const url = hymnUrls[i];
      console.log(`\n[${i + 1}/${hymnUrls.length}] Processing: ${url}`);

      try {
        const metadata = await parseHymnPage(url);
        if (!metadata) {
          console.log(`  ⚠️  Skipped (could not parse)`);
          skipped++;
          await delay(DELAY_MS);
          continue;
        }

        // Check for duplicates
        const duplicateMatch = findDuplicate(metadata, existingHymns);
        if (duplicateMatch) {
          console.log(`  ⏭️  DUPLICATE: ${duplicateMatch.reason} (confidence: ${(duplicateMatch.confidence * 100).toFixed(0)}%)`);
          console.log(`     Existing: "${duplicateMatch.existingHymn.title}" by ${duplicateMatch.existingHymn.author || 'Unknown'}`);
          duplicates++;
          await delay(DELAY_MS);
          continue;
        }

        // Parse the hymn structure
        const structure = parseHymnText(metadata.rawText);

        // Create the hymn
        const hymn = await prisma.hymn.create({
          data: {
            title: metadata.title,
            author: metadata.author,
            firstLine: metadata.firstLine,
            rawText: metadata.rawText,
            structure: structure as any,
            tuneName: metadata.tuneName,
            composer: metadata.tuneComposer,
            copyright: metadata.copyright,
            ccliNumber: metadata.ccliNumber,
            hymnalCode: HYMNAL_CODE,
            hymnalNumber: metadata.bookNumber,
            sourceUrl: url,
          },
        });

        // Add theme tags
        if (metadata.themes.length > 0) {
          for (const themeName of metadata.themes) {
            const slug = themeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            // Find or create tag
            let tag = await prisma.tag.findUnique({ where: { slug } });
            if (!tag) {
              tag = await prisma.tag.create({
                data: {
                  name: themeName,
                  slug,
                  category: 'theme',
                },
              });
            }

            // Link hymn to tag
            await prisma.hymnTag.create({
              data: {
                hymnId: hymn.id,
                tagId: tag.id,
              },
            }).catch(() => {
              // Ignore duplicate tag assignments
            });
          }
        }

        // Add to existing hymns list for future duplicate checks
        existingHymns.push({
          id: hymn.id,
          title: hymn.title,
          author: hymn.author,
          firstLine: hymn.firstLine,
          rawText: hymn.rawText,
          sourceUrl: hymn.sourceUrl,
        });

        console.log(`  ✓ Imported: "${metadata.title}" by ${metadata.author || 'Unknown'}`);
        imported++;

        await delay(DELAY_MS);
      } catch (error) {
        console.error(`  ✗ Error:`, error);
        errors++;
        await delay(DELAY_MS);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('Import complete!');
    console.log(`  Imported: ${imported}`);
    console.log(`  Duplicates: ${duplicates}`);
    console.log(`  Skipped: ${skipped}`);
    console.log(`  Errors: ${errors}`);
    console.log(`${'='.repeat(60)}\n`);
  } catch (error) {
    console.error('Fatal error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
