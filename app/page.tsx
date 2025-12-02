import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/db/prisma';
import SearchBar from '@/components/public/SearchBar';
import { IconSettings, IconSearch, IconSparkles, IconApi } from '@tabler/icons-react';

export default async function Home() {
  const [totalHymns, popularTags, mostPopularHymns, recentlyAddedHymns] = await Promise.all([
    prisma.hymn.count(),
    prisma.tag.findMany({
      take: 10,
      orderBy: {
        hymns: {
          _count: 'desc',
        },
      },
    }),
    prisma.hymn.findMany({
      take: 6,
      orderBy: {
        totalDownloads: 'desc',
      },
      select: {
        id: true,
        title: true,
        author: true,
      },
    }),
    prisma.hymn.findMany({
      take: 6,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        author: true,
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/" className="text-2xl sm:text-3xl font-bold text-stone-800 hover:text-amber-700 transition-colors">
            Hymns2Go
          </Link>
          <nav className="flex gap-4 sm:gap-8">
            <Link href="/hymns" className="text-stone-700 hover:text-amber-700 font-medium transition-colors">
              Browse Hymns
            </Link>
            <Link href="/admin" className="text-stone-700 hover:text-amber-700 font-medium transition-colors">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded text-sm font-medium mb-6">
              {totalHymns.toLocaleString()} hymns from the world's most popular hymnals
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-stone-900 mb-6 leading-tight">
            Hymns for Your Church
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-stone-600 mb-8 sm:mb-10 max-w-3xl mx-auto px-4">
            Download beautifully formatted hymn lyrics for PowerPoint, ProPresenter, and more — completely free
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-8 sm:mb-10">
            <SearchBar />
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <Link
              href="/hymns"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-amber-700 text-white rounded-lg font-semibold hover:bg-amber-800 transition-colors"
            >
              Browse All Hymns
            </Link>
            <a
              href="#features"
              className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-stone-300 text-stone-700 rounded-lg font-semibold hover:bg-white hover:border-amber-700 hover:text-amber-700 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 lg:mb-20">
          <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center border border-stone-200">
            <div className="text-4xl sm:text-5xl font-bold text-amber-700 mb-2">
              {totalHymns.toLocaleString()}
            </div>
            <div className="text-stone-600 font-medium">Hymns Available</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center border border-stone-200">
            <div className="text-4xl sm:text-5xl font-bold text-amber-700 mb-2">3</div>
            <div className="text-stone-600 font-medium">Export Formats</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center border border-stone-200">
            <div className="text-4xl sm:text-5xl font-bold text-amber-700 mb-2">100%</div>
            <div className="text-stone-600 font-medium">Free to Use</div>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-3 sm:mb-4 text-center px-4">
            Everything You Need
          </h2>
          <p className="text-lg sm:text-xl text-stone-600 mb-8 sm:mb-12 text-center max-w-2xl mx-auto px-4">
            Powerful features designed to make your worship service preparation effortless
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="bg-white rounded-lg shadow p-6 sm:p-8 border border-stone-200">
              <div className="mb-4 sm:mb-5">
                <Image
                  src="/icons/ppt.png"
                  alt="PowerPoint"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-stone-900 mb-2 sm:mb-3">
                PowerPoint Export
              </h3>
              <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
                Download hymns as .pptx files ready to use in Microsoft PowerPoint with perfect formatting
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 sm:p-8 border border-stone-200">
              <div className="mb-4 sm:mb-5">
                <Image
                  src="/icons/pro7.png"
                  alt="ProPresenter 7"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-stone-900 mb-2 sm:mb-3">
                ProPresenter Export
              </h3>
              <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
                Export to ProPresenter 6 or 7 format for seamless integration with your worship setup
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 sm:p-8 border border-stone-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-700 rounded-lg flex items-center justify-center mb-4 sm:mb-5">
                <IconSettings size={24} className="text-white" stroke={2} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-stone-900 mb-2 sm:mb-3">
                Customizable Format
              </h3>
              <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
                Choose how many lines per slide to fit your presentation style and screen size
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 sm:p-8 border border-stone-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-700 rounded-lg flex items-center justify-center mb-4 sm:mb-5">
                <IconSparkles size={24} className="text-white" stroke={2} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-stone-900 mb-2 sm:mb-3">
                Clean Formatting
              </h3>
              <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
                Automatically removes punctuation and verse numbers for cleaner, more readable slides
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 sm:p-8 border border-stone-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-700 rounded-lg flex items-center justify-center mb-4 sm:mb-5">
                <IconSearch size={24} className="text-white" stroke={2} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-stone-900 mb-2 sm:mb-3">
                Search & Filter
              </h3>
              <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
                Find hymns by title, author, or browse by category and tags with lightning-fast search
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 sm:p-8 border border-stone-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-700 rounded-lg flex items-center justify-center mb-4 sm:mb-5">
                <IconApi size={24} className="text-white" stroke={2} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-stone-900 mb-2 sm:mb-3">
                Public API
              </h3>
              <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
                RESTful API for developers to integrate with their own tools and workflows
              </p>
            </div>
          </div>
        </div>

        {/* Most Popular Hymns */}
        {mostPopularHymns.length > 0 && (
          <div className="mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-3 sm:mb-4 text-center px-4">
              Most Popular Hymns
            </h2>
            <p className="text-lg sm:text-xl text-stone-600 mb-8 sm:mb-10 text-center max-w-2xl mx-auto px-4">
              The hymns most downloaded by our community
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {mostPopularHymns.map((hymn, index) => (
                <Link
                  key={hymn.id}
                  href={`/hymns/${hymn.id}`}
                  className="bg-white rounded-lg shadow p-6 sm:p-8 block border border-stone-200 hover:border-amber-700 transition-colors relative"
                >
                  <div className="absolute top-4 right-4 w-8 h-8 sm:w-10 sm:h-10 bg-amber-700 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-stone-900 mb-2 sm:mb-3 pr-12">
                      {hymn.title}
                    </h3>
                    {hymn.author && (
                      <p className="text-stone-600 font-medium flex items-center gap-2 text-sm sm:text-base">
                        <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
                        {hymn.author}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recently Added Hymns */}
        {recentlyAddedHymns.length > 0 && (
          <div className="mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-3 sm:mb-4 text-center px-4">
              Recently Added
            </h2>
            <p className="text-lg sm:text-xl text-stone-600 mb-8 sm:mb-10 text-center max-w-2xl mx-auto px-4">
              The latest hymns added to our collection
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recentlyAddedHymns.map((hymn) => (
                <Link
                  key={hymn.id}
                  href={`/hymns/${hymn.id}`}
                  className="bg-white rounded-lg shadow p-6 sm:p-8 block border border-stone-200 hover:border-amber-700 transition-colors relative"
                >
                  <div className="absolute top-4 right-4 px-2 sm:px-3 py-1 bg-amber-700 text-white text-xs font-bold rounded">
                    NEW
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-stone-900 mb-2 sm:mb-3 pr-16">
                      {hymn.title}
                    </h3>
                    {hymn.author && (
                      <p className="text-stone-600 font-medium flex items-center gap-2 text-sm sm:text-base">
                        <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
                        {hymn.author}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Popular Tags */}
        {popularTags.length > 0 && (
          <div className="mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-3 sm:mb-4 text-center px-4">
              Browse by Category
            </h2>
            <p className="text-lg sm:text-xl text-stone-600 mb-8 sm:mb-10 text-center max-w-2xl mx-auto px-4">
              Explore hymns organized by themes and topics
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-4">
              {popularTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/hymns?tag=${tag.slug}`}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-stone-700 rounded-full hover:bg-amber-700 hover:text-white transition-colors shadow-sm border border-stone-200 hover:border-amber-700 font-medium text-sm sm:text-base"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-800 text-white py-8 sm:py-12 border-t border-stone-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-amber-500 mb-2 sm:mb-3">
                Hymns2Go
              </h3>
              <p className="text-stone-300 text-sm sm:text-base">
                Making worship preparation easier with free, beautifully formatted hymn downloads.
              </p>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Quick Links</h4>
              <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
                <li>
                  <Link href="/hymns" className="text-stone-300 hover:text-amber-500 transition-colors">
                    Browse All Hymns
                  </Link>
                </li>
                <li>
                  <a href="#features" className="text-stone-300 hover:text-amber-500 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <Link href="/admin" className="text-stone-300 hover:text-amber-500 transition-colors">
                    Admin
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Legal</h4>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                Please respect copyright laws when using hymn content. Public domain hymns are clearly marked.
              </p>
            </div>
          </div>
          <div className="pt-6 sm:pt-8 border-t border-stone-700 text-center text-stone-400 text-sm">
            <p>&copy; 2025 Hymns2Go. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
