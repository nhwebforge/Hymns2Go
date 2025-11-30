import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import InfiniteHymnList from '@/components/public/InfiniteHymnList';
import AlphabetNav from '@/components/public/AlphabetNav';

export default async function HymnsPage(props: {
  searchParams: Promise<{ search?: string; tag?: string; startsWith?: string }>;
}) {
  const searchParams = await props.searchParams;
  const params = searchParams;
  const search = params.search || '';
  const tagSlug = params.tag || '';
  const startsWith = params.startsWith || '';
  const limit = 30;

  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { author: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (startsWith) {
    where.catalogueTitleLower = {
      startsWith: startsWith.toLowerCase(),
    };
  }

  if (tagSlug) {
    where.tags = {
      some: {
        tag: {
          slug: tagSlug,
        },
      },
    };
  }

  const [hymns, total, currentTag, allTags] = await Promise.all([
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
        catalogueTitleLower: 'asc',
      },
      take: limit,
    }),
    prisma.hymn.count({ where }),
    tagSlug
      ? prisma.tag.findUnique({ where: { slug: tagSlug } })
      : Promise.resolve(null),
    prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ]);

  const hasMore = hymns.length >= limit;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all duration-300">
            Hymns2Go
          </Link>
          <nav className="flex gap-8">
            <Link href="/hymns" className="text-blue-600 font-semibold relative group">
              Browse Hymns
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
            </Link>
            <Link href="/admin" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group">
              Admin
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title and Search */}
        <div className="mb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
            {currentTag ? (
              <>
                <span className="block text-gray-600 text-3xl font-medium mb-2">Category:</span>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {currentTag.name}
                </span>
              </>
            ) : (
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Browse Hymns
              </span>
            )}
          </h1>

          {/* Search Bar */}
          <form method="get" className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative group">
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search hymns by title or author..."
                className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md bg-white"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            {tagSlug && <input type="hidden" name="tag" value={tagSlug} />}
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Search
            </button>
            {(search || tagSlug) && (
              <Link
                href="/hymns"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-white hover:border-blue-600 hover:text-blue-600 transition-all duration-300 shadow-sm hover:shadow-md text-center"
              >
                Clear
              </Link>
            )}
          </form>

          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></span>
            <p className="text-gray-700 font-medium">
              {total.toLocaleString()} {total === 1 ? 'hymn' : 'hymns'} found
            </p>
          </div>
        </div>

        {/* Filters - Tags */}
        {allTags.length > 0 && (
          <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></span>
              Filter by Category
            </h3>
            <div className="flex flex-wrap gap-3">
              {allTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/hymns?tag=${tag.slug}`}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 ${
                    tagSlug === tag.slug
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white border border-gray-200 hover:border-transparent'
                  }`}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Alphabet Navigation - Only show when no search/filter */}
        {!search && !tagSlug && <AlphabetNav />}

        {/* Hymns Grid with Infinite Scroll */}
        {hymns.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <p className="text-xl text-gray-600">
              {search || tagSlug
                ? 'No hymns found matching your criteria.'
                : 'No hymns available yet.'}
            </p>
          </div>
        ) : (
          <InfiniteHymnList
            initialHymns={hymns}
            search={search}
            tagSlug={tagSlug}
            startsWith={startsWith}
            hasMore={hasMore}
          />
        )}
      </main>
    </div>
  );
}
