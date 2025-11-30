import { Slide } from '../hymn-processor/parser';
import { generateProPresenter6Manual } from './propresenter6-manual';

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
 * Generate ProPresenter 6 XML format using manual XML generation
 */
function generateProPresenter6XML(
  slides: Slide[],
  hymnTitle: string,
  options: ProPresenterOptions
): string {
  const {
    author,
    publisher,
    ccliNumber,
    copyrightYear,
    includeTitleSlide = false,
    includeVerseNumbers = false,
    backgroundColor = { r: 0, g: 0, b: 0 },
    textColor = { r: 1, g: 1, b: 1 },
    includeShadow = false,
    includeOutline = false,
    outlineColor = { r: 0, g: 0, b: 0 },
  } = options;

  // Add includeBackground based on whether backgroundColor has any non-zero values
  const includeBackground = backgroundColor.r > 0 || backgroundColor.g > 0 || backgroundColor.b > 0;

  return generateProPresenter6Manual(slides, hymnTitle, {
    author,
    publisher,
    ccliNumber,
    copyrightYear,
    includeVerseNumbers,
    includeTitleSlide,
    includeBackground,
    backgroundColor: { ...backgroundColor, a: 1 },
    textColor: { ...textColor, a: 1 },
    includeShadow,
    includeOutline,
    outlineColor: { ...outlineColor, a: 1 },
  });
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
