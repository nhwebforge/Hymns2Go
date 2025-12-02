import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { IconArrowLeft, IconSearch, IconFilter } from '@tabler/icons-react';
import SearchBar from '@/components/public/SearchBar';
import InfiniteHymnList from '@/components/public/InfiniteHymnList';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ExperimentalHymnsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const searchQuery = typeof params.search === 'string' ? params.search : '';
  const tagSlug = typeof params.tag === 'string' ? params.tag : undefined;

  // Get initial hymns
  const initialHymns = await prisma.hymn.findMany({
    take: 20,
    orderBy: { catalogueTitleLower: 'asc' },
    where: tagSlug
      ? {
          tags: {
            some: {
              tag: {
                slug: tagSlug,
              },
            },
          },
        }
      : searchQuery
      ? {
          OR: [
            { catalogueTitleLower: { contains: searchQuery.toLowerCase() } },
            { firstLine: { contains: searchQuery, mode: 'insensitive' } },
            { author: { contains: searchQuery, mode: 'insensitive' } },
          ],
        }
      : undefined,
    select: {
      id: true,
      title: true,
      catalogueTitle: true,
      author: true,
      firstLine: true,
    },
  });

  const totalCount = await prisma.hymn.count({
    where: tagSlug
      ? {
          tags: {
            some: {
              tag: {
                slug: tagSlug,
              },
            },
          },
        }
      : searchQuery
      ? {
          OR: [
            { catalogueTitleLower: { contains: searchQuery.toLowerCase() } },
            { firstLine: { contains: searchQuery, mode: 'insensitive' } },
            { author: { contains: searchQuery, mode: 'insensitive' } },
          ],
        }
      : undefined,
  });

  // Get tag name if filtering by tag
  const selectedTag = tagSlug
    ? await prisma.tag.findUnique({
        where: { slug: tagSlug },
        select: { name: true },
      })
    : null;

  // Get all tags for filter
  const allTags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Gradient Background Orbs */}
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-violet-500/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Floating Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-8 py-3 flex items-center gap-8">
        <Link href="/experimental" className="text-sm font-medium hover:text-violet-400 transition-colors">Home</Link>
        <Link href="/experimental/hymns" className="text-sm font-medium text-violet-400">Browse</Link>
        <Link href="/admin" className="text-sm font-medium hover:text-violet-400 transition-colors">Admin</Link>
      </nav>

      {/* Header */}
      <div className="relative pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Link */}
          <Link
            href="/experimental"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
          >
            <IconArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          {/* Title Section */}
          <div className="mb-12">
            {selectedTag && (
              <div className="inline-block bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-6">
                Category: {selectedTag.name}
              </div>
            )}
            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
              {selectedTag ? selectedTag.name : searchQuery ? 'Search Results' : 'All Hymns'}
            </h1>
            <p className="text-xl text-gray-400">
              {totalCount.toLocaleString()} {totalCount === 1 ? 'hymn' : 'hymns'} {searchQuery && `matching "${searchQuery}"`}
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-12">
            {/* Search */}
            <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <IconSearch size={20} stroke={2.5} />
                </div>
                <h3 className="text-lg font-bold">Search Hymns</h3>
              </div>
              <SearchBar />
            </div>

            {/* Filter Tags */}
            <div className="lg:w-80 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <IconFilter size={20} stroke={2.5} />
                </div>
                <h3 className="text-lg font-bold">Filter by Category</h3>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <Link
                  href="/experimental/hymns"
                  className={`block px-4 py-2 rounded-lg transition-all ${
                    !tagSlug
                      ? 'bg-violet-500/20 text-white border border-violet-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  All Hymns
                </Link>
                {allTags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/experimental/hymns?tag=${tag.slug}`}
                    className={`block px-4 py-2 rounded-lg transition-all ${
                      tagSlug === tag.slug
                        ? 'bg-violet-500/20 text-white border border-violet-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hymn List */}
      <div className="relative pb-32">
        <div className="max-w-7xl mx-auto px-6">
          {initialHymns.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <IconSearch size={32} className="text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3">No hymns found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery
                  ? `No results for "${searchQuery}". Try a different search term.`
                  : 'No hymns in this category.'}
              </p>
              <Link
                href="/experimental/hymns"
                className="inline-block bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
              >
                View All Hymns
              </Link>
            </div>
          ) : (
            <InfiniteHymnList
              initialHymns={initialHymns}
              searchQuery={searchQuery}
              tagSlug={tagSlug}
              totalCount={totalCount}
              hasMore={totalCount > initialHymns.length}
              experimentalMode={true}
            />
          )}
        </div>
      </div>

      {/* Footer - Minimal */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">&copy; 2025 Hymns2Go. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
