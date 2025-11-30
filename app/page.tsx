import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import SearchBar from '@/components/public/SearchBar';

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
        totalDownloads: true,
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
        createdAt: true,
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all duration-300">
            Hymns2Go
          </Link>
          <nav className="flex gap-8">
            <Link href="/hymns" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group">
              Browse Hymns
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/admin" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group">
              Admin
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="mb-6 animate-fade-in">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
              ✨ Now with {totalHymns.toLocaleString()} hymns from 9+ hymnals
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
            Hymns for Your
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Church
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Download beautifully formatted hymn lyrics for PowerPoint, ProPresenter, and more — completely free
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-10">
            <SearchBar />
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/hymns"
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
            >
              Browse All Hymns
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
            <a
              href="#features"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-white hover:border-blue-600 hover:text-blue-600 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 text-center border border-gray-100 hover:border-blue-200 hover:-translate-y-1">
            <div className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              {totalHymns.toLocaleString()}
            </div>
            <div className="text-gray-600 font-medium">Hymns Available</div>
          </div>
          <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 text-center border border-gray-100 hover:border-indigo-200 hover:-translate-y-1">
            <div className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">3</div>
            <div className="text-gray-600 font-medium">Export Formats</div>
          </div>
          <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 text-center border border-gray-100 hover:border-purple-200 hover:-translate-y-1">
            <div className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">100%</div>
            <div className="text-gray-600 font-medium">Free to Use</div>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 mb-12 text-center max-w-2xl mx-auto">
            Powerful features designed to make your worship service preparation effortless
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl text-white">📊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                PowerPoint Export
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Download hymns as .pptx files ready to use in Microsoft PowerPoint with perfect formatting
              </p>
            </div>
            <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-indigo-200 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl text-white">🎬</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                ProPresenter Export
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Export to ProPresenter 6 or 7 format for seamless integration with your worship setup
              </p>
            </div>
            <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-purple-200 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl text-white">⚙️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Customizable Format
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Choose how many lines per slide to fit your presentation style and screen size
              </p>
            </div>
            <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-green-200 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl text-white">✨</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Clean Formatting
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Automatically removes punctuation and verse numbers for cleaner, more readable slides
              </p>
            </div>
            <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-orange-200 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl text-white">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Search & Filter
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Find hymns by title, author, or browse by category and tags with lightning-fast search
              </p>
            </div>
            <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-red-200 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl text-white">🔌</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Public API
              </h3>
              <p className="text-gray-600 leading-relaxed">
                RESTful API for developers to integrate with their own tools and workflows
              </p>
            </div>
          </div>
        </div>

        {/* Most Popular Hymns */}
        {mostPopularHymns.length > 0 && mostPopularHymns.some(h => h.totalDownloads > 0) && (
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
              Most Popular Hymns
            </h2>
            <p className="text-xl text-gray-600 mb-10 text-center max-w-2xl mx-auto">
              The hymns most downloaded by our community
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mostPopularHymns.filter(h => h.totalDownloads > 0).map((hymn, index) => (
                <Link
                  key={hymn.id}
                  href={`/hymns/${hymn.id}`}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 block border border-gray-100 hover:border-blue-200 hover:-translate-y-2 relative overflow-hidden"
                >
                  <div className="absolute top-4 right-4 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {index + 1}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300"></div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 pr-12 group-hover:text-blue-600 transition-colors duration-300">
                      {hymn.title}
                    </h3>
                    {hymn.author && (
                      <p className="text-gray-600 mb-4 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        {hymn.author}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold">
                      <span>📥</span>
                      <span>{hymn.totalDownloads.toLocaleString()} downloads</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recently Added Hymns */}
        {recentlyAddedHymns.length > 0 && (
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
              Recently Added
            </h2>
            <p className="text-xl text-gray-600 mb-10 text-center max-w-2xl mx-auto">
              The latest hymns added to our collection
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentlyAddedHymns.map((hymn) => (
                <Link
                  key={hymn.id}
                  href={`/hymns/${hymn.id}`}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 block border border-gray-100 hover:border-green-200 hover:-translate-y-2 relative overflow-hidden"
                >
                  <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg">
                    NEW
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-500/0 group-hover:from-green-500/5 group-hover:to-emerald-500/5 transition-all duration-300"></div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 pr-16 group-hover:text-green-600 transition-colors duration-300">
                      {hymn.title}
                    </h3>
                    {hymn.author && (
                      <p className="text-gray-600 mb-4 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        {hymn.author}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      <span>📅</span>
                      <span>Added {new Date(hymn.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Popular Tags */}
        {popularTags.length > 0 && (
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
              Browse by Category
            </h2>
            <p className="text-xl text-gray-600 mb-10 text-center max-w-2xl mx-auto">
              Explore hymns organized by themes and topics
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {popularTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/hymns?tag=${tag.slug}`}
                  className="group px-6 py-3 bg-white text-gray-700 rounded-full hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg border border-gray-200 hover:border-transparent font-medium transform hover:scale-105"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-3">
                Hymns2Go
              </h3>
              <p className="text-gray-400">
                Making worship preparation easier with free, beautifully formatted hymn downloads.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/hymns" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                    Browse All Hymns
                  </Link>
                </li>
                <li>
                  <a href="#features" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                    Features
                  </a>
                </li>
                <li>
                  <Link href="/admin" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                    Admin
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3">Legal</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Please respect copyright laws when using hymn content. Public domain hymns are clearly marked.
              </p>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 Hymns2Go. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
