import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';
import { parseHymnText } from '@/lib/hymn-processor/parser';
import { z } from 'zod';

const hymnSchema = z.object({
  title: z.string().min(1),
  author: z.string().optional(),
  year: z.number().optional(),
  rawText: z.string().min(1),
  isPublicDomain: z.boolean().default(false),
  publisher: z.string().optional(),
  ccliNumber: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * GET /api/hymns/[id] - Get single hymn
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const hymn = await prisma.hymn.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!hymn) {
      return NextResponse.json({ error: 'Hymn not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...hymn,
      tags: hymn.tags.map((ht) => ht.tag),
    });
  } catch (error) {
    console.error('Error fetching hymn:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hymn' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/hymns/[id] - Update hymn (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = hymnSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error },
        { status: 400 }
      );
    }

    const { tags, ...hymnData } = parsed.data;

    // Parse the hymn text into structure
    const structure = parseHymnText(hymnData.rawText);

    // Delete existing tags
    await prisma.hymnTag.deleteMany({
      where: { hymnId: id },
    });

    // Update the hymn
    const hymn = await prisma.hymn.update({
      where: { id },
      data: {
        ...hymnData,
        structure: structure as any,
        tags: tags
          ? {
              create: await Promise.all(
                tags.map(async (tagName) => {
                  const slug = tagName.toLowerCase().replace(/\s+/g, '-');
                  let tag = await prisma.tag.findUnique({
                    where: { slug },
                  });

                  if (!tag) {
                    tag = await prisma.tag.create({
                      data: { name: tagName, slug },
                    });
                  }

                  return { tagId: tag.id };
                })
              ),
            }
          : undefined,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...hymn,
      tags: hymn.tags.map((ht) => ht.tag),
    });
  } catch (error) {
    console.error('Error updating hymn:', error);
    return NextResponse.json(
      { error: 'Failed to update hymn' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/hymns/[id] - Delete hymn (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.hymn.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting hymn:', error);
    return NextResponse.json(
      { error: 'Failed to delete hymn' },
      { status: 500 }
    );
  }
}
