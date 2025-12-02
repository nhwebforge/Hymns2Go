import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import { HymnStructure } from '@/lib/hymn-processor/parser';
import { IconArrowLeft, IconTag } from '@tabler/icons-react';
import HymnViewClient from '@/components/public/HymnViewClient';

export default async function ExperimentalHymnDetailPage({
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
    <div className="min-h-screen bg-black text-white">
      {/* Gradient Background Orbs */}
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-violet-500/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Floating Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-8 py-3 flex items-center gap-8">
        <Link href="/experimental" className="text-sm font-medium hover:text-violet-400 transition-colors">Home</Link>
        <Link href="/experimental/hymns" className="text-sm font-medium hover:text-violet-400 transition-colors">Browse</Link>
        <Link href="/admin" className="text-sm font-medium hover:text-violet-400 transition-colors">Admin</Link>
      </nav>

      {/* Main Content */}
      <main className="relative pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Link */}
          <Link
            href="/experimental/hymns"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
          >
            <IconArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to all hymns
          </Link>

          {/* Hymn Header Card */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 mb-12 shadow-2xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight">
              {hymn.title}
            </h1>

            {/* Metadata Row */}
            <div className="flex flex-wrap gap-6 text-gray-300 mb-8 items-center">
              {hymn.author && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                  <p className="font-medium">By {hymn.author}</p>
                </div>
              )}
              {hymn.translator && (
                <>
                  <span className="text-gray-600">•</span>
                  <p className="font-medium">Translated by {hymn.translator}</p>
                </>
              )}
              {hymn.year && (
                <>
                  <span className="text-gray-600">•</span>
                  <p className="font-medium">{hymn.year}</p>
                </>
              )}
            </div>

            {/* Additional Metadata */}
            {(hymn.firstLine || hymn.meter || hymn.language) && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 space-y-3">
                {hymn.firstLine && (
                  <p className="text-gray-300">
                    <span className="font-bold text-white">First Line:</span> {hymn.firstLine}
                  </p>
                )}
                {hymn.meter && (
                  <p className="text-gray-300">
                    <span className="font-bold text-white">Meter:</span> {hymn.meter}
                  </p>
                )}
                {hymn.language && (
                  <p className="text-gray-300">
                    <span className="font-bold text-white">Language:</span> {hymn.language}
                  </p>
                )}
              </div>
            )}

            {/* Tags */}
            {hymn.tags.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <IconTag size={20} className="text-violet-400" />
                  <h3 className="font-bold text-white">Categories</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hymn.tags.map((ht) => (
                    <Link
                      key={ht.tag.id}
                      href={`/experimental/hymns?tag=${ht.tag.slug}`}
                      className="px-4 py-2 rounded-full font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30 transition-all"
                    >
                      {ht.tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Copyright Info */}
            <div className="border-t border-white/10 pt-6 flex flex-wrap gap-6">
              {hymn.isPublicDomain && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-bold text-green-400">Public Domain</span>
                </div>
              )}
              {hymn.ccliNumber && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">#</span>
                  <span className="text-gray-300">
                    <span className="font-semibold">CCLI:</span> {hymn.ccliNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Download Options & Preview */}
          <HymnViewClient
            hymnId={hymn.id}
            hymnTitle={hymn.title}
            structure={structure}
            experimentalMode={true}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">&copy; 2025 Hymns2Go. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
