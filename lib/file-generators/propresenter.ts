import { Slide } from '../hymn-processor/parser';

export interface ProPresenterOptions {
  version?: 6 | 7; // ProPresenter version
  category?: string;
}

/**
 * Generate ProPresenter 6 XML format
 */
function generateProPresenter6XML(
  slides: Slide[],
  hymnTitle: string,
  options: ProPresenterOptions
): string {
  const { category = 'Hymn' } = options;

  // Build slides XML
  const slidesXML = slides.map((slide, index) => {
    const linesXML = slide.lines.map((line, lineIndex) => {
      return `          <RVTextElement displayDelay="0" displayName="Default" locked="0" persistent="0" typeID="0" fromTemplate="0" bezelRadius="0" drawingFill="0" drawingShadow="1" drawingStroke="0" fillColor="0 0 0 0" rotation="0" source="" adjustsHeightToFit="0" verticalAlignment="0" RTFData="${escapeXML(line)}" revealType="0">
            <_-RVRect3D-_position x="10" y="10" z="0" width="1004" height="748" />
            <_-D-_serializedShadow containerClass="NSMutableDictionary">
              <NSNumber containerClass="NSNumber" key="shadowBlurRadius">10</NSNumber>
              <NSMutableString containerClass="NSMutableString" key="shadowColor">{0, 0, 0, 1}</NSMutableString>
              <NSMutableString containerClass="NSMutableString" key="shadowOffset">{2, -2}</NSMutableString>
            </_-D-_serializedShadow>
            <stroke containerClass="NSMutableDictionary" />
          </RVTextElement>`;
    }).join('\n');

    return `    <RVSlideGrouping name="${escapeXML(slide.sectionType)}" uuid="${generateUUID()}" color="0 0 0 0" serialization-array-index="${index}">
      <RVDisplaySlide backgroundColor="0 0 0 1" enabled="1" highlightColor="0 0 0 0" hotKey="" label="" notes="" slideType="1" sort_index="${index}" UUID="${generateUUID()}" drawingBackgroundColor="0" chordChartPath="" serialization-array-index="${index}">
        <cues containerClass="NSMutableArray" />
        <displayElements containerClass="NSMutableArray">
${linesXML}
        </displayElements>
      </RVDisplaySlide>
    </RVSlideGrouping>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<RVPresentationDocument height="768" width="1024" versionNumber="600" docType="0" creatorCode="1349676880" lastDateUsed="${new Date().toISOString()}" usedCount="0" category="${escapeXML(category)}" resourcesDirectory="" backgroundColor="0 0 0 1" drawingBackgroundColor="0" notes="" artist="" author="" album="" title="${escapeXML(hymnTitle)}" CCLIDisplay="0" CCLIArtistCredits="" CCLISongTitle="" CCLIPublisher="" CCLICopyrightInfo="" CCLILicenseNumber="" chordChartPath="">
  <timeline timeOffSet="0" selectedMediaTrackIndex="0" unitOfMeasure="60" duration="0" loop="0">
    <timeCues containerClass="NSMutableArray" />
    <mediaTracks containerClass="NSMutableArray" />
  </timeline>
  <bibleReference containerClass="NSMutableDictionary" />
  <_-RVProTransitionObject-_transitionObject transitionType="-1" transitionDuration="1" motionEnabled="0" motionDuration="20" motionSpeed="100" />
  <groups containerClass="NSMutableArray">
${slidesXML}
  </groups>
  <arrangements containerClass="NSMutableArray" />
</RVPresentationDocument>`;
}

/**
 * Generate ProPresenter 7 format (similar to v6 but with some differences)
 */
function generateProPresenter7XML(
  slides: Slide[],
  hymnTitle: string,
  options: ProPresenterOptions
): string {
  // ProPresenter 7 uses a very similar format to v6
  // For now, we'll use the same generator
  // In production, you might want to adjust for v7 specific features
  return generateProPresenter6XML(slides, hymnTitle, options);
}

/**
 * Main export function
 */
export function generateProPresenter(
  slides: Slide[],
  hymnTitle: string,
  options: ProPresenterOptions = {}
): string {
  const { version = 6 } = options;

  if (version === 7) {
    return generateProPresenter7XML(slides, hymnTitle, options);
  }

  return generateProPresenter6XML(slides, hymnTitle, options);
}

/**
 * Escape XML special characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate a UUID (simple version)
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
