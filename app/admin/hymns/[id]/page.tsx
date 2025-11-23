import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import EditHymnForm from '@/components/admin/EditHymnForm';

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EditHymnPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/admin/login');
  }

  const { id } = await params;

  const hymn = await prisma.hymn.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!hymn) {
    redirect('/admin/hymns');
  }

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Hymn</h1>
      <EditHymnForm
        hymn={{
          ...hymn,
          tags: hymn.tags.map((ht) => ht.tag),
        }}
      />
    </div>
  );
}
