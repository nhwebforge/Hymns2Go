'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Hymn {
  id: string;
  title: string;
  author: string | null;
  year: number | null;
  rawText: string;
  isPublicDomain: boolean;
  publisher: string | null;
  ccliNumber: string | null;
  tags: Tag[];
}

export default function EditHymnForm({ hymn }: { hymn: Hymn }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: hymn.title,
    author: hymn.author || '',
    year: hymn.year?.toString() || '',
    rawText: hymn.rawText,
    isPublicDomain: hymn.isPublicDomain,
    publisher: hymn.publisher || '',
    ccliNumber: hymn.ccliNumber || '',
    tags: hymn.tags.map((t) => t.name).join(', '),
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        title: formData.title,
        author: formData.author || undefined,
        year: formData.year ? parseInt(formData.year) : undefined,
        rawText: formData.rawText,
        isPublicDomain: formData.isPublicDomain,
        publisher: formData.publisher || undefined,
        ccliNumber: formData.ccliNumber || undefined,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim())
          : undefined,
      };

      const response = await fetch(`/api/hymns/${hymn.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update hymn');
      }

      router.push('/admin/hymns');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title *
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Author */}
          <div>
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700"
            >
              Author
            </label>
            <input
              type="text"
              name="author"
              id="author"
              value={formData.author}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Year */}
          <div>
            <label
              htmlFor="year"
              className="block text-sm font-medium text-gray-700"
            >
              Year
            </label>
            <input
              type="number"
              name="year"
              id="year"
              value={formData.year}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Hymn Text */}
          <div>
            <label
              htmlFor="rawText"
              className="block text-sm font-medium text-gray-700"
            >
              Hymn Text *
            </label>
            <textarea
              name="rawText"
              id="rawText"
              required
              rows={12}
              value={formData.rawText}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm font-mono"
            />
          </div>

          {/* Copyright Info */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Copyright Information
            </h3>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublicDomain"
                  id="isPublicDomain"
                  checked={formData.isPublicDomain}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isPublicDomain"
                  className="ml-2 block text-sm text-gray-700"
                >
                  This hymn is in the public domain
                </label>
              </div>

              <div>
                <label
                  htmlFor="publisher"
                  className="block text-sm font-medium text-gray-700"
                >
                  Publisher
                </label>
                <input
                  type="text"
                  name="publisher"
                  id="publisher"
                  value={formData.publisher}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="ccliNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  CCLI Number
                </label>
                <input
                  type="text"
                  name="ccliNumber"
                  id="ccliNumber"
                  value={formData.ccliNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700"
            >
              Tags
            </label>
            <input
              type="text"
              name="tags"
              id="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="e.g. Christmas, Grace, Salvation (comma-separated)"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter tags separated by commas
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
