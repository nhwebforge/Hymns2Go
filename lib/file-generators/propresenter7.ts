import protobuf from 'protobufjs';
import { Slide } from '../hymn-processor/parser';
import path from 'path';
import { randomUUID } from 'crypto';

export interface ProPresenter7Options {
  fontName?: string;
  fontSize?: number;
  textColor?: { r: number; g: number; b: number; a: number };
  backgroundColor?: { r: number; g: number; b: number; a: number };
  includeTitleSlide?: boolean;
  includeVerseNumbers?: boolean;
  ccliNumber?: string;
  author?: string;
  publisher?: string;
  copyrightYear?: number;
  includeShadow?: boolean;
  includeOutline?: boolean;
  outlineColor?: { r: number; g: number; b: number; a: number };
}

/**
 * Generate ProPresenter 7 binary file (.pro) from slides
 *
 * ProPresenter 7 uses Google Protocol Buffers for file serialization.
 * This implementation is based on decoding actual working Pro7 files.
 */
export async function generateProPresenter7(
  slides: Slide[],
  hymnTitle: string,
  options: ProPresenter7Options = {}
): Promise<Buffer> {
  const {
    fontName = 'Helvetica',
    fontSize = 140,
    textColor = { r: 1, g: 1, b: 1, a: 1 }, // White
    backgroundColor = { r: 0, g: 0, b: 0, a: 1 }, // Black
    includeTitleSlide = false,
    includeVerseNumbers = false,
    author,
    publisher,
    ccliNumber,
    copyrightYear,
    includeShadow = false,
    includeOutline = false,
    outlineColor = { r: 0, g: 0, b: 0, a: 1 }, // Black outline
  } = options;

  console.log('=== generateProPresenter7 called ===');
  console.log('includeShadow:', includeShadow);
  console.log('includeOutline:', includeOutline);

  // Load proto files
  const protoPath = path.join(process.cwd(), 'lib', 'proto');
  const root = await protobuf.load([
    path.join(protoPath, 'presentation.proto'),
  ]);

  const PresentationType = root.lookupType('rv.data.Presentation');

  // Helper to create UUID
  const createUUID = () => ({ string: randomUUID() });

  // Helper to create timestamp
  const createTimestamp = () => {
    const now = new Date();
    return {
      seconds: Math.floor(now.getTime() / 1000),
      nanos: (now.getTime() % 1000) * 1000000,
    };
  };

  // Helper to convert text to RTF and base64 encode it
  const textToRTFBase64 = (text: string, isTitle: boolean = false): string => {
    const font = isTitle ? 'Helvetica-Bold' : fontName;
    const size = isTitle ? 160 : fontSize;
    const boldTag = isTitle ? '\\b' : '';
    const baselineTag = isTitle ? ' \\up0' : '';

    // Convert text color to RGB 0-255 range
    // When shadow is enabled, ProPresenter adjusts colors slightly in RTF
    let textR = Math.round(textColor.r * 255);
    let textG = Math.round(textColor.g * 255);
    let textB = Math.round(textColor.b * 255);

    if (includeShadow) {
      // Reduce red slightly (by about 6-34 depending on initial value)
      if (textR === 0) {
        textR = 34;
      } else if (textR > 200) {
        textR = Math.max(0, textR - 6);
      }

      // Add small amount to blue (about 10-12)
      if (textB < 20) {
        textB = Math.min(255, textB + 10);
      } else if (textB > 40) {
        textB = Math.max(0, textB - 12);
      }
    }

    // Convert text color to percentage for cssrgb
    const textRPct = Math.round((textColor.r * 255) / 255 * 100000);
    const textGPct = Math.round((textColor.g * 255) / 255 * 100000);
    const textBPct = Math.round((textColor.b * 255) / 255 * 100000);

    // Add outline color to color table if outline is enabled
    const outlineR = Math.round(outlineColor.r * 255);
    const outlineG = Math.round(outlineColor.g * 255);
    const outlineB = Math.round(outlineColor.b * 255);

    const colorTable = includeOutline
      ? `{\\colortbl;\\red255\\green255\\blue255;\\red${textR}\\green${textG}\\blue${textB};\\red${outlineR}\\green${outlineG}\\blue${outlineB};}`
      : `{\\colortbl;\\red255\\green255\\blue255;\\red${textR}\\green${textG}\\blue${textB};}`;

    const expandedColorTable = includeOutline
      ? `{\\*\\expandedcolortbl;;\\cssrgb\\c${textRPct}\\c${textGPct}\\c${textBPct};\\csgray\\c0;}`
      : `{\\*\\expandedcolortbl;;\\cssrgb\\c${textRPct}\\c${textGPct}\\c${textBPct};}`;

    // Add outline/stroke tags if enabled
    const outlineTag = includeOutline ? ' \\outl0\\strokewidth-40 \\strokec3' : '';

    const rtf = `{\\rtf1\\ansi\\ansicpg1252\\cocoartf2867
\\cocoatextscaling0\\cocoaplatform0{\\fonttbl\\f0\\fswiss\\fcharset0 ${font};}
${colorTable}
${expandedColorTable}
\\pard\\tx560\\tx1120\\tx1680\\tx2240\\tx2800\\tx3360\\tx3920\\tx4480\\tx5040\\tx5600\\tx6160\\tx6720\\sa1400\\pardirnatural\\qc\\partightenfactor0

\\f0${boldTag}\\fs${size * 2} \\cf2${baselineTag}${outlineTag} ${text.replace(/\n/g, '\\\n')}}`;

    return Buffer.from(rtf, 'utf-8').toString('base64');
  };

  // Helper to create a cue (slide)
  const createCue = (text: string, slideName: string, isTitle: boolean = false) => {
    const cueUUID = createUUID();
    const slideFont = isTitle ? 'Helvetica-Bold' : fontName;
    const slideSize = isTitle ? 160 : fontSize;
    const isBold = isTitle;

    const cueData = {
      uuid: cueUUID,
      isEnabled: true,
      actions: [
        {
          uuid: createUUID(),
          isEnabled: true,
          type: 11, // ACTION_TYPE_PRESENTATION_SLIDE
          slide: {
            presentation: {
              baseSlide: {
                uuid: createUUID(),
                size: { width: 1920, height: 1080 },
                drawsBackgroundColor: true,
                backgroundColor: {
                  red: backgroundColor.r,
                  green: backgroundColor.g,
                  blue: backgroundColor.b,
                  alpha: backgroundColor.a,
                },
                elements: [
                  {
                    element: {
                      uuid: createUUID(),
                      name: 'Text',
                      bounds: {
                        origin: { x: 100, y: 100 },
                        size: { width: 1720, height: 880 },
                      },
                      opacity: 1.0,
                      path: {
                        closed: true,
                        points: [
                          { point: {}, q0: {}, q1: {} },
                          { point: { x: 1 }, q0: { x: 1 }, q1: { x: 1 } },
                          { point: { x: 1, y: 1 }, q0: { x: 1, y: 1 }, q1: { x: 1, y: 1 } },
                          { point: { y: 1 }, q0: { y: 1 }, q1: { y: 1 } },
                        ],
                        shape: { type: 1 }, // TYPE_RECTANGLE
                      },
                      fill: {
                        color: { alpha: 0.7 },
                      },
                      stroke: {
                        width: 1,
                        color: { red: 1, green: 1, blue: 1, alpha: 1 },
                      },
                      shadow: includeShadow ? {
                        angle: 315,
                        offset: 5,
                        radius: 5,
                        color: { alpha: 1.0 },
                        opacity: 0.75,
                      } : undefined,
                      feather: {
                        radius: 0.0517578125,
                      },
                      text: {
                        rtfData: textToRTFBase64(text, isTitle),
                        shadow: includeShadow ? {
                          angle: 315,
                          offset: 5,
                          radius: 5,
                          color: { alpha: 1 },
                          opacity: 1,
                          enable: true,
                        } : { color: {} },
                        verticalAlignment: 1, // VERTICAL_ALIGNMENT_MIDDLE
                        scaleBehavior: 1, // SCALE_BEHAVIOR_SCALE_FONT_DOWN
                        margins: {},
                        isSuperscriptStandardized: true,
                        transformDelimiter: '  •  ',
                        chordPro: {
                          color: {
                            red: 0.9929999709129333,
                            green: 0.7599999904632568,
                            blue: 0.03200000151991844,
                            alpha: 1
                          }
                        },
                        attributes: {
                          font: {
                            name: slideFont,
                            size: slideSize,
                            family: isTitle ? 'Helvetica' : fontName,
                            ...(isBold && { bold: true }),
                          },
                          textSolidFill: {
                            ...(textColor.r !== 0 && { red: textColor.r }),
                            green: textColor.g,
                            ...(textColor.b !== 0 && { blue: textColor.b }),
                            alpha: textColor.a,
                          },
                          fill: 'textSolidFill',
                          underlineStyle: {},
                          ...(includeShadow && {
                            strokeWidth: -2,
                            strokeColor: { alpha: 1 }
                          }),
                          strikethroughStyle: {},
                          paragraphStyle: {
                            alignment: 2, // ALIGNMENT_CENTER
                            lineHeightMultiple: 1,
                            paragraphSpacing: 70,
                            tabStops: [
                              { location: 28 },
                              { location: 56 },
                              { location: 84 },
                              { location: 112 },
                              { location: 140 },
                              { location: 168 },
                              { location: 196 },
                              { location: 224 },
                              { location: 252 },
                              { location: 280 },
                              { location: 308 },
                              { location: 336 },
                            ],
                            textList: {},
                          },
                        },
                      },
                      textLineMask: {},
                    },
                    textScroller: {
                      scrollRate: 0.5,
                      shouldRepeat: true,
                      repeatDistance: 0.05813953488372093
                    },
                  },
                ],
              },
              chordChart: {
                platform: 1
              },
            },
          },
        },
      ],
    };

    return { cueData, cueUUID };
  };

  // Create cues and cue groups
  const cues = [];
  const cueGroups = [];

  // Add title slide if requested
  if (includeTitleSlide) {
    const { cueData, cueUUID } = createCue(hymnTitle, '', true);
    cues.push(cueData);

    // Create "Intro" group for title slide
    cueGroups.push({
      cueIdentifiers: [cueUUID],
      group: {
        uuid: createUUID(),
        name: 'Intro',
        color: { red: 0.7019608020782471, green: 0.6549019813537598, blue: 0.1411764770746231, alpha: 1 },
        hotKey: { code: 0, controlIdentifier: '' },
        applicationGroupIdentifier: createUUID(),
        applicationGroupName: '',
      },
    });
  }

  // Group slides by section
  const sectionGroups: Record<string, { cueUUIDs: any[], slides: any[] }> = {};

  slides.forEach((slide) => {
    const sectionKey = slide.sectionType === 'verse' && slide.sectionNumber
      ? `Verse ${slide.sectionNumber}`
      : slide.sectionType === 'chorus'
      ? 'Refrain'
      : slide.sectionType === 'bridge'
      ? 'Bridge'
      : 'Other';

    if (!sectionGroups[sectionKey]) {
      sectionGroups[sectionKey] = { cueUUIDs: [], slides: [] };
    }

    sectionGroups[sectionKey].slides.push(slide);
  });

  // Colors for verse groups (cycling pattern)
  const verseColors = [
    { red: 0, green: 0.46666666865348816, blue: 0.800000011920929, alpha: 1 },
    { red: 0, green: 0.3490196168422699, blue: 0.6000000238418579, alpha: 1 },
    { red: 0, green: 0.23529411852359772, blue: 0.4000000059604645, alpha: 1 },
    { red: 0, green: 0.40784314274787903, blue: 0.7019608020782471, alpha: 1 },
    { red: 0, green: 0.29019609093666077, blue: 0.501960813999176, alpha: 1 },
  ];

  // Create cues for each section and build groups
  let verseIndex = 0;
  Object.entries(sectionGroups).forEach(([sectionName, sectionData]) => {
    const groupCueUUIDs: any[] = [];

    sectionData.slides.forEach((slide, slideIndex) => {
      let text = slide.lines.join('\n');

      // Prepend verse number or refrain prefix if requested
      // Only add to the FIRST slide of each section
      if (includeVerseNumbers && slideIndex === 0) {
        const lines = slide.lines;
        if (slide.sectionType === 'verse' && slide.sectionNumber) {
          // Add verse number to the first line
          text = `${slide.sectionNumber} ${lines[0]}${lines.length > 1 ? '\n' + lines.slice(1).join('\n') : ''}`;
        } else if (slide.sectionType === 'chorus') {
          // Add "Refrain: " to the first line
          text = `Refrain: ${lines[0]}${lines.length > 1 ? '\n' + lines.slice(1).join('\n') : ''}`;
        }
      }

      const slideName = slide.sectionType === 'verse' && slide.sectionNumber
        ? `Verse ${slide.sectionNumber}`
        : slide.sectionType === 'chorus'
        ? 'Refrain'
        : slide.sectionType === 'bridge'
        ? 'Bridge'
        : 'Slide';

      const { cueData, cueUUID } = createCue(text, slideName);
      cues.push(cueData);
      groupCueUUIDs.push(cueUUID);
    });

    // Create group for this section
    const color = sectionName.startsWith('Verse')
      ? verseColors[verseIndex++ % verseColors.length]
      : { red: 0.5, green: 0.5, blue: 0.5, alpha: 1 }; // Default color for non-verse sections

    cueGroups.push({
      cueIdentifiers: groupCueUUIDs,
      group: {
        uuid: createUUID(),
        name: sectionName,
        color: color,
        hotKey: { code: 0, controlIdentifier: '' },
        applicationGroupIdentifier: createUUID(),
        applicationGroupName: '',
      },
    });
  });

  // Create presentation
  const presentation: any = {
    applicationInfo: {
      platform: 1, // PLATFORM_MACOS
      application: 1, // APPLICATION_PROPRESENTER
      applicationVersion: {
        majorVersion: 7,
        minorVersion: 16,
        patchVersion: 0,
        build: '0',
      },
    },
    uuid: createUUID(),
    name: hymnTitle,
    lastDateUsed: createTimestamp(),
    lastModifiedDate: createTimestamp(),
    category: 'Hymns',
    arrangements: [],
    cueGroups: cueGroups,
    cues: cues,
    ccli: {
      author: author || '',
      artistCredits: '',
      songTitle: hymnTitle,
      publisher: publisher || '',
      copyrightYear: copyrightYear || 0,
      songNumber: ccliNumber ? parseInt(ccliNumber) : 0,
      display: false,
      album: '',
      artwork: '',
    },
  };

  // Encode
  const errMsg = PresentationType.verify(presentation);
  if (errMsg) {
    console.error(`ProPresenter 7 verification failed: ${errMsg}`);
    throw new Error(`ProPresenter 7 verification failed: ${errMsg}`);
  }

  const message = PresentationType.create(presentation);
  const buffer = PresentationType.encode(message).finish();

  return Buffer.from(buffer);
}
