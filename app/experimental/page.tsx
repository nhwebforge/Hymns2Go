import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/db/prisma';
import SearchBar from '@/components/public/SearchBar';
import { IconSettings, IconSearch, IconSparkles, IconApi, IconArrowRight, IconDownload, IconMusic } from '@tabler/icons-react';

export default async function ExperimentalHome() {
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
    <div className="min-h-screen bg-black text-white">
      {/* Floating Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-8 py-3 flex items-center gap-8">
        <Link href="/" className="text-sm font-medium hover:text-violet-400 transition-colors">Home</Link>
        <Link href="/hymns" className="text-sm font-medium hover:text-violet-400 transition-colors">Browse</Link>
        <Link href="/admin" className="text-sm font-medium hover:text-violet-400 transition-colors">Admin</Link>
      </nav>

      {/* Hero - Asymmetric Split */}
      <div className="relative min-h-screen flex items-center">
        {/* Gradient Background Orbs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-violet-500/20 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[150px]"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Hero Text */}
          <div>
            <div className="inline-block mb-6 bg-gradient-to-r from-violet-500 to-cyan-500 text-black text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
              {totalHymns.toLocaleString()} Hymns Available
            </div>

            <h1 className="text-7xl md:text-8xl font-black mb-6 leading-none">
              Hymns<br/>
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-10 max-w-xl leading-relaxed">
              Modern presentation tools for timeless worship. Download hymns formatted for PowerPoint, ProPresenter, or plain text.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/hymns"
                className="group bg-white text-black px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 hover:bg-gray-100 transition-all"
              >
                Explore Collection
                <IconArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="bg-white/5 backdrop-blur border border-white/10 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Right - Floating Search Card */}
          <div className="relative">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <IconSearch size={24} stroke={2.5} />
                </div>
                <h3 className="text-2xl font-bold">Quick Search</h3>
              </div>
              <SearchBar />
              <p className="text-sm text-gray-400 mt-4">
                Search by title, author, first line, or browse categories
              </p>
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-8 -right-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl p-6 shadow-2xl">
              <div className="text-4xl font-black">{totalHymns.toLocaleString()}</div>
              <div className="text-sm font-medium">Sacred Hymns</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar - Horizontal Scroll */}
      <div className="relative py-20 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <IconMusic size={32} stroke={1.5} />, number: totalHymns.toLocaleString(), label: 'Hymns', desc: 'Carefully curated collection' },
              { icon: <IconDownload size={32} stroke={1.5} />, number: '3', label: 'Formats', desc: 'PowerPoint, ProPresenter, Text' },
              { icon: <IconSparkles size={32} stroke={1.5} />, number: '100%', label: 'Free', desc: 'No fees or subscriptions' }
            ].map((stat, i) => (
              <div key={i} className="group">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-5xl font-black mb-1">{stat.number}</div>
                    <div className="text-lg font-bold text-gray-400">{stat.label}</div>
                    <div className="text-sm text-gray-500">{stat.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features - Bento Grid */}
      <div id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <div className="inline-block bg-white/5 backdrop-blur border border-white/10 px-4 py-2 rounded-full text-sm font-medium mb-6">
              Features
            </div>
            <h2 className="text-6xl font-black max-w-3xl">
              Everything you need for modern worship
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* PowerPoint - Large */}
            <div className="md:col-span-2 bg-gradient-to-br from-[#AA0D20]/20 to-[#AA0D20]/5 border border-white/10 rounded-3xl p-10 hover:border-white/20 transition-all group">
              <Image src="/icons/ppt.png" alt="PowerPoint" width={64} height={64} className="mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-3xl font-bold mb-3">PowerPoint Export</h3>
              <p className="text-gray-400 text-lg">Download hymns as .pptx files with customizable formatting, fonts, and colors</p>
            </div>

            {/* ProPresenter - Medium */}
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-white/10 rounded-3xl p-10 hover:border-white/20 transition-all group">
              <Image src="/icons/pro7.png" alt="ProPresenter" width={64} height={64} className="mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-3">ProPresenter</h3>
              <p className="text-gray-400">Native Pro6 & Pro7 format support</p>
            </div>

            {/* Customizable - Medium */}
            <div className="bg-gradient-to-br from-violet-500/20 to-violet-500/5 border border-white/10 rounded-3xl p-10 hover:border-white/20 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <IconSettings size={32} stroke={2} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Customizable</h3>
              <p className="text-gray-400">Adjust lines, fonts, colors, and formatting</p>
            </div>

            {/* Search - Large */}
            <div className="md:col-span-2 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-white/10 rounded-3xl p-10 hover:border-white/20 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <IconSearch size={32} stroke={2} />
              </div>
              <h3 className="text-3xl font-bold mb-3">Advanced Search</h3>
              <p className="text-gray-400 text-lg">Find hymns by title, author, first line, or browse by category with lightning-fast search</p>
            </div>

            {/* Clean Formatting */}
            <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-white/10 rounded-3xl p-10 hover:border-white/20 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <IconSparkles size={32} stroke={2} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Clean Format</h3>
              <p className="text-gray-400">Auto-remove punctuation and verse numbers</p>
            </div>

            {/* API */}
            <div className="md:col-span-2 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-white/10 rounded-3xl p-10 hover:border-white/20 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <IconApi size={32} stroke={2} />
              </div>
              <h3 className="text-3xl font-bold mb-3">Developer API</h3>
              <p className="text-gray-400 text-lg">RESTful API for custom integrations and workflows</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Hymns - Horizontal Cards */}
      {mostPopularHymns.length > 0 && (
        <div className="py-32 bg-gradient-to-b from-black via-violet-950/10 to-black">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="inline-block bg-white/5 backdrop-blur border border-white/10 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  Trending
                </div>
                <h2 className="text-5xl font-black">Most Popular</h2>
              </div>
              <Link href="/hymns" className="text-violet-400 hover:text-violet-300 flex items-center gap-2 font-medium">
                View All
                <IconArrowRight size={20} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mostPopularHymns.map((hymn, i) => (
                <Link
                  key={hymn.id}
                  href={`/hymns/${hymn.id}`}
                  className="group bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold mb-1 group-hover:text-violet-400 transition-colors line-clamp-2">
                        {hymn.title}
                      </h3>
                      {hymn.author && (
                        <p className="text-sm text-gray-400">{hymn.author}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recently Added - Spotlight */}
      {recentlyAddedHymns.length > 0 && (
        <div className="py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12">
              <div className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-black px-4 py-2 rounded-full text-sm font-bold mb-6 uppercase tracking-wider">
                New Arrivals
              </div>
              <h2 className="text-5xl font-black">Recently Added</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentlyAddedHymns.map((hymn) => (
                <Link
                  key={hymn.id}
                  href={`/hymns/${hymn.id}`}
                  className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:from-white/15 hover:to-white/10 hover:border-white/20 transition-all overflow-hidden"
                >
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    NEW
                  </div>
                  <h3 className="text-xl font-bold mb-2 pr-16 group-hover:text-cyan-400 transition-colors">
                    {hymn.title}
                  </h3>
                  {hymn.author && (
                    <p className="text-gray-400">{hymn.author}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Categories - Pill Cloud */}
      {popularTags.length > 0 && (
        <div className="py-32 bg-gradient-to-b from-black via-purple-950/10 to-black">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-block bg-white/5 backdrop-blur border border-white/10 px-4 py-2 rounded-full text-sm font-medium mb-6">
                Categories
              </div>
              <h2 className="text-5xl font-black">Browse by Theme</h2>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {popularTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/hymns?tag=${tag.slug}`}
                  className="bg-white/5 backdrop-blur border border-white/10 hover:bg-white/10 hover:border-violet-500/50 px-6 py-3 rounded-full font-medium transition-all hover:scale-105"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer - Minimal */}
      <footer className="border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-3xl font-black mb-4">Hymns2Go</h3>
              <p className="text-gray-400 max-w-md">
                Modern presentation tools for timeless worship music. Free hymn downloads for churches worldwide.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Navigation</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/hymns" className="hover:text-white transition-colors">Browse Hymns</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><Link href="/admin" className="hover:text-white transition-colors">Admin</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <p className="text-sm text-gray-400">
                Please respect copyright laws. Public domain hymns are clearly marked.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
            <p>&copy; 2025 Hymns2Go. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
