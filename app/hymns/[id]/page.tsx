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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link
          href="/hymns"
          className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 mb-8 font-medium"
        >
          <span>←</span>
          Back to all hymns
        </Link>

        {/* Hymn Header */}
        <div className="bg-white rounded-lg shadow p-6 sm:p-10 mb-8 border border-stone-200">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-6 leading-tight">
            {hymn.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-stone-600 mb-6 items-center text-sm sm:text-base">
            {hymn.author && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-700 rounded-full"></span>
                <p className="font-medium">By {hymn.author}</p>
              </div>
            )}
            {hymn.translator && (
              <>
                {hymn.author && <span className="text-stone-400">•</span>}
                <p className="font-medium">Translated by {hymn.translator}</p>
              </>
            )}
            {hymn.year && (
              <>
                <span className="text-stone-400">•</span>
                <p className="font-medium">{hymn.year}</p>
              </>
            )}
          </div>

          {/* Additional Metadata */}
          {(hymn.firstLine || hymn.meter || hymn.language) && (
            <div className="bg-amber-50 rounded-lg p-4 sm:p-6 mb-6 space-y-2 sm:space-y-3 border border-amber-100">
              {hymn.firstLine && (
                <p className="text-stone-700 text-sm sm:text-base">
                  <span className="font-bold text-stone-900">First Line:</span> {hymn.firstLine}
                </p>
              )}
              {hymn.meter && (
                <p className="text-stone-700 text-sm sm:text-base">
                  <span className="font-bold text-stone-900">Meter:</span> {hymn.meter}
                </p>
              )}
              {hymn.language && (
                <p className="text-stone-700 text-sm sm:text-base">
                  <span className="font-bold text-stone-900">Language:</span> {hymn.language}
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
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors border border-amber-200"
                >
                  {ht.tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Copyright Info */}
          <div className="border-t border-stone-200 pt-4 sm:pt-6 mt-4 sm:mt-6 flex flex-wrap gap-4 sm:gap-6">
            {hymn.isPublicDomain && (
              <div className="flex items-center gap-2 text-sm sm:text-base">
                <span className="text-green-600 text-lg">✓</span>
                <span className="font-bold text-green-700">Public Domain</span>
              </div>
            )}
            {hymn.ccliNumber && (
              <div className="flex items-center gap-2 text-sm sm:text-base">
                <span className="text-stone-500">#</span>
                <span className="text-stone-700">
                  <span className="font-semibold">CCLI:</span> {hymn.ccliNumber}
                </span>
              </div>
            )}
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
