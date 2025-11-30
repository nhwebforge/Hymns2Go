import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/db/prisma';
import { parseHymnText } from '@/lib/hymn-processor/parser';
import { z } from 'zod';

// Schema for creating/updating hymns
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
 * GET /api/hymns - List all hymns with optional search
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');
    const startsWith = searchParams.get('startsWith'); // New parameter for alphabet nav
    const before = searchParams.get('before'); // For bidirectional scroll - get hymns before this title
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startsWith) {
      // Filter by catalogueTitleLower starting with the letter
      where.catalogueTitleLower = {
        startsWith: startsWith.toLowerCase(),
      };
    }

    if (before) {
      // Get hymns that come alphabetically before this title
      where.catalogueTitleLower = {
        lt: before.toLowerCase(),
      };
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: tag,
          },
        },
      };
    }

    const [hymns, total] = await Promise.all([
      prisma.hymn.findMany({
        where,
        select: {
          id: true,
          title: true,
          catalogueTitle: true,
          author: true,
          tags: {
            select: {
              tag: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          catalogueTitleLower: before ? 'desc' : 'asc', // Reverse order when fetching previous hymns
        },
        skip: before ? 0 : skip, // Don't skip when using cursor-based 'before'
        take: limit,
      }),
      prisma.hymn.count({ where }),
    ]);

    // If fetching previous hymns (before), reverse the results to maintain alphabetical order
    const orderedHymns = before ? hymns.reverse() : hymns;

    return NextResponse.json({
      hymns: orderedHymns,
      hasMore: before ? false : skip + hymns.length < total,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching hymns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hymns' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hymns - Create new hymn (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Create the hymn
    const hymn = await prisma.hymn.create({
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
      hymn: {
        ...hymn,
        tags: hymn.tags.map((ht) => ht.tag),
      },
    });
  } catch (error) {
    console.error('Error creating hymn:', error);
    return NextResponse.json(
      { error: 'Failed to create hymn' },
      { status: 500 }
    );
  }
}
