import pptxgen from 'pptxgenjs';
import { Slide } from '../hymn-processor/parser';

export interface PowerPointOptions {
  fontSize?: number;
  fontFace?: string;
  textColor?: string;
  backgroundColor?: string;
  includeTitleSlide?: boolean;
  includeVerseNumbers?: boolean;
}

/**
 * Generate PowerPoint presentation from slides
 */
export async function generatePowerPoint(
  slides: Slide[],
  hymnTitle: string,
  options: PowerPointOptions = {}
): Promise<Buffer> {
  const pptx = new pptxgen();

  // Set default options
  const {
    fontSize = 32,
    fontFace = 'Arial',
    textColor = '000000',
    backgroundColor = 'FFFFFF',
    includeTitleSlide = true,
    includeVerseNumbers = false
  } = options;

  // Add title slide if requested
  if (includeTitleSlide) {
    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: backgroundColor };
    titleSlide.addText(hymnTitle, {
      x: 0.5,
      y: '40%',
      w: '90%',
      h: 1,
      fontSize: 44,
      bold: true,
      color: textColor,
      align: 'center',
      fontFace
    });
  }

  // Track which sections we've seen for numbering/labeling
  const seenSections = new Set<string>();

  // Add content slides
  for (const slide of slides) {
    const contentSlide = pptx.addSlide();
    contentSlide.background = { color: backgroundColor };

    let text = slide.lines.join('\n');

    // Add verse number or refrain prefix if requested and this is the first slide of a section
    if (includeVerseNumbers) {
      if (slide.sectionType === 'verse' && slide.sectionNumber) {
        const verseKey = `verse-${slide.sectionNumber}`;
        if (!seenSections.has(verseKey)) {
          seenSections.add(verseKey);
          // Prepend verse number to first line
          const lines = slide.lines;
          text = `${slide.sectionNumber} ${lines[0]}${lines.length > 1 ? '\n' + lines.slice(1).join('\n') : ''}`;
        }
      } else if (slide.sectionType === 'chorus') {
        const chorusKey = 'chorus';
        if (!seenSections.has(chorusKey)) {
          seenSections.add(chorusKey);
          // Prepend "Refrain: " to first line
          const lines = slide.lines;
          text = `Refrain: ${lines[0]}${lines.length > 1 ? '\n' + lines.slice(1).join('\n') : ''}`;
        }
      }
    }

    contentSlide.addText(text, {
      x: 0.5,
      y: '30%',
      w: '90%',
      h: '40%',
      fontSize,
      color: textColor,
      align: 'center',
      valign: 'middle',
      fontFace
    });
  }

  // Generate and return buffer
  const buffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer;
  return buffer;
}
