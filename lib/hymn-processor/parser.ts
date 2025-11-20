/**
 * Hymn Text Processor
 * Cleans and structures hymn text for presentation
 */

export interface HymnLine {
  text: string;
  originalIndex: number;
}

export interface HymnSection {
  type: 'verse' | 'chorus' | 'bridge' | 'other';
  number?: number;
  lines: HymnLine[];
}

export interface HymnStructure {
  sections: HymnSection[];
}

/**
 * Clean text by removing punctuation, extra whitespace, and labels
 */
export function cleanText(text: string): string {
  return text
    // Remove common punctuation (but keep apostrophes in contractions)
    .replace(/[.,;:!?"""''—–-]/g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detect section type from label
 */
function detectSectionType(line: string): { type: HymnSection['type'], number?: number } | null {
  const lowerLine = line.toLowerCase().trim();

  // Verse patterns: "Verse 1", "1.", "V1", etc.
  const verseMatch = lowerLine.match(/^(?:verse\s*)?(\d+)\.?$/i) ||
                     lowerLine.match(/^v\.?\s*(\d+)$/i);
  if (verseMatch) {
    return { type: 'verse', number: parseInt(verseMatch[1]) };
  }

  // Chorus patterns
  if (lowerLine.match(/^(?:chorus|refrain|ref)\.?$/i)) {
    return { type: 'chorus' };
  }

  // Bridge pattern
  if (lowerLine.match(/^bridge\.?$/i)) {
    return { type: 'bridge' };
  }

  return null;
}

/**
 * Parse raw hymn text into structured sections
 */
export function parseHymnText(rawText: string): HymnStructure {
  const lines = rawText.split('\n');
  const sections: HymnSection[] = [];
  let currentSection: HymnSection | null = null;
  let lineIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      // Empty line might indicate end of section
      if (currentSection && currentSection.lines.length > 0) {
        sections.push(currentSection);
        currentSection = null;
      }
      continue;
    }

    // Check if this line is a section label
    const sectionType = detectSectionType(line);

    if (sectionType) {
      // Save previous section if exists
      if (currentSection && currentSection.lines.length > 0) {
        sections.push(currentSection);
      }

      // Start new section
      currentSection = {
        type: sectionType.type,
        number: sectionType.number,
        lines: []
      };
      continue;
    }

    // If no current section, create a default verse
    if (!currentSection) {
      currentSection = {
        type: 'verse',
        number: sections.filter(s => s.type === 'verse').length + 1,
        lines: []
      };
    }

    // Add cleaned line to current section
    const cleanedLine = cleanText(line);
    if (cleanedLine) {
      currentSection.lines.push({
        text: cleanedLine,
        originalIndex: lineIndex++
      });
    }
  }

  // Don't forget the last section
  if (currentSection && currentSection.lines.length > 0) {
    sections.push(currentSection);
  }

  return { sections };
}

/**
 * Format hymn structure into slides with configurable lines per slide
 */
export interface Slide {
  lines: string[];
  sectionType: HymnSection['type'];
  sectionNumber?: number;
}

export function formatAsSlides(structure: HymnStructure, linesPerSlide: number = 2): Slide[] {
  const slides: Slide[] = [];

  for (const section of structure.sections) {
    const sectionLines = section.lines.map(l => l.text);

    // Split section into slides
    for (let i = 0; i < sectionLines.length; i += linesPerSlide) {
      slides.push({
        lines: sectionLines.slice(i, i + linesPerSlide),
        sectionType: section.type,
        sectionNumber: section.number
      });
    }
  }

  return slides;
}

/**
 * Format slides as plain text for copying
 */
export function formatAsPlainText(slides: Slide[]): string {
  return slides.map(slide => slide.lines.join('\n')).join('\n\n');
}

/**
 * Format slides with slide separators for per-slide copying
 */
export function formatAsPerSlideText(slides: Slide[]): string {
  return slides.map((slide, index) => {
    const slideNumber = index + 1;
    return `--- Slide ${slideNumber} ---\n${slide.lines.join('\n')}`;
  }).join('\n\n');
}
