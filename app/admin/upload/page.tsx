'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseHymnText, formatAsSlides, type HymnStructure } from '@/lib/hymn-processor/parser';

export default function UploadHymnPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [parsedStructure, setParsedStructure] = useState<HymnStructure | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    year: '',
    rawText: '',
    isPublicDomain: false,
    publisher: '',
    ccliNumber: '',
    tags: '',
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setFormData((prev) => ({ ...prev, rawText: text }));
    } catch (err) {
      setError('Failed to read file');
    }
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Parse the hymn text
      const structure = parseHymnText(formData.rawText);
      setParsedStructure(structure);
      setStep('preview');
    } catch (err: any) {
      setError(err.message || 'Failed to parse hymn text');
    }
  };

  const handleBackToForm = () => {
    setStep('form');
  };

  const handleConfirmSave = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

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

      const response = await fetch('/api/hymns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload hymn');
      }

      setSuccess(true);
      setFormData({
        title: '',
        author: '',
        year: '',
        rawText: '',
        isPublicDomain: false,
        publisher: '',
        ccliNumber: '',
        tags: '',
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/admin/hymns');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload Hymn</h1>

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Hymn uploaded successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {step === 'form' && (
        <form onSubmit={handlePreview} className="bg-white shadow rounded-lg p-6">
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
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Hymn Text *
            </label>
            <div className="mb-2">
              <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                <span>Upload Text File</span>
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
              <span className="ml-3 text-sm text-gray-500">
                or paste below
              </span>
            </div>
            <textarea
              name="rawText"
              id="rawText"
              required
              rows={12}
              value={formData.rawText}
              onChange={handleInputChange}
              placeholder="Paste hymn lyrics here. Include verse numbers and chorus labels - they will be automatically removed."
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
              Preview Hymn
            </button>
          </div>
        </div>
      </form>
      )}

      {step === 'preview' && parsedStructure && (
        <div className="space-y-6">
          {/* Preview Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Preview & Edit</h2>
            <p className="text-gray-600 mb-6">
              Review the parsed hymn structure below. You can edit the raw text if needed before saving.
            </p>

            {/* Editable Raw Text */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hymn Text
              </label>
              <textarea
                value={formData.rawText}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, rawText: e.target.value }));
                  try {
                    const newStructure = parseHymnText(e.target.value);
                    setParsedStructure(newStructure);
                    setError('');
                  } catch (err: any) {
                    setError(err.message || 'Failed to parse hymn text');
                  }
                }}
                rows={12}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm font-mono"
              />
            </div>

            {/* Slide Preview */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Slide Preview (2 lines per slide)</h3>
              <div className="space-y-4">
                {/* Title Slide */}
                <div className="bg-gray-900 text-white rounded-lg p-8 flex items-center justify-center min-h-[200px]">
                  <h3 className="text-3xl font-bold text-center">{formData.title}</h3>
                </div>

                {/* Content Slides */}
                {formatAsSlides(parsedStructure, 2).map((slide, index) => (
                  <div key={index}>
                    {slide.sectionNumber && (
                      <div className="text-sm font-medium text-gray-600 mb-2 px-2">
                        {slide.sectionType === 'verse' ? `Verse ${slide.sectionNumber}` :
                         slide.sectionType === 'chorus' ? 'Chorus' :
                         slide.sectionType === 'bridge' ? 'Bridge' :
                         'Other'}
                      </div>
                    )}
                    <div className="bg-gray-900 text-white rounded-lg p-8 flex items-center justify-center min-h-[200px]">
                      <div className="text-center">
                        {slide.lines.map((line, lineIndex) => (
                          <p key={lineIndex} className="text-2xl mb-2">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t text-sm text-gray-600">
                <p>
                  Total slides: {formatAsSlides(parsedStructure, 2).length + 1} (including title slide)
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 bg-white shadow rounded-lg p-6">
            <button
              type="button"
              onClick={handleBackToForm}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Form
            </button>
            <button
              type="button"
              onClick={handleConfirmSave}
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Confirm & Save Hymn'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
