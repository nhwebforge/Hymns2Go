import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import { HymnStructure } from '@/lib/hymn-processor/parser';
import HymnViewClient from '@/components/public/HymnViewClient';

export default async function HymnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const hymn = await prisma.hymn.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      author: true,
      translator: true,
      year: true,
      firstLine: true,
      meter: true,
      language: true,
      isPublicDomain: true,
      publisher: true,
      ccliNumber: true,
      structure: true,
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!hymn) {
    notFound();
  }

  const structure = hymn.structure as unknown as HymnStructure;

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link
          href="/hymns"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8 font-medium group transition-all duration-200"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
          Back to all hymns
        </Link>

        {/* Hymn Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-10 mb-8 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              {hymn.title}
            </h1>

            <div className="flex flex-wrap gap-4 text-gray-600 mb-6 items-center">
              {hymn.author && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  <p className="font-medium">By {hymn.author}</p>
                </div>
              )}
              {hymn.translator && (
                <>
                  {hymn.author && <span className="text-gray-400">•</span>}
                  <p className="font-medium">Translated by {hymn.translator}</p>
                </>
              )}
              {hymn.year && (
                <>
                  <span className="text-gray-400">•</span>
                  <p className="font-medium">{hymn.year}</p>
                </>
              )}
            </div>

            {/* Additional Metadata */}
            {(hymn.firstLine || hymn.meter || hymn.language) && (
              <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl p-6 mb-6 space-y-3">
                {hymn.firstLine && (
                  <p className="text-gray-700">
                    <span className="font-bold text-gray-900">First Line:</span> {hymn.firstLine}
                  </p>
                )}
                {hymn.meter && (
                  <p className="text-gray-700">
                    <span className="font-bold text-gray-900">Meter:</span> {hymn.meter}
                  </p>
                )}
                {hymn.language && (
                  <p className="text-gray-700">
                    <span className="font-bold text-gray-900">Language:</span> {hymn.language}
                  </p>
                )}
              </div>
            )}

            {hymn.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {hymn.tags.map((ht) => (
                  <Link
                    key={ht.tag.id}
                    href={`/hymns?tag=${ht.tag.slug}`}
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 hover:from-blue-200 hover:to-indigo-200 transition-all duration-300 border border-blue-200 hover:border-blue-300 transform hover:scale-105"
                  >
                    {ht.tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Copyright Info */}
            <div className="border-t-2 border-gray-200 pt-6 mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {hymn.isPublicDomain && (
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-lg">✓</span>
                  <span className="font-bold text-green-700">Public Domain</span>
                </div>
              )}
              {hymn.publisher && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">📚</span>
                  <span className="text-gray-700">
                    <span className="font-semibold">Publisher:</span> {hymn.publisher}
                  </span>
                </div>
              )}
              {hymn.ccliNumber && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">#️⃣</span>
                  <span className="text-gray-700">
                    <span className="font-semibold">CCLI:</span> {hymn.ccliNumber}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <HymnViewClient
          hymnId={hymn.id}
          hymnTitle={hymn.title}
          structure={structure}
        />
      </main>
    </div>
  );
}
