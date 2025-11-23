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
  } = options;

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

    const rtf = `{\\rtf1\\ansi\\ansicpg1252\\cocoartf2867
\\cocoatextscaling0\\cocoaplatform0{\\fonttbl\\f0\\fswiss\\fcharset0 ${font};}
{\\colortbl;\\red255\\green255\\blue255;\\red255\\green255\\blue255;}
{\\*\\expandedcolortbl;;\\cssrgb\\c100000\\c100000\\c100000;}
\\pard\\tx560\\tx1120\\tx1680\\tx2240\\tx2800\\tx3360\\tx3920\\tx4480\\tx5040\\tx5600\\tx6160\\tx6720\\sa1400\\pardirnatural\\qc\\partightenfactor0

\\f0${boldTag}\\fs${size * 2} \\cf2${baselineTag} ${text.replace(/\n/g, '\\\n')}}`;

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
      name: slideName,
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
                backgroundColor: backgroundColor,
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
                      locked: false,
                      aspectRatioLocked: false,
                      path: {
                        closed: true,
                        points: [
                          { point: { x: 0, y: 0 }, q0: { x: 0, y: 0 }, q1: { x: 0, y: 0 }, curved: false },
                          { point: { x: 1, y: 0 }, q0: { x: 1, y: 0 }, q1: { x: 1, y: 0 }, curved: false },
                          { point: { x: 1, y: 1 }, q0: { x: 1, y: 1 }, q1: { x: 1, y: 1 }, curved: false },
                          { point: { x: 0, y: 1 }, q0: { x: 0, y: 1 }, q1: { x: 0, y: 1 }, curved: false },
                        ],
                        shape: { type: 1 }, // TYPE_RECTANGLE
                      },
                      fill: {
                        enable: false,
                        color: { red: 0, green: 0, blue: 0, alpha: 0.7 },
                        FillType: 'color',
                      },
                      stroke: {
                        enable: false,
                        width: 1,
                        color: { red: 1, green: 1, blue: 1, alpha: 1 },
                      },
                      shadow: {
                        style: 0, // STYLE_DROP
                        angle: 315,
                        offset: 5,
                        radius: 5,
                        color: { red: 0, green: 0, blue: 0, alpha: 1 },
                        opacity: 0.75,
                        enable: false,
                      },
                      feather: {
                        style: 0, // STYLE_INSIDE
                        radius: 0.0517578125,
                        enable: false,
                      },
                      text: {
                        rtfData: textToRTFBase64(text, isTitle),
                        verticalAlignment: 1, // VERTICAL_ALIGNMENT_MIDDLE
                        scaleBehavior: 1, // SCALE_BEHAVIOR_SCALE_FONT_DOWN
                        isSuperscriptStandardized: true,
                        attributes: {
                          font: {
                            name: slideFont,
                            size: slideSize,
                            family: isTitle ? 'Helvetica' : fontName,
                            face: '',
                            italic: false,
                            bold: isBold,
                          },
                          textSolidFill: textColor,
                          fill: 'textSolidFill',
                          paragraphStyle: {
                            alignment: 1, // ALIGNMENT_CENTER
                            lineHeightMultiple: 1,
                            paragraphSpacing: 70,
                            tabStops: [
                              { location: 28, alignment: 0 },
                              { location: 56, alignment: 0 },
                              { location: 84, alignment: 0 },
                              { location: 112, alignment: 0 },
                              { location: 140, alignment: 0 },
                              { location: 168, alignment: 0 },
                              { location: 196, alignment: 0 },
                              { location: 224, alignment: 0 },
                              { location: 252, alignment: 0 },
                              { location: 280, alignment: 0 },
                              { location: 308, alignment: 0 },
                              { location: 336, alignment: 0 },
                            ],
                          },
                        },
                      },
                    },
                  },
                ],
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
