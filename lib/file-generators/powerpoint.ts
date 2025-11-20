import pptxgen from 'pptxgenjs';
import { Slide } from '../hymn-processor/parser';

export interface PowerPointOptions {
  fontSize?: number;
  fontFace?: string;
  textColor?: string;
  backgroundColor?: string;
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
    backgroundColor = 'FFFFFF'
  } = options;

  // Add title slide
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

  // Add content slides
  for (const slide of slides) {
    const contentSlide = pptx.addSlide();
    contentSlide.background = { color: backgroundColor };

    const text = slide.lines.join('\n');

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
