'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteHymnButtonProps {
  hymnId: string;
  hymnTitle: string;
}

export default function DeleteHymnButton({
  hymnId,
  hymnTitle,
}: DeleteHymnButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/hymns/${hymnId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete hymn');
      }

      router.refresh();
    } catch (error) {
      alert('Failed to delete hymn');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Delete?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          {loading ? 'Deleting...' : 'Yes'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-sm text-red-600 hover:text-red-800"
    >
      Delete
    </button>
  );
}
