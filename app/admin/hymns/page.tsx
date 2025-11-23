import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import DeleteHymnButton from '@/components/admin/DeleteHymnButton';

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ManageHymnsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/admin/login');
  }

  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const search = params.search || '';
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { author: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [hymns, total] = await Promise.all([
    prisma.hymn.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
      skip,
      take: limit,
    }),
    prisma.hymn.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="px-4 sm:px-0">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Hymns</h1>
        <Link
          href="/admin/upload"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Upload New Hymn
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <form method="get" className="flex gap-2">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search hymns by title or author..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Search
          </button>
          {search && (
            <Link
              href="/admin/hymns"
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Hymns List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {hymns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {search ? 'No hymns found matching your search.' : 'No hymns yet.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {hymns.map((hymn) => (
              <li key={hymn.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {hymn.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                      {hymn.author && <span>{hymn.author}</span>}
                      {hymn.year && <span>{hymn.year}</span>}
                      {hymn.isPublicDomain && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Public Domain
                        </span>
                      )}
                    </div>
                    {hymn.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
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
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/hymns/${hymn.id}`}
                      target="_blank"
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/hymns/${hymn.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
                    <DeleteHymnButton hymnId={hymn.id} hymnTitle={hymn.title} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/hymns?page=${page - 1}${search ? `&search=${search}` : ''}`}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/hymns?page=${page + 1}${search ? `&search=${search}` : ''}`}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
