import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import {
  HymnStructure,
  formatAsSlides,
  formatAsPlainText,
  formatAsPerSlideText,
} from '@/lib/hymn-processor/parser';
import { generatePowerPoint } from '@/lib/file-generators/powerpoint';
import { generateProPresenter } from '@/lib/file-generators/propresenter';

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

    // Fetch hymn
    const hymn = await prisma.hymn.findUnique({
      where: { id },
    });

    if (!hymn) {
      return NextResponse.json({ error: 'Hymn not found' }, { status: 404 });
    }

    // Get structure and create slides
    const structure = hymn.structure as HymnStructure;
    const slides = formatAsSlides(structure, linesPerSlide);

    // Generate file based on format
    switch (format) {
      case 'pptx': {
        const buffer = await generatePowerPoint(slides, hymn.title);

        return new NextResponse(buffer, {
          headers: {
            'Content-Type':
              'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'Content-Disposition': `attachment; filename="${hymn.title.replace(/[^a-z0-9]/gi, '_')}.pptx"`,
          },
        });
      }

      case 'propresenter': {
        const xml = generateProPresenter(slides, hymn.title, {
          version: proPresenterVersion,
        });

        const extension = proPresenterVersion === 7 ? 'pro' : 'pro6';

        return new NextResponse(xml, {
          headers: {
            'Content-Type': 'application/xml',
            'Content-Disposition': `attachment; filename="${hymn.title.replace(/[^a-z0-9]/gi, '_')}.${extension}"`,
          },
        });
      }

      case 'text': {
        const text = formatAsPlainText(slides);

        return new NextResponse(text, {
          headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': `attachment; filename="${hymn.title.replace(/[^a-z0-9]/gi, '_')}.txt"`,
          },
        });
      }

      case 'text-per-slide': {
        const text = formatAsPerSlideText(slides);

        return new NextResponse(text, {
          headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': `attachment; filename="${hymn.title.replace(/[^a-z0-9]/gi, '_')}_slides.txt"`,
          },
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid format. Use: pptx, propresenter, text, or text-per-slide' },
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
