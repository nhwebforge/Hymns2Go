/**
 * Shared utility for importing hymns from Hymnary.org
 * Handles license agreements, duplicate detection, and common parsing logic
 */

import { prisma } from '../db/prisma';
import { parseHymnText } from '../hymn-processor/parser';
import { findDuplicate, type HymnForComparison } from './duplicate-detector';

const BASE_URL = 'https://hymnary.org';
const DELAY_MS = 1000;

export interface HymnaryHymnMetadata {
  hymnNumber: string;
  url: string;
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

export class HymnaryImporter {
  constructor(
    private hymnalCode: string,
    private hymnalName: string,
    private existingHymns: HymnForComparison[] = []
  ) {}

  /**
   * Delay helper
   */
  protected delay(ms: number = DELAY_MS): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fetch HTML from a URL with proper headers
   */
  protected async fetchHTML(url: string): Promise<string> {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        // This cookie accepts all license agreements on hymnary.org
        'Cookie': 'license_agreement_accepted=1',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    return response.text();
  }

  /**
   * Extract field value from HTML using various patterns
   */
  protected extractField(html: string, label: string): string | null {
    // Pattern 1: hy_infoLabel (detailed section)
    const pattern1 = new RegExp(
      `<span class="hy_infoLabel">${label}:?</span></td>\\s*<td><span class="hy_infoItem">(.*?)</span>`,
      'is'
    );
    const match1 = html.match(pattern1);
    if (match1) {
      let value = match1[1]
        .replace(/<[^>]+>/g, '')
        .trim();
      value = value.replace(/\s*\([^)]*alt\.\)\s*$/i, '');
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
  }

  /**
   * Check if the hymn text contains license agreement text
   */
  protected hasLicenseText(text: string): boolean {
    const lowerText = text.toLowerCase();
    return lowerText.includes('license agreement') ||
           lowerText.includes('to view this media');
  }

