import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';

export default async function HymnsPage(props: {
  searchParams: Promise<{ page?: string; search?: string; tag?: string }>;
}) {
  const searchParams = await props.searchParams;
  const params = searchParams;
  const page = parseInt(params.page || '1');
  const search = params.search || '';
  const tagSlug = params.tag || '';
  const limit = 30;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { author: { contains: search, mode: 'insensitive' } },
    ];
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
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
      skip,
      take: limit,
    }),
    prisma.hymn.count({ where }),
    tagSlug
      ? prisma.tag.findUnique({ where: { slug: tagSlug } })
      : Promise.resolve(null),
    prisma.tag.findMany({
      orderBy: {
        name: 'asc',
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Hymns2Go
          </Link>
          <nav className="flex gap-6">
            <Link href="/hymns" className="text-gray-900 font-medium">
              Browse Hymns
            </Link>
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title and Search */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {currentTag ? `Hymns: ${currentTag.name}` : 'Browse Hymns'}
          </h1>

          {/* Search Bar */}
          <form method="get" className="flex gap-2 mb-4">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search hymns by title or author..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {tagSlug && <input type="hidden" name="tag" value={tagSlug} />}
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Search
            </button>
            {(search || tagSlug) && (
              <Link
                href="/hymns"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Clear
              </Link>
            )}
          </form>

          <p className="text-gray-600">
            {total} {total === 1 ? 'hymn' : 'hymns'} found
          </p>
        </div>

        {/* Filters - Tags */}
        {allTags.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Filter by Category:
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/hymns?tag=${tag.slug}`}
                  className={`px-3 py-1 rounded-full text-sm ${
                    tagSlug === tag.slug
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Hymns Grid */}
        {hymns.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <p className="text-xl text-gray-600">
              {search || tagSlug
                ? 'No hymns found matching your criteria.'
                : 'No hymns available yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {hymns.map((hymn) => (
              <Link
                key={hymn.id}
                href={`/hymns/${hymn.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 block"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {hymn.title}
                </h3>
                {hymn.author && (
                  <p className="text-gray-600 mb-3">{hymn.author}</p>
                )}
                {hymn.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {hymn.tags.map((ht) => (
                      <span
                        key={ht.tag.id}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {ht.tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/hymns?page=${page - 1}${search ? `&search=${search}` : ''}${tagSlug ? `&tag=${tagSlug}` : ''}`}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/hymns?page=${page + 1}${search ? `&search=${search}` : ''}${tagSlug ? `&tag=${tagSlug}` : ''}`}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
