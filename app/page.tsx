import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import SearchBar from '@/components/public/SearchBar';

export default async function Home() {
  const [totalHymns, popularTags] = await Promise.all([
    prisma.hymn.count(),
    prisma.tag.findMany({
      take: 10,
      orderBy: {
        hymns: {
          _count: 'desc',
        },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Hymns2Go
          </Link>
          <nav className="flex gap-6">
            <Link href="/hymns" className="text-gray-600 hover:text-gray-900">
              Browse Hymns
            </Link>
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Hymns for Your Church
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Download hymn lyrics formatted for PowerPoint, ProPresenter, and more
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar />
          </div>

          <div className="flex justify-center gap-4">
            <Link
              href="/hymns"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Browse All Hymns
            </Link>
            <a
              href="#features"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {totalHymns}
            </div>
            <div className="text-gray-600">Hymns Available</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">3</div>
            <div className="text-gray-600">Export Formats</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
            <div className="text-gray-600">Free to Use</div>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                PowerPoint Export
              </h3>
              <p className="text-gray-600">
                Download hymns as .pptx files ready to use in Microsoft
                PowerPoint
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                ProPresenter Export
              </h3>
              <p className="text-gray-600">
                Export to ProPresenter 6 or 7 format for seamless integration
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Customizable Format
              </h3>
              <p className="text-gray-600">
                Choose how many lines per slide to fit your presentation style
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Clean Formatting
              </h3>
              <p className="text-gray-600">
                Automatically removes punctuation and verse numbers for cleaner
                slides
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Search & Filter
              </h3>
              <p className="text-gray-600">
                Find hymns by title, author, or browse by category and tags
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Public API
              </h3>
              <p className="text-gray-600">
                RESTful API for developers to integrate with their own tools
              </p>
            </div>
          </div>
        </div>

        {/* Popular Tags */}
        {popularTags.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Browse by Category
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {popularTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/hymns?tag=${tag.slug}`}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Hymns2Go. All rights reserved.</p>
          <p className="text-gray-400 mt-2">
            Please respect copyright laws when using hymn content.
          </p>
        </div>
      </footer>
    </div>
  );
}
