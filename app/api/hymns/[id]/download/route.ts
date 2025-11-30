import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import {
  HymnStructure,
  formatAsSlides,
  formatAsPlainText,
  formatAsPerSlideText,
  stripPunctuation,
} from '@/lib/hymn-processor/parser';
import { generatePowerPoint } from '@/lib/file-generators/powerpoint';
import { generateProPresenter } from '@/lib/file-generators/propresenter';
import { generateProPresenter7 } from '@/lib/file-generators/propresenter7';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/hymns/[id]/download?format=pptx&linesPerSlide=2
 * POST /api/hymns/[id]/download - with edited slides in body
 */
async function handleDownloadRequest(
  request: NextRequest,
  id: string,
  editedSlidesData?: { slideIndex: number; lines: string[] }[]
) {
  console.log('=== DOWNLOAD REQUEST RECEIVED ===');
  console.log('Hymn ID:', id);
  console.log('Full URL:', request.url);

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'text';
  const linesPerSlide = parseInt(searchParams.get('linesPerSlide') || '2');
  const proPresenterVersion = parseInt(
    searchParams.get('proPresenterVersion') || '6'
  ) as 6 | 7;
  const includeVerseNumbers = searchParams.get('includeVerseNumbers') === 'true';
  const includeTitleSlide = searchParams.get('includeTitleSlide') !== 'false'; // default true
  const shouldStripPunctuation = searchParams.get('stripPunctuation') === 'true';

  // Formatting options
  const includeFormatting = searchParams.get('includeFormatting') === 'true';
  const backgroundColor = searchParams.get('backgroundColor') || '#000000';
  const textColor = searchParams.get('textColor') || '#FFFFFF';
  const includeShadow = searchParams.get('includeShadow') === 'true';
  const includeOutline = searchParams.get('includeOutline') === 'true';
  const outlineColor = searchParams.get('outlineColor') || '#000000';

  console.log('All query parameters:', {
    format,
    linesPerSlide,
    includeVerseNumbers,
    includeTitleSlide,
    shouldStripPunctuation,
    includeFormatting,
    backgroundColor,
    textColor,
    includeShadow,
    includeOutline,
    outlineColor
  });

  // Helper to convert hex color to RGB (0-1 range for Pro7, 0-255 for Pro6/PPT)
  const hexToRgb = (hex: string) => {
    if (hex === 'transparent') return null;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const bgRgb = hexToRgb(backgroundColor);
  const textRgb = hexToRgb(textColor);
  const outlineRgb = hexToRgb(outlineColor);

  // Fetch hymn
  const hymn = await prisma.hymn.findUnique({
    where: { id },
  });

  if (!hymn) {
    return NextResponse.json({ error: 'Hymn not found' }, { status: 404 });
  }

  // Get structure and create slides
  const structure = hymn.structure as unknown as HymnStructure;
  let slides = formatAsSlides(structure, linesPerSlide);

  // Apply edited slides if provided
  if (editedSlidesData && editedSlidesData.length > 0) {
    const editedSlidesMap = new Map(
      editedSlidesData.map(edit => [edit.slideIndex, edit.lines])
    );

    slides = slides.map((slide, index) => {
      const editedLines = editedSlidesMap.get(index);
      if (editedLines) {
        return {
          ...slide,
          lines: editedLines
        };
      }
      return slide;
    });
  }

  // Apply punctuation stripping if requested
  if (shouldStripPunctuation) {
    slides = slides.map(slide => ({
      ...slide,
      lines: slide.lines.map(line => stripPunctuation(line))
    }));
  }

    // Track download asynchronously (don't wait for it to complete)
    const trackDownload = async () => {
      try {
        const updateData: any = {
          totalDownloads: { increment: 1 },
        };

        // Track specific format
        switch (format) {
          case 'pptx':
            updateData.powerPointDownloads = { increment: 1 };
            break;
          case 'propresenter6':
            updateData.proPresenter6Downloads = { increment: 1 };
            break;
          case 'propresenter7':
            updateData.proPresenter7Downloads = { increment: 1 };
            break;
          case 'text':
            updateData.textDownloads = { increment: 1 };
            break;
          case 'text-per-slide':
            updateData.textBySlideDownloads = { increment: 1 };
            break;
          case 'propresenter':
            // Legacy format - count as ProPresenter 6 or 7 based on version
            if (proPresenterVersion === 7) {
              updateData.proPresenter7Downloads = { increment: 1 };
            } else {
              updateData.proPresenter6Downloads = { increment: 1 };
            }
            break;
        }

        await prisma.hymn.update({
          where: { id },
          data: updateData,
        });
      } catch (error) {
        console.error('Failed to track download:', error);
        // Don't throw - tracking failure shouldn't prevent download
      }
    };

    // Start tracking (don't await)
    trackDownload();

    // Helper function to create safe filename
    const createFilename = (title: string, extension: string): string => {
      // Replace special characters with spaces, then collapse multiple spaces
      const safeName = title
        .replace(/[^a-z0-9\s]/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return `${safeName}.${extension}`;
    };

    // Generate file based on format
    switch (format) {
      case 'pptx': {
        const buffer = await generatePowerPoint(slides, hymn.title, {
          includeTitleSlide,
          includeVerseNumbers,
          ...(includeFormatting && {
            backgroundColor: backgroundColor === 'transparent' ? 'FFFFFF' : backgroundColor.replace('#', ''),
            textColor: textColor.replace('#', ''),
            includeShadow,
            includeOutline,
            outlineColor: outlineColor.replace('#', '')
          })
        });

        return new NextResponse(buffer as any, {
          headers: {
            'Content-Type':
              'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'Content-Disposition': `attachment; filename="${createFilename(hymn.title, 'pptx')}"`,
          },
        });
      }

      case 'propresenter6': {
        const xml = generateProPresenter(slides, hymn.title, {
          version: 6,
          includeTitleSlide,
          includeVerseNumbers,
          author: hymn.author || undefined,
          publisher: hymn.publisher || undefined,
          ccliNumber: hymn.ccliNumber || undefined,
          copyrightYear: hymn.year || undefined,
          ...(includeFormatting && bgRgb && textRgb && outlineRgb && {
            backgroundColor: bgRgb,
            textColor: textRgb,
            includeShadow,
            includeOutline,
            outlineColor: outlineRgb
          })
        });

        return new NextResponse(xml, {
          headers: {
            'Content-Type': 'application/xml',
            'Content-Disposition': `attachment; filename="${createFilename(hymn.title, 'pro6')}"`,
          },
        });
      }

      case 'propresenter7': {
        // Generate native ProPresenter 7 Protocol Buffer binary format
        console.log('ProPresenter 7 Download:', {
          includeFormatting,
          backgroundColor,
          textColor,
          includeShadow,
          includeOutline,
          outlineColor,
          bgRgb,
          textRgb,
          outlineRgb
        });

        const buffer = await generateProPresenter7(slides, hymn.title, {
          includeTitleSlide,
          includeVerseNumbers,
          author: hymn.author || undefined,
          publisher: hymn.publisher || undefined,
          ccliNumber: hymn.ccliNumber || undefined,
          copyrightYear: hymn.year || undefined,
          ...(includeFormatting && bgRgb && textRgb && outlineRgb && {
            backgroundColor: { r: bgRgb.r / 255, g: bgRgb.g / 255, b: bgRgb.b / 255, a: 1 },
            textColor: { r: textRgb.r / 255, g: textRgb.g / 255, b: textRgb.b / 255, a: 1 },
            includeShadow,
            includeOutline,
            outlineColor: { r: outlineRgb.r / 255, g: outlineRgb.g / 255, b: outlineRgb.b / 255, a: 1 }
          })
        });

        return new NextResponse(buffer as any, {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${createFilename(hymn.title, 'pro')}"`,
          },
        });
      }

      // Legacy support - defaults to Pro6
      case 'propresenter': {
        const xml = generateProPresenter(slides, hymn.title, {
          version: proPresenterVersion,
          includeTitleSlide,
          includeVerseNumbers,
          author: hymn.author || undefined,
          publisher: hymn.publisher || undefined,
          ccliNumber: hymn.ccliNumber || undefined,
          copyrightYear: hymn.year || undefined,
          ...(includeFormatting && bgRgb && textRgb && outlineRgb && {
            backgroundColor: bgRgb,
            textColor: textRgb,
            includeShadow,
            includeOutline,
            outlineColor: outlineRgb
          })
        });

        const extension = proPresenterVersion === 7 ? 'pro' : 'pro6';

        return new NextResponse(xml, {
          headers: {
            'Content-Type': 'application/xml',
            'Content-Disposition': `attachment; filename="${createFilename(hymn.title, extension)}"`,
          },
        });
      }

      case 'text': {
        const text = formatAsPlainText(slides, {
          includeTitle: includeTitleSlide,
          title: hymn.title,
          includeVerseNumbers
        });

        return new NextResponse(text, {
          headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': `attachment; filename="${createFilename(hymn.title, 'txt')}"`,
          },
        });
      }

      case 'text-per-slide': {
        const text = formatAsPerSlideText(slides, {
          includeTitle: includeTitleSlide,
          title: hymn.title,
          includeVerseNumbers
        });

        return new NextResponse(text, {
          headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': `attachment; filename="${createFilename(hymn.title + ' slides', 'txt')}"`,
          },
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid format. Use: pptx, propresenter6, propresenter7, text, or text-per-slide' },
          { status: 400 }
        );
    }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await handleDownloadRequest(request, id);
  } catch (error) {
    console.error('Error generating download:', error);
    return NextResponse.json(
      { error: 'Failed to generate download' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const editedSlides = body.editedSlides as { slideIndex: number; lines: string[] }[] | undefined;

    return await handleDownloadRequest(request, id, editedSlides);
  } catch (error) {
    console.error('Error generating download:', error);
    return NextResponse.json(
      { error: 'Failed to generate download' },
      { status: 500 }
    );
  }
}
