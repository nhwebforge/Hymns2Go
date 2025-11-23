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

/**
 * GET /api/hymns/[id]/download?format=pptx&linesPerSlide=2
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'text';
    const linesPerSlide = parseInt(searchParams.get('linesPerSlide') || '2');
    const proPresenterVersion = parseInt(
      searchParams.get('proPresenterVersion') || '6'
    ) as 6 | 7;
    const includeVerseNumbers = searchParams.get('includeVerseNumbers') === 'true';
    const includeTitleSlide = searchParams.get('includeTitleSlide') !== 'false'; // default true
    const shouldStripPunctuation = searchParams.get('stripPunctuation') === 'true';

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

    // Apply punctuation stripping if requested
    if (shouldStripPunctuation) {
      slides = slides.map(slide => ({
        ...slide,
        lines: slide.lines.map(line => stripPunctuation(line))
      }));
    }

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
          includeVerseNumbers
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
        const buffer = await generateProPresenter7(slides, hymn.title, {
          includeTitleSlide,
          includeVerseNumbers,
          author: hymn.author || undefined,
          publisher: hymn.publisher || undefined,
          ccliNumber: hymn.ccliNumber || undefined,
          copyrightYear: hymn.year || undefined,
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
  } catch (error) {
    console.error('Error generating download:', error);
    return NextResponse.json(
      { error: 'Failed to generate download' },
      { status: 500 }
    );
  }
}
