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
  author: string | null;
  tags: {
    tag: Tag;
  }[];
}

interface InfiniteHymnListProps {
  initialHymns: Hymn[];
  search: string;
  tagSlug: string;
  hasMore: boolean;
}

export default function InfiniteHymnList({
  initialHymns,
  search,
  tagSlug,
  hasMore: initialHasMore,
}: InfiniteHymnListProps) {
  const [hymns, setHymns] = useState<Hymn[]>(initialHymns);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset when search or tag changes
    setHymns(initialHymns);
    setPage(1);
    setHasMore(initialHasMore);
  }, [initialHymns, initialHasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, page]);

  const loadMore = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        ...(search && { search }),
        ...(tagSlug && { tag: tagSlug }),
      });

      const response = await fetch(`/api/hymns?${params}`);
      const data = await response.json();

      if (data.hymns.length > 0) {
        setHymns((prev) => [...prev, ...data.hymns]);
        setPage((prev) => prev + 1);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more hymns:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {hymns.map((hymn) => (
          <Link
            key={hymn.id}
            href={`/hymns/${hymn.id}`}
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 block"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {hymn.title}
            </h3>
            {hymn.author && (
              <p className="text-gray-600 mb-3">{hymn.author}</p>
            )}
            {hymn.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {hymn.tags.map((ht) => (
                  <span
                    key={ht.tag.id}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {ht.tag.name}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Intersection observer target */}
      {hasMore && <div ref={observerTarget} className="h-10" />}

      {/* End of results message */}
      {!hasMore && hymns.length > 0 && (
        <div className="text-center py-8 text-gray-600">
          <p>No more hymns to load</p>
        </div>
      )}
    </>
  );
}
