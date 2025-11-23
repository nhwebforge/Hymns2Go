'use client';

import { useState } from 'react';
import Image from 'next/image';

interface DownloadOptionsProps {
  hymnId: string;
  hymnTitle: string;
  linesPerSlide: number;
  setLinesPerSlide: (value: number) => void;
  includeVerseNumbers: boolean;
  setIncludeVerseNumbers: (value: boolean) => void;
  includeTitleSlide: boolean;
  setIncludeTitleSlide: (value: boolean) => void;
  stripPunctuation: boolean;
  setStripPunctuation: (value: boolean) => void;
}

export default function DownloadOptions({
  hymnId,
  hymnTitle,
  linesPerSlide,
  setLinesPerSlide,
  includeVerseNumbers,
  setIncludeVerseNumbers,
  includeTitleSlide,
  setIncludeTitleSlide,
  stripPunctuation,
  setStripPunctuation
}: DownloadOptionsProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (format: string) => {
    setDownloading(true);
    try {
      const params = new URLSearchParams({
        format,
        linesPerSlide: linesPerSlide.toString(),
        includeVerseNumbers: includeVerseNumbers.toString(),
        includeTitleSlide: includeTitleSlide.toString(),
        stripPunctuation: stripPunctuation.toString(),
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
      case 'propresenter6':
        return 'pro6';
      case 'propresenter7':
        return 'pro';
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

      {/* Options Checkboxes */}
      <div className="mb-6 space-y-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={includeTitleSlide}
            onChange={(e) => setIncludeTitleSlide(e.target.checked)}
            className="mr-2 h-4 w-4"
          />
          <span className="text-sm text-gray-700">Include title slide</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={includeVerseNumbers}
            onChange={(e) => setIncludeVerseNumbers(e.target.checked)}
            className="mr-2 h-4 w-4"
          />
          <span className="text-sm text-gray-700">Include verse numbers, refrain headings, etc.</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={stripPunctuation}
            onChange={(e) => setStripPunctuation(e.target.checked)}
            className="mr-2 h-4 w-4"
          />
          <span className="text-sm text-gray-700">Strip punctuation</span>
        </label>
      </div>

      {/* Download Buttons */}
      <div className="space-y-3">
        <div className="flex items-stretch gap-3">
          <div className="w-12 flex-shrink-0 flex items-center justify-center">
            <Image
              src="/icons/ppt.png"
              alt="PowerPoint"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <button
            onClick={() => handleDownload('pptx')}
            disabled={downloading}
            className="flex-1 px-4 py-3 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            style={{ backgroundColor: '#AA0D20' }}
          >
            {downloading ? 'Downloading...' : 'Download for PowerPoint'}
          </button>
        </div>

        <div className="flex items-stretch gap-3">
          <div className="w-12 flex-shrink-0 flex items-center justify-center">
            <Image
              src="/icons/pro6.png"
              alt="ProPresenter 6"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <button
            onClick={() => handleDownload('propresenter6')}
            disabled={downloading}
            className="flex-1 px-4 py-3 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            style={{ backgroundColor: '#5882b2' }}
          >
            {downloading ? 'Downloading...' : 'Download for ProPresenter 6'}
          </button>
        </div>

        <div className="flex items-stretch gap-3">
          <div className="w-12 flex-shrink-0 flex items-center justify-center">
            <Image
              src="/icons/pro7.png"
              alt="ProPresenter 7"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <button
            onClick={() => handleDownload('propresenter7')}
            disabled={downloading}
            className="flex-1 px-4 py-3 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            style={{ backgroundColor: '#ff7600' }}
          >
            {downloading ? 'Downloading...' : 'Download for ProPresenter 7'}
          </button>
        </div>

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
