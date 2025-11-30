'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Tag {
  id: string;
  name: string;
}

interface Hymn {
  id: string;
  title: string;
  catalogueTitle: string | null;
  author: string | null;
  tags: {
    tag: Tag;
  }[];
}

interface InfiniteHymnListProps {
  initialHymns: Hymn[];
  search: string;
  tagSlug: string;
  startsWith: string;
  hasMore: boolean;
}

export default function InfiniteHymnList({
  initialHymns,
  search,
  tagSlug,
  startsWith,
  hasMore: initialHasMore,
}: InfiniteHymnListProps) {
  const [hymns, setHymns] = useState<Hymn[]>(initialHymns);
  const [page, setPage] = useState(1);
  const [loadingDown, setLoadingDown] = useState(false);
  const [loadingUp, setLoadingUp] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [hasPrevious, setHasPrevious] = useState(!!startsWith); // Can load previous if we're filtering by letter

  const topObserverTarget = useRef<HTMLDivElement>(null);
  const bottomObserverTarget = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset when search, tag, or startsWith changes
    setHymns(initialHymns);
    setPage(1);
    setHasMore(initialHasMore);
    setHasPrevious(!!startsWith);
  }, [initialHymns, initialHasMore, startsWith]);

  // Observer for scrolling down (bottom)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingDown && !loadingUp) {
          loadMoreDown();
        }
      },
      { threshold: 0.1 }
    );

    if (bottomObserverTarget.current) {
      observer.observe(bottomObserverTarget.current);
    }

    return () => {
      if (bottomObserverTarget.current) {
        observer.unobserve(bottomObserverTarget.current);
      }
    };
  }, [hasMore, loadingDown, loadingUp]);

  // Observer for scrolling up (top)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasPrevious && !loadingUp && !loadingDown) {
          loadMoreUp();
        }
      },
      { threshold: 0.1 }
    );

    if (topObserverTarget.current) {
      observer.observe(topObserverTarget.current);
    }

    return () => {
      if (topObserverTarget.current) {
        observer.unobserve(topObserverTarget.current);
      }
    };
  }, [hasPrevious, loadingUp, loadingDown]);

  const loadMoreDown = async () => {
    setLoadingDown(true);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        ...(search && { search }),
        ...(tagSlug && { tag: tagSlug }),
        ...(startsWith && { startsWith }),
      });

      const response = await fetch(`/api/hymns?${params}`);
      const data = await response.json();

      if (data.hymns.length > 0) {
        setHymns((prev) => {
          // Deduplicate by ID
          const existingIds = new Set(prev.map(h => h.id));
          const newHymns = data.hymns.filter((h: Hymn) => !existingIds.has(h.id));
          return [...prev, ...newHymns];
        });
        setPage((prev) => prev + 1);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more hymns:', error);
    } finally {
      setLoadingDown(false);
    }
  };

  const loadMoreUp = async () => {
    if (!hymns.length) return;

    setLoadingUp(true);
    const currentScrollHeight = containerRef.current?.scrollHeight || 0;

    try {
      // Get the first hymn's catalogueTitle to fetch hymns before it
      const firstHymn = hymns[0];
      const firstTitle = (firstHymn.catalogueTitle || firstHymn.title).toLowerCase();

      // Fetch hymns that come before the first one alphabetically
      const params = new URLSearchParams({
        limit: '30',
        before: firstTitle,
        ...(search && { search }),
        ...(tagSlug && { tag: tagSlug }),
      });

      const response = await fetch(`/api/hymns?${params}`);
      const data = await response.json();

      if (data.hymns.length > 0) {
        setHymns((prev) => {
          // Deduplicate by ID
          const existingIds = new Set(prev.map(h => h.id));
          const newHymns = data.hymns.filter((h: Hymn) => !existingIds.has(h.id));
          return [...newHymns, ...prev];
        });

        // Maintain scroll position after prepending
        setTimeout(() => {
          if (containerRef.current) {
            const newScrollHeight = containerRef.current.scrollHeight;
            const scrollDiff = newScrollHeight - currentScrollHeight;
            window.scrollBy(0, scrollDiff);
          }
        }, 0);
      } else {
        setHasPrevious(false);
      }
    } catch (error) {
      console.error('Error loading previous hymns:', error);
    } finally {
      setLoadingUp(false);
    }
  };

  return (
    <div ref={containerRef}>
      {/* Top loading indicator and observer */}
      {hasPrevious && <div ref={topObserverTarget} className="h-10" />}

      {loadingUp && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-indigo-600 absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading previous hymns...</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {hymns.map((hymn) => (
          <Link
            key={hymn.id}
            href={`/hymns/${hymn.id}`}
            data-hymn-title={hymn.catalogueTitle || hymn.title}
            className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 block border border-gray-100 hover:border-blue-200 hover:-translate-y-2 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                {hymn.title}
              </h3>
              {hymn.author && (
                <p className="text-gray-600 mb-4 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  {hymn.author}
                </p>
              )}
              {hymn.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {hymn.tags.slice(0, 3).map((ht) => (
                    <span
                      key={ht.tag.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200"
                    >
                      {ht.tag.name}
                    </span>
                  ))}
                  {hymn.tags.length > 3 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                      +{hymn.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom loading indicator */}
      {loadingDown && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-indigo-600 absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading more hymns...</p>
        </div>
      )}

      {/* Bottom intersection observer target */}
      {hasMore && <div ref={bottomObserverTarget} className="h-10" />}

      {/* End of results message */}
      {!hasMore && !hasPrevious && hymns.length > 0 && (
        <div className="text-center py-12">
          <div className="inline-block px-8 py-4 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full font-semibold border-2 border-blue-200">
            ✓ All hymns loaded
          </div>
        </div>
      )}
    </div>
  );
}
