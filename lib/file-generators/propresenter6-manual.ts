import { v4 as uuidv4 } from 'uuid';
import { Slide } from '../hymn-processor/parser';

interface RgbColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

interface ProPresenter6Options {
  author?: string;
  publisher?: string;
  ccliNumber?: string;
  copyrightYear?: number;
  includeVerseNumbers?: boolean;
  includeTitleSlide?: boolean;
  fontFamily?: string;
  includeBackground?: boolean;
  backgroundColor?: RgbColor;
  textColor?: RgbColor;
  includeShadow?: boolean;
  includeOutline?: boolean;
  outlineColor?: RgbColor;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function colorToString(color: RgbColor): string {
  const a = color.a !== undefined ? color.a : 1;
  return `${color.r} ${color.g} ${color.b} ${a}`;
}

function generateRTF(text: string, textColor: RgbColor, includeOutline: boolean, outlineColor: RgbColor, fontFamily: string = 'Helvetica', isTitle: boolean = false): string {
  const textR = Math.round(textColor.r * 255);
  const textG = Math.round(textColor.g * 255);
  const textB = Math.round(textColor.b * 255);

  const outlineR = Math.round(outlineColor.r * 255);
  const outlineG = Math.round(outlineColor.g * 255);
  const outlineB = Math.round(outlineColor.b * 255);

  const colorTable = includeOutline
    ? `{\\colortbl;\\red255\\green255\\blue255;\\red${textR}\\green${textG}\\blue${textB};\\red${outlineR}\\green${outlineG}\\blue${outlineB};}`
    : `{\\colortbl;\\red255\\green255\\blue255;\\red${textR}\\green${textG}\\blue${textB};}`;

  // Title slides use larger font (160) and bold, regular slides use 140
  const fontSize = isTitle ? 160 : 140;
  const boldTag = isTitle ? '\\b' : '';

  // RTF uses actual newline character (not \\n), and sa1400 for paragraph spacing
  // Replace spaces in font name with backslash-space for RTF
  const rtfFontName = fontFamily.replace(/ /g, '\\ ');
  const rtf = `{\\rtf1\\ansi\\ansicpg1252\\cocoartf1038\\cocoasubrtf320{\\fonttbl\\f0\\fswiss\\fcharset0 ${rtfFontName};}${colorTable}\\pard\\tx560\\tx1120\\tx1680\\tx2240\\tx2800\\tx3360\\tx3920\\tx4480\\tx5040\\tx5600\\tx6160\\tx6720\\sa1400\\qc\\pardirnatural\\f0${boldTag}\\fs${fontSize * 2} \\cf1 ${text.replace(/\n/g, '\\\n')}}`;

  return Buffer.from(rtf, 'utf-8').toString('base64');
}

function calculateShadowOffset(angle: number, length: number): { x: number; y: number } {
  // Convert angle to radians
  const radians = (angle * Math.PI) / 180;

  // Calculate offsets
  // In ProPresenter, 0° is right, 90° is down, 180° is left, 270° is up
  // For 315° (bottom-right): x should be positive, y should be positive
  const x = Math.cos(radians) * length;
  const y = Math.sin(radians) * length;

  return { x, y };
}

export function generateProPresenter6Manual(
  slides: Slide[],
  hymnTitle: string,
  options: ProPresenter6Options = {}
): string {
  const {
    author = '',
    publisher = '',
    ccliNumber = '',
    copyrightYear = 0,
    includeVerseNumbers = false,
    includeTitleSlide = true,
    fontFamily = 'Helvetica',
    includeBackground = false,
    backgroundColor = { r: 0, g: 0, b: 0, a: 1 },
    textColor = { r: 1, g: 1, b: 1, a: 1 },
    includeShadow = false,
    includeOutline = false,
    outlineColor = { r: 0, g: 0, b: 0, a: 1 },
  } = options;

  // Calculate shadow offset for 315° (bottom-right)
  const shadowOffset = calculateShadowOffset(315, 5);
  const shadowString = includeShadow
    ? `5|0 0 0 1|{${shadowOffset.x}, ${shadowOffset.y}}`
    : `0|0 0 0 0|{0, 0}`;

  // Stroke width
  const strokeWidth = includeOutline ? 3 : 0;

  // Background color for slides - always include if specified, don't use transparent
  const bgColor = colorToString(backgroundColor);

  // Group slides by section
  interface SlideGroup {
    name: string;
    color: string;
    slides: Slide[];
  }

  const groups: SlideGroup[] = [];
  const slidesBySection: Record<string, Slide[]> = {};

  // Verse colors
  const verseColors = [
    '0 0.4666666666666667 0.8 1',
    '0 0.34901960784313724 0.6392156862745098 1',
    '0 0.23529411764705882 0.4 1',
    '0 0.2823529411764706 0.5333333333333333 1',
  ];
  let verseColorIndex = 0;

  slides.forEach(slide => {
    const sectionKey =
      slide.sectionType === 'verse' && slide.sectionNumber
        ? `Verse ${slide.sectionNumber}`
        : slide.sectionType === 'chorus'
        ? 'Refrain'
        : slide.sectionType === 'bridge'
        ? 'Bridge'
        : 'Other';

    if (!slidesBySection[sectionKey]) {
      slidesBySection[sectionKey] = [];
    }
    slidesBySection[sectionKey].push(slide);
  });

  // Add title slide if requested
  if (includeTitleSlide) {
    groups.push({
      name: 'Intro',
      color: '0.7019607843137254 0.6588235294117647 0.1411764705882353 1',
      slides: [{ lines: [hymnTitle], sectionType: 'title' } as Slide],
    });
  }

  // Add verse groups
  Object.entries(slidesBySection).forEach(([sectionName, sectionSlides]) => {
    const color = sectionName.startsWith('Verse')
      ? verseColors[verseColorIndex++ % verseColors.length]
      : '0.5019607843137255 0.5019607843137255 0.5019607843137255 1';

    groups.push({
      name: sectionName,
      color,
      slides: sectionSlides,
    });
  });

  // Generate XML
  let xml = `<?xml version="1.0" encoding="utf-8"?>
<RVPresentationDocument CCLIArtistCredits="" CCLIAuthor="${escapeXml(author)}" CCLICopyrightYear="${copyrightYear}" CCLIDisplay="false" CCLIPublisher="${escapeXml(publisher)}" CCLISongNumber="${ccliNumber}" CCLISongTitle="${escapeXml(hymnTitle)}" category="Hymn" notes="" lastDateUsed="${new Date().toISOString()}" height="1080" width="1920" backgroundColor="${colorToString(backgroundColor)}" buildNumber="6016" chordChartPath="" docType="0" drawingBackgroundColor="${includeBackground}" resourcesDirectory="" selectedArrangementID="" os="1" usedCount="0" versionNumber="600">
  <RVTransition rvXMLIvarName="transitionObject" transitionType="-1" transitionDirection="0" transitionDuration="1" motionEnabled="false" motionDuration="0" motionSpeed="0" groupIndex="0" orderIndex="0" slideBuildAction="0" slideBuildDelay="0"/>
  <RVTimeline rvXMLIvarName="timeline" timeOffset="0" duration="0" selectedMediaTrackIndex="0" loop="false">
    <array rvXMLIvarName="timeCues"/>
    <array rvXMLIvarName="mediaTracks"/>
  </RVTimeline>
  <array rvXMLIvarName="groups">`;

  groups.forEach(group => {
    xml += `
    <RVSlideGrouping name="${escapeXml(group.name)}" uuid="${uuidv4().toUpperCase()}" color="${group.color}">
      <array rvXMLIvarName="slides">`;

    group.slides.forEach(slide => {
      const slideText = slide.lines.join('\n');
      const plainTextBase64 = Buffer.from(slideText, 'utf-8').toString('base64');
      const isTitle = slide.sectionType === 'title';
      const rtfBase64 = generateRTF(slideText, textColor, includeOutline, outlineColor, fontFamily, isTitle);

      xml += `
        <RVDisplaySlide backgroundColor="${bgColor}" highlightColor="0 0 0 0" drawingBackgroundColor="${includeBackground}" enabled="true" hotKey="" label="" notes="" UUID="${uuidv4().toUpperCase()}" chordChartPath="">
          <array rvXMLIvarName="cues"/>
          <array rvXMLIvarName="displayElements">
            <RVTextElement displayName="Default" UUID="${uuidv4().toUpperCase()}" typeID="0" displayDelay="0" locked="false" persistent="0" fromTemplate="false" opacity="1" source="" bezelRadius="0" rotation="0" drawingFill="false" drawingShadow="${includeShadow}" drawingStroke="${includeOutline}" fillColor="1 1 1 0" adjustsHeightToFit="false" verticalAlignment="0" revealType="0">
              <RVRect3D rvXMLIvarName="position">{100 100 0 1720 880}</RVRect3D>
              <shadow rvXMLIvarName="shadow">${shadowString}</shadow>
              <dictionary rvXMLIvarName="stroke">
                <NSColor rvXMLDictionaryKey="RVShapeElementStrokeColorKey">${colorToString(outlineColor)}</NSColor>
                <NSNumber rvXMLDictionaryKey="RVShapeElementStrokeWidthKey" hint="double">${strokeWidth}</NSNumber>
              </dictionary>
              <NSString rvXMLIvarName="PlainText">${plainTextBase64}</NSString>
              <NSString rvXMLIvarName="RTFData">${rtfBase64}</NSString>
              <NSString rvXMLIvarName="WinFlowData"/>
              <NSString rvXMLIvarName="WinFontData"/>
            </RVTextElement>
          </array>
        </RVDisplaySlide>`;
    });

    xml += `
      </array>
    </RVSlideGrouping>`;
  });

  xml += `
  </array>
</RVPresentationDocument>`;

  return xml;
}
