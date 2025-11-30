import { Slide } from '../hymn-processor/parser';
import { ProPresenter6Builder } from 'propresenter-parser';

export interface ProPresenterOptions {
  version?: 6 | 7;
  category?: string;
  author?: string;
  publisher?: string;
  ccliNumber?: string;
  copyrightYear?: number;
  includeTitleSlide?: boolean;
  includeVerseNumbers?: boolean;
  backgroundColor?: { r: number; g: number; b: number };
  textColor?: { r: number; g: number; b: number };
  includeShadow?: boolean;
  includeOutline?: boolean;
  outlineColor?: { r: number; g: number; b: number };
}

/**
 * Generate ProPresenter 6 XML format using propresenter-parser library
 */
function generateProPresenter6XML(
  slides: Slide[],
  hymnTitle: string,
  options: ProPresenterOptions
): string {
  const {
    category = 'Hymn',
    author,
    publisher,
    ccliNumber,
    copyrightYear,
    includeTitleSlide = false,
    includeVerseNumbers = false,
    backgroundColor = { r: 0, g: 0, b: 0 },
    textColor = { r: 255, g: 255, b: 255 },
    includeShadow = false,
    includeOutline = false,
    outlineColor = { r: 0, g: 0, b: 0 },
  } = options;

  // Group slides by section
  const slideGroups: Array<{
    label: string;
    slides: string[];
    groupColor?: string;
  }> = [];

  // Add title slide if requested
  if (includeTitleSlide) {
    slideGroups.push({
      label: 'Intro',
      slides: [hymnTitle],
      groupColor: '#B3A824', // Yellowish color for intro
    });
  }

  // Group slides by section
  const sectionGroups: Record<
    string,
    { slides: string[]; color: string }
  > = {};

  // Colors for verse groups (cycling pattern) - using blue shades
  const verseColors = [
    '#0077CC',
    '#0059A3',
    '#003C66',
    '#0068B3',
    '#004A80',
  ];

  let verseColorIndex = 0;

  slides.forEach((slide) => {
    const sectionKey =
      slide.sectionType === 'verse' && slide.sectionNumber
        ? `Verse ${slide.sectionNumber}`
        : slide.sectionType === 'chorus'
        ? 'Refrain'
        : slide.sectionType === 'bridge'
        ? 'Bridge'
        : 'Other';

    const isFirstSlideInSection = !sectionGroups[sectionKey];

    if (!sectionGroups[sectionKey]) {
      // Assign color - use cycling colors for verses, gray for others
      const color = sectionKey.startsWith('Verse')
        ? verseColors[verseColorIndex++ % verseColors.length]
        : '#808080';

      sectionGroups[sectionKey] = { slides: [], color };
    }

    // Prepare slide text
    let slideText = slide.lines.join('\n');

    // Prepend verse number or refrain prefix if requested
    // Only add to the FIRST slide of each section
    if (includeVerseNumbers && isFirstSlideInSection) {
      const lines = slide.lines;
      if (slide.sectionType === 'verse' && slide.sectionNumber) {
        // Add verse number to the first line
        slideText = `${slide.sectionNumber} ${lines[0]}${
          lines.length > 1 ? '\n' + lines.slice(1).join('\n') : ''
        }`;
      } else if (slide.sectionType === 'chorus') {
        // Add "Refrain: " to the first line
        slideText = `Refrain: ${lines[0]}${
          lines.length > 1 ? '\n' + lines.slice(1).join('\n') : ''
        }`;
      }
    }

    sectionGroups[sectionKey].slides.push(slideText);
  });

  // Convert to slide groups array
  Object.entries(sectionGroups).forEach(([sectionName, sectionData]) => {
    slideGroups.push({
      label: sectionName,
      slides: sectionData.slides,
      groupColor: sectionData.color,
    });
  });

  // Build ProPresenter 6 file using the library
  // Note: Pro6 doesn't support per-slide formatting, so title slide and regular slides
  // will have the same formatting.
  const xmlOutput = ProPresenter6Builder({
    properties: {
      CCLISongTitle: hymnTitle,
      CCLIAuthor: author || '',
      CCLIArtistCredits: '',
      CCLIPublisher: publisher || '',
      CCLICopyrightYear: copyrightYear || 0,
      CCLISongNumber: ccliNumber ? parseInt(ccliNumber) : 0,
      CCLIDisplay: false,
      category: category,
      height: 1080,
      width: 1920,
    },
    slideGroups: slideGroups,
    slideTextFormatting: {
      fontName: 'Helvetica',
      textSize: 140,
      textColor: textColor,
      textPadding: 100,
      textShadow: includeShadow ? {
        enabled: true,
        angle: 315,
        color: { r: 0, g: 0, b: 0 },
        length: 5,
        radius: 5,
      } : {
        enabled: false,
        angle: 315,
        color: { r: 0, g: 0, b: 0 },
        length: 0,
        radius: 0,
      },
      textOutline: includeOutline ? {
        enabled: true,
        color: outlineColor,
        width: 3,
      } : undefined,
    },
  });

  return xmlOutput;
}

/**
 * Main export function
 * Note: ProPresenter 7 uses Protocol Buffers (binary format), not XML.
 * We only support ProPresenter 6 XML format, which is still compatible with Pro7
 * via import/conversion.
 */
export function generateProPresenter(
  slides: Slide[],
  hymnTitle: string,
  options: ProPresenterOptions = {}
): string {
  // Always generate Pro6 format (XML)
  // Pro7 uses Protocol Buffers which requires binary generation
  return generateProPresenter6XML(slides, hymnTitle, options);
}
