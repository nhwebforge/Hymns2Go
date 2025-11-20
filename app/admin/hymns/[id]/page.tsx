import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import EditHymnForm from '@/components/admin/EditHymnForm';

export default async function EditHymnPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
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
