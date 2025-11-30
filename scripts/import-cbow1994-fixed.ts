/**
 * Import hymns from Catholic Book of Worship III (CBoW1994) on Hymnary.org
 * This version properly filters liturgical chants and handles license acceptance
 *
 * Usage: npx tsx scripts/import-cbow1994-fixed.ts
 */

import { prisma } from '../lib/db/prisma';
import { parseHymnText } from '../lib/hymn-processor/parser';

const HYMNAL_CODE = 'CBoW1994';
const BASE_URL = 'https://hymnary.org';
const DELAY_MS = 1000;

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

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchHTML(url: string, method: 'GET' | 'POST' = 'GET', body?: string): Promise<string> {
  console.log(`Fetching: ${url} (${method})`);

  const options: RequestInit = {
    method,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  };

  if (method === 'POST' && body) {
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    options.body = body;
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.text();
}

async function getHymnsWithText(pageUrl: string): Promise<string[]> {
  const html = await fetchHTML(pageUrl);
  const hymnNumbers: string[] = [];

  // Look for rows with text icons that are NOT liturgical chants
  // Liturgical chants have tunes in square brackets like [Lord, open our lips]
  const lines = html.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this line has a #text link
    const textLinkMatch = line.match(new RegExp(`/hymn/${HYMNAL_CODE}/([^"]+)#text`));
    if (!textLinkMatch) continue;

    const hymnNumber = textLinkMatch[1];

    // Look ahead in the next few lines for the tune column
    // If we find square brackets, skip this hymn (it's liturgical)
    let isLiturgical = false;
    for (let j = i; j < Math.min(i + 10, lines.length); j++) {
      // Check if there's a tune column with square brackets
      if (lines[j].includes('[') && lines[j].includes(']') &&
          lines[j].match(/<td[^>]*>.*\[[^\]]+\].*<\/td>/)) {
        isLiturgical = true;
        break;
      }
      // If we hit the next row, stop looking
      if (j > i && lines[j].includes('<tr')) break;
    }

    if (!isLiturgical && !hymnNumbers.includes(hymnNumber)) {
      hymnNumbers.push(hymnNumber);
    }
  }

  console.log(`  Found ${hymnNumbers.length} hymns with text (excluding liturgical chants)`);
  return hymnNumbers;
}

async function getAllPaginationUrls(): Promise<string[]> {
  const indexUrl = `${BASE_URL}/hymnal/${HYMNAL_CODE}`;
  const html = await fetchHTML(indexUrl);

  const urls: string[] = [indexUrl];

  const paginationPattern = new RegExp(`href="/hymnal/${HYMNAL_CODE}\\?page=(\\d+)"`, 'g');
  const matches = [...html.matchAll(paginationPattern)];

  for (const match of matches) {
    const pageNum = match[1];
    urls.push(`${BASE_URL}/hymnal/${HYMNAL_CODE}?page=${pageNum}`);
  }

  return [...new Set(urls)];
}

