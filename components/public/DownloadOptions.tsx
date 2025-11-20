'use client';

import { useState } from 'react';

interface DownloadOptionsProps {
  hymnId: string;
  hymnTitle: string;
}

export default function DownloadOptions({
  hymnId,
  hymnTitle,
}: DownloadOptionsProps) {
  const [linesPerSlide, setLinesPerSlide] = useState(2);
  const [proPresenterVersion, setProPresenterVersion] = useState<6 | 7>(6);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (format: string) => {
    setDownloading(true);
    try {
      const params = new URLSearchParams({
        format,
        linesPerSlide: linesPerSlide.toString(),
        proPresenterVersion: proPresenterVersion.toString(),
      });

      const response = await fetch(
        `/api/hymns/${hymnId}/download?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${hymnTitle.replace(/[^a-z0-9]/gi, '_')}.${getFileExtension(format)}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Failed to download. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const getFileExtension = (format: string): string => {
    switch (format) {
      case 'pptx':
        return 'pptx';
      case 'propresenter':
        return proPresenterVersion === 7 ? 'pro' : 'pro6';
      case 'text':
      case 'text-per-slide':
        return 'txt';
      default:
        return 'txt';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Download Options
      </h2>

      {/* Lines per Slide */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lines per Slide
        </label>
        <select
          value={linesPerSlide}
          onChange={(e) => setLinesPerSlide(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={1}>1 line</option>
          <option value={2}>2 lines</option>
          <option value={3}>3 lines</option>
          <option value={4}>4 lines</option>
          <option value={6}>6 lines</option>
        </select>
      </div>

      {/* ProPresenter Version */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ProPresenter Version
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value={6}
              checked={proPresenterVersion === 6}
              onChange={(e) =>
                setProPresenterVersion(parseInt(e.target.value) as 6 | 7)
              }
              className="mr-2"
            />
            <span className="text-sm">Version 6</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value={7}
              checked={proPresenterVersion === 7}
              onChange={(e) =>
                setProPresenterVersion(parseInt(e.target.value) as 6 | 7)
              }
              className="mr-2"
            />
            <span className="text-sm">Version 7</span>
          </label>
        </div>
      </div>

      {/* Download Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => handleDownload('pptx')}
          disabled={downloading}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {downloading ? 'Downloading...' : 'Download PowerPoint'}
        </button>

        <button
          onClick={() => handleDownload('propresenter')}
          disabled={downloading}
          className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {downloading ? 'Downloading...' : 'Download ProPresenter'}
        </button>

        <button
          onClick={() => handleDownload('text')}
          disabled={downloading}
          className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {downloading ? 'Downloading...' : 'Download as Text'}
        </button>

        <button
          onClick={() => handleDownload('text-per-slide')}
          disabled={downloading}
          className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {downloading ? 'Downloading...' : 'Download as Text (Per Slide)'}
        </button>
      </div>

      <div className="mt-6 pt-6 border-t text-sm text-gray-600">
        <p className="mb-2">
          All downloads are formatted with minimal styling so you can apply
          your own templates.
        </p>
        <p>Adjust lines per slide to match your screen and font size.</p>
      </div>
    </div>
  );
}
