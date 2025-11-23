import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/admin/login');
  }

  // Get statistics
  const [totalHymns, totalTags, recentHymns] = await Promise.all([
    prisma.hymn.count(),
    prisma.tag.count(),
    prisma.hymn.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl font-bold text-blue-600">
                  {totalHymns}
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Hymns
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl font-bold text-green-600">
                  {totalTags}
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Tags
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/upload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Upload New Hymn
          </Link>
          <Link
            href="/admin/hymns"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Manage Hymns
          </Link>
        </div>
      </div>

      {/* Recent Hymns */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recently Added
        </h2>
        {recentHymns.length === 0 ? (
          <p className="text-gray-500">No hymns yet. Upload your first hymn!</p>
        ) : (
          <div className="space-y-4">
            {recentHymns.map((hymn) => (
              <div
                key={hymn.id}
                className="border-l-4 border-blue-500 pl-4 py-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {hymn.title}
                    </h3>
                    {hymn.author && (
                      <p className="text-sm text-gray-500">{hymn.author}</p>
                    )}
                    {hymn.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
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
                  <Link
                    href={`/admin/hymns/${hymn.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