async function getHymnData(hymnNumber: string): Promise<HymnMetadata | null> {
  const url = `${BASE_URL}/hymn/${HYMNAL_CODE}/${hymnNumber}`;

  // First, fetch the page to see if it requires license acceptance
  let html = await fetchHTML(url);

  // Check if there's a license form
  const licenseMatch = html.match(/name="(license_[^"]+)"/);
  if (licenseMatch) {
    console.log(`  License required for hymn ${hymnNumber}, accepting...`);
    const licenseName = licenseMatch[1];
    const formData = `${licenseName}=yes`;

    // Submit the license acceptance
    html = await fetchHTML(url, 'POST', formData);
  }

  try {
    const h2Matches = [...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)];
    let title = `Hymn ${hymnNumber}`;
    for (const match of h2Matches) {
      const text = match[1].trim();
      if (text.match(/^[\d]+[A-Za-z]?\./)) {
        title = text.replace(/^[\d]+[A-Za-z]?\.\s*/, '');
        break;
      }
    }

    const extractField = (label: string): string | null => {
      const pattern1 = new RegExp(
        `<span class="hy_infoLabel">${label}:?</span></td>\\s*<td><span class="hy_infoItem">(.*?)</span>`,
        'is'
      );
      const match1 = html.match(pattern1);
      if (match1) {
        let value = match1[1].replace(/<[^>]+>/g, '').trim();
        value = value.replace(/\s*\([^)]*alt\.\)\s*$/i, '');
        return value || null;
      }

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

    const year = null;

    const topics: string[] = [];
    const topicsMatch = html.match(/<dt[^>]*>Topics[^<]*<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/i);
    if (topicsMatch) {
      topics.push(...topicsMatch[1].split(/[;,]/).map(t => t.trim()));
    }

    const textSectionMatch = html.match(/<div[^>]*id="text"[^>]*>([\s\S]*?)<\/div>/);
    if (!textSectionMatch) {
      console.log(`No text found for hymn ${hymnNumber}`);
      return null;
    }

    let rawText = textSectionMatch[1];

    // Check if it still shows license box (means license acceptance didn't work)
    if (rawText.includes('accept_license_box') || rawText.includes('I agree')) {
      console.log(`License acceptance failed for hymn ${hymnNumber}`);
      return null;
    }

    rawText = rawText
      .replace(/<br\s*\/?>\s*/gi, '\n')
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
      .replace(/\[Refrain\]/gi, '')
      .replace(/\n\n+/g, '\n\n')
      .trim();

    const formattedText = rawText
      .split(/\n\n+/)
      .map(paragraph => {
        const trimmed = paragraph.trim();
        if (!trimmed) return '';

        const verseMatch = trimmed.match(/^(\d+[a-z]?)\s+(.+)$/s);
        if (verseMatch) {
          return `${verseMatch[1]}\n${verseMatch[2]}`;
        }

        if (trimmed.toLowerCase().startsWith('chorus') ||
            trimmed.toLowerCase().startsWith('refrain')) {
          const content = trimmed.replace(/^(chorus|refrain)[:\s]*/i, '');
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
      ccliNumber: null,
      rawText: formattedText,
      topics,
    };
  } catch (error) {
    console.error(`Error parsing hymn ${hymnNumber}:`, error);
    return null;
  }
}

async function hymnExists(hymnData: HymnMetadata): Promise<boolean> {
  const existing = await prisma.hymn.findFirst({
    where: {
      title: hymnData.title,
      firstLine: hymnData.firstLine,
    },
  });

  if (existing) {
    console.log(`  ⊘ Skipping duplicate: ${hymnData.title}`);
    return true;
  }

  return false;
}

async function importHymn(hymnData: HymnMetadata): Promise<void> {
  console.log(`Importing: ${hymnData.title}`);

  if (await hymnExists(hymnData)) {
    return;
  }

  const structure = parseHymnText(hymnData.rawText);

  const hymn = await prisma.hymn.create({
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

async function main() {
  console.log(`Starting import from Catholic Book of Worship III (${HYMNAL_CODE})...`);
  console.log('NOTE: Filtering out liturgical chants (tunes in square brackets)');
  console.log('NOTE: Handling license acceptance for copyrighted hymns');

  try {
    console.log('Finding all hymnal pages...');
    const paginationUrls = await getAllPaginationUrls();
    console.log(`Found ${paginationUrls.length} pages`);

    const allHymnNumbers: string[] = [];
    for (const url of paginationUrls) {
      await delay(DELAY_MS);
      const hymnNumbers = await getHymnsWithText(url);
      allHymnNumbers.push(...hymnNumbers);
    }

    console.log(`\nTotal hymns to import (excluding liturgical chants): ${allHymnNumbers.length}`);

    let imported = 0;
    let skipped = 0;
    let failed = 0;

    for (const hymnNumber of allHymnNumbers) {
      try {
        await delay(DELAY_MS);
        const hymnData = await getHymnData(hymnNumber);

        if (hymnData) {
          if (await hymnExists(hymnData)) {
            skipped++;
          } else {
            await importHymn(hymnData);
            imported++;
          }
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
    console.log(`Skipped (duplicates): ${skipped}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total processed: ${imported + skipped + failed}`);
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
