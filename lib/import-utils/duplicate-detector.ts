/**
 * Duplicate Detection Utility
 * Uses fuzzy matching to detect duplicate hymns across different sources
 */

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity ratio between two strings (0-1)
 */
function similarityRatio(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLen = Math.max(str1.length, str2.length);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

/**
 * Normalize a string for comparison
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    // Remove all punctuation
    .replace(/[^\w\s]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ');
}

/**
 * Normalize author name for comparison
 * Removes dates, middle initials, and standardizes format
 */
export function normalizeAuthorName(author: string): string {
  return author
    .toLowerCase()
    .trim()
    // Remove birth/death dates like (1707-1788) or (1707–1788)
    .replace(/\([0-9]{4}[-–][0-9]{4}\)/g, '')
    .replace(/\([0-9]{4}-\)/g, '')
    .replace(/\(b\.\s*[0-9]{4}\)/g, '')
    .replace(/\(d\.\s*[0-9]{4}\)/g, '')
    // Remove standalone years
    .replace(/[0-9]{4}[-–][0-9]{4}/g, '')
    // Remove middle initials like "John Q. Smith" -> "John Smith"
    .replace(/\b[A-Z]\.\s*/g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim()
    // Remove punctuation
    .replace(/[.,;:]/g, '');
}

/**
 * Extract first line from raw text
 */
export function extractFirstLine(rawText: string): string {
  const lines = rawText.split('\n').filter(line => line.trim());
  return lines.length > 0 ? normalizeString(lines[0]) : '';
}

export interface HymnForComparison {
  id?: string;
  title: string;
  author?: string | null;
  firstLine?: string | null;
  rawText?: string | null;
  sourceUrl?: string | null;
}

export interface DuplicateMatch {
  existingHymn: HymnForComparison;
  reason: string;
  confidence: number; // 0-1, higher is more confident it's a duplicate
}

/**
 * Check if a hymn is a duplicate of an existing hymn
 */
export function findDuplicate(
  newHymn: HymnForComparison,
  existingHymns: HymnForComparison[]
): DuplicateMatch | null {
  const normalizedNewTitle = normalizeString(newHymn.title);
  const normalizedNewAuthor = newHymn.author ? normalizeAuthorName(newHymn.author) : '';
  const normalizedNewFirstLine = newHymn.firstLine
    ? normalizeString(newHymn.firstLine)
    : newHymn.rawText
    ? extractFirstLine(newHymn.rawText)
    : '';

  for (const existing of existingHymns) {
    const normalizedExistingTitle = normalizeString(existing.title);
    const normalizedExistingAuthor = existing.author ? normalizeAuthorName(existing.author) : '';
    const normalizedExistingFirstLine = existing.firstLine
      ? normalizeString(existing.firstLine)
      : existing.rawText
      ? extractFirstLine(existing.rawText)
      : '';

    // Strategy 1: Exact title match with same/similar author
    if (normalizedNewTitle === normalizedExistingTitle) {
      // If both have authors and they match (fuzzy), it's definitely a duplicate
      if (normalizedNewAuthor && normalizedExistingAuthor) {
        const authorSimilarity = similarityRatio(normalizedNewAuthor, normalizedExistingAuthor);
        if (authorSimilarity > 0.8) {
          return {
            existingHymn: existing,
            reason: `Exact title match with similar author (${(authorSimilarity * 100).toFixed(0)}% match)`,
            confidence: 0.95
          };
        }
      }

      // Same title, no author info to compare - still likely duplicate
      if (!normalizedNewAuthor || !normalizedExistingAuthor) {
        return {
          existingHymn: existing,
          reason: 'Exact title match (no author to compare)',
          confidence: 0.85
        };
      }
    }

    // Strategy 2: Very similar title (>90%) with same author
    const titleSimilarity = similarityRatio(normalizedNewTitle, normalizedExistingTitle);
    if (titleSimilarity > 0.9 && normalizedNewAuthor && normalizedExistingAuthor) {
      const authorSimilarity = similarityRatio(normalizedNewAuthor, normalizedExistingAuthor);
      if (authorSimilarity > 0.8) {
        return {
          existingHymn: existing,
          reason: `Very similar title (${(titleSimilarity * 100).toFixed(0)}%) with similar author (${(authorSimilarity * 100).toFixed(0)}%)`,
          confidence: 0.9
        };
      }
    }

    // Strategy 3: Same first line with similar title
    if (normalizedNewFirstLine && normalizedExistingFirstLine) {
      const firstLineSimilarity = similarityRatio(normalizedNewFirstLine, normalizedExistingFirstLine);
      if (firstLineSimilarity > 0.9 && titleSimilarity > 0.7) {
        return {
          existingHymn: existing,
          reason: `Same first line (${(firstLineSimilarity * 100).toFixed(0)}%) with similar title (${(titleSimilarity * 100).toFixed(0)}%)`,
          confidence: 0.88
        };
      }
    }

    // Strategy 4: Same first line with same author (even if title differs)
    if (normalizedNewFirstLine && normalizedExistingFirstLine && normalizedNewAuthor && normalizedExistingAuthor) {
      const firstLineSimilarity = similarityRatio(normalizedNewFirstLine, normalizedExistingFirstLine);
      const authorSimilarity = similarityRatio(normalizedNewAuthor, normalizedExistingAuthor);
      if (firstLineSimilarity > 0.95 && authorSimilarity > 0.8) {
        return {
          existingHymn: existing,
          reason: `Same first line (${(firstLineSimilarity * 100).toFixed(0)}%) with same author (${(authorSimilarity * 100).toFixed(0)}%)`,
          confidence: 0.92
        };
      }
    }
  }

  return null;
}

/**
 * Check if a hymn should be skipped during import due to being a duplicate
 */
export function isDuplicate(
  newHymn: HymnForComparison,
  existingHymns: HymnForComparison[],
  threshold: number = 0.85
): boolean {
  const match = findDuplicate(newHymn, existingHymns);
  return match !== null && match.confidence >= threshold;
}
