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
    <div className="min-h-screen bg-gray-50">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/hymns"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          ← Back to all hymns
        </Link>

        {/* Hymn Header */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {hymn.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
            {hymn.author && <p>By {hymn.author}</p>}
            {hymn.translator && (
              <>
                {hymn.author && <p>•</p>}
                <p>Translated by {hymn.translator}</p>
              </>
            )}
            {hymn.year && <p>•</p>}
            {hymn.year && <p>{hymn.year}</p>}
          </div>

          {/* Additional Metadata */}
          {(hymn.firstLine || hymn.meter || hymn.language) && (
            <div className="text-sm text-gray-600 space-y-1 mb-4">
              {hymn.firstLine && (
                <p>
                  <span className="font-medium">First Line:</span> {hymn.firstLine}
                </p>
              )}
              {hymn.meter && (
                <p>
                  <span className="font-medium">Meter:</span> {hymn.meter}
                </p>
              )}
              {hymn.language && (
                <p>
                  <span className="font-medium">Language:</span> {hymn.language}
                </p>
              )}
            </div>
          )}

          {hymn.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {hymn.tags.map((ht) => (
                <Link
                  key={ht.tag.id}
                  href={`/hymns?tag=${ht.tag.slug}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  {ht.tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Copyright Info */}
          <div className="border-t pt-4 mt-4 text-sm text-gray-600">
            {hymn.isPublicDomain && (
              <p className="mb-2">
                <span className="font-medium">Public Domain</span>
              </p>
            )}
            {hymn.publisher && (
              <p className="mb-1">Publisher: {hymn.publisher}</p>
            )}
            {hymn.ccliNumber && <p>CCLI #: {hymn.ccliNumber}</p>}
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