  /**
   * Extract hymn text from HTML, handling license agreements
   */
  protected extractHymnText(html: string, hymnNumber: string): string | null {
    const textSectionMatch = html.match(/<div[^>]*id="text"[^>]*>([\s\S]*?)<\/div>/);
    if (!textSectionMatch) {
      console.log(`  No text section found for hymn ${hymnNumber}`);
      return null;
    }

    let rawText = textSectionMatch[1];

    // Clean up HTML
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

    // Check for license agreement text
    if (this.hasLicenseText(rawText)) {
      console.log(`  ⚠️  License agreement text detected - skipping`);
      return null;
    }

    // Format text for parser
    const formattedText = rawText
      .split(/\n\n+/)
      .map(paragraph => {
        const trimmed = paragraph.trim();
        if (!trimmed) return '';

        // Check if paragraph starts with a verse number
        const verseMatch = trimmed.match(/^(\d+[a-z]?)\s+(.+)$/s);
        if (verseMatch) {
          return `${verseMatch[1]}\n${verseMatch[2]}`;
        }

        // Check for chorus/refrain marker
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

    return formattedText;
  }

  /**
   * Get hymn data from a hymn page
   */
  async getHymnData(hymnNumber: string): Promise<HymnaryHymnMetadata | null> {
    const url = `${BASE_URL}/hymn/${this.hymnalCode}/${hymnNumber}`;

    try {
      const html = await this.fetchHTML(url);

      // Extract title
      const h2Matches = [...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)];
      let title = `Hymn ${hymnNumber}`;
      for (const match of h2Matches) {
        const text = match[1].trim();
        if (text.match(/^[\d]+[a-z]?\./)) {
          title = text.replace(/^[\d]+[a-z]?\.\s*/, '');
          break;
        }
      }

      const author = this.extractField(html, 'Author');
      const translator = this.extractField(html, 'Translator');
      const firstLine = this.extractField(html, 'First Line');
      const meter = this.extractField(html, 'Meter');
      const language = this.extractField(html, 'Language') || 'English';
      const publisherText = this.extractField(html, 'Copyright');

      // Extract topics
      const topics: string[] = [];
      const topicsMatch = html.match(/<dt[^>]*>Topics[^<]*<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/i);
      if (topicsMatch) {
        topics.push(...topicsMatch[1].split(/[;,]/).map(t => t.trim()));
      }

      // Extract text
      const rawText = this.extractHymnText(html, hymnNumber);
      if (!rawText) {
        return null;
      }

      return {
        hymnNumber,
        url,
        title,
        author,
        translator,
        firstLine,
        meter,
        language,
        year: null,
        publisher: publisherText,
        ccliNumber: null,
        rawText,
        topics,
      };
    } catch (error) {
      console.error(`  Error parsing hymn ${hymnNumber}:`, error);
      return null;
    }
  }

  /**
   * Get all hymn numbers with text from a hymnal page
   */
  async getHymnsWithText(pageUrl: string): Promise<string[]> {
    const html = await this.fetchHTML(pageUrl);
    const hymnNumbers: string[] = [];

    const textLinkPattern = new RegExp(`/hymn/${this.hymnalCode}/(\\d+[a-z]?)#text`, 'g');
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
   * Get all pagination URLs for the hymnal
   */
  async getAllPaginationUrls(): Promise<string[]> {
    const indexUrl = `${BASE_URL}/hymnal/${this.hymnalCode}`;
    const html = await this.fetchHTML(indexUrl);

    const urls: string[] = [indexUrl];

    const paginationPattern = new RegExp(`href="\\/hymnal\\/${this.hymnalCode}\\?page=(\\d+)"`, 'g');
    const matches = [...html.matchAll(paginationPattern)];

    for (const match of matches) {
      const pageNum = match[1];
      urls.push(`${BASE_URL}/hymnal/${this.hymnalCode}?page=${pageNum}`);
    }

    return [...new Set(urls)];
  }

  /**
   * Import a hymn into the database
   */
  async importHymn(hymnData: HymnaryHymnMetadata): Promise<boolean> {
    try {
      // Check for duplicates
      const duplicateMatch = findDuplicate(hymnData, this.existingHymns);
      if (duplicateMatch) {
        console.log(`  ⏭️  DUPLICATE: ${duplicateMatch.reason} (confidence: ${(duplicateMatch.confidence * 100).toFixed(0)}%)`);
        console.log(`     Existing: "${duplicateMatch.existingHymn.title}" by ${duplicateMatch.existingHymn.author || 'Unknown'}`);
        return false;
      }

      // Parse structure
      const structure = parseHymnText(hymnData.rawText);

      // Create hymn
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
          hymnalCode: this.hymnalCode,
          hymnalNumber: hymnData.hymnNumber,
          sourceUrl: hymnData.url,
        },
      });

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
        }).catch(() => {
          // Ignore duplicate errors
        });
      }

      // Add to existing hymns for future duplicate checks
      this.existingHymns.push({
        id: hymn.id,
        title: hymn.title,
        author: hymn.author,
        firstLine: hymn.firstLine,
        rawText: hymn.rawText,
        sourceUrl: hymn.sourceUrl,
      });

      console.log(`  ✓ Imported: "${hymnData.title}" by ${hymnData.author || 'Unknown'}`);
      return true;
    } catch (error) {
      console.error(`  ✗ Error importing:`, error);
      return false;
    }
  }

  /**
   * Run the full import
   */
  async runImport(): Promise<void> {
    console.log(`\nStarting import from ${this.hymnalName} (${this.hymnalCode})...`);
    console.log(`Using ${this.existingHymns.length} existing hymns for duplicate detection\n`);

    try {
      // Get all pagination URLs
      console.log('Finding all hymnal pages...');
      const paginationUrls = await this.getAllPaginationUrls();
      console.log(`Found ${paginationUrls.length} pages\n`);

      // Get all hymn numbers
      const allHymnNumbers: string[] = [];
      for (const url of paginationUrls) {
        await this.delay();
        const hymnNumbers = await this.getHymnsWithText(url);
        allHymnNumbers.push(...hymnNumbers);
        console.log(`  Found ${hymnNumbers.length} hymns with text on this page`);
      }

      console.log(`\nTotal hymns with text available: ${allHymnNumbers.length}\n`);

      // Import each hymn
      let imported = 0;
      let duplicates = 0;
      let licenseIssues = 0;
      let errors = 0;

      for (let i = 0; i < allHymnNumbers.length; i++) {
        const hymnNumber = allHymnNumbers[i];
        console.log(`[${i + 1}/${allHymnNumbers.length}] Processing hymn ${hymnNumber}...`);

        try {
          await this.delay();
          const hymnData = await this.getHymnData(hymnNumber);

          if (!hymnData) {
            licenseIssues++;
            continue;
          }

          const success = await this.importHymn(hymnData);
          if (success) {
            imported++;
          } else {
            duplicates++;
          }
        } catch (error) {
          console.error(`  ✗ Failed:`, error);
          errors++;
        }
      }

      console.log(`\n${'='.repeat(60)}`);
      console.log(`${this.hymnalName} Import Complete`);
      console.log(`  Imported: ${imported}`);
      console.log(`  Duplicates: ${duplicates}`);
      console.log(`  License issues: ${licenseIssues}`);
      console.log(`  Errors: ${errors}`);
      console.log(`  Total processed: ${allHymnNumbers.length}`);
      console.log(`${'='.repeat(60)}\n`);
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  }
}
