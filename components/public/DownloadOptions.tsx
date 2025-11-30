'use client';

import { useState } from 'react';
import Image from 'next/image';
import FontPicker from './FontPicker';

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
  editedSlides: { slideIndex: number; lines: string[] }[];
  includeFormatting: boolean;
  setIncludeFormatting: (value: boolean) => void;
  backgroundColor: string;
  setBackgroundColor: (value: string) => void;
  textColor: string;
  setTextColor: (value: string) => void;
  includeShadow: boolean;
  setIncludeShadow: (value: boolean) => void;
  includeOutline: boolean;
  setIncludeOutline: (value: boolean) => void;
  outlineColor: string;
  setOutlineColor: (value: string) => void;
  fontFamily: string;
  setFontFamily: (value: string) => void;
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
  setStripPunctuation,
  editedSlides,
  includeFormatting,
  setIncludeFormatting,
  backgroundColor,
  setBackgroundColor,
  textColor,
  setTextColor,
  includeShadow,
  setIncludeShadow,
  includeOutline,
  setIncludeOutline,
  outlineColor,
  setOutlineColor,
  fontFamily,
  setFontFamily
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
        includeFormatting: includeFormatting.toString(),
        backgroundColor: backgroundColor,
        textColor: textColor,
        includeShadow: includeShadow.toString(),
        includeOutline: includeOutline.toString(),
        outlineColor: outlineColor,
        fontFamily: fontFamily,
      });

      let response;
      if (editedSlides.length > 0) {
        // Use POST with edited slides
        response = await fetch(
          `/api/hymns/${hymnId}/download?${params.toString()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ editedSlides })
          }
        );
      } else {
        // Use GET without edits
        response = await fetch(
          `/api/hymns/${hymnId}/download?${params.toString()}`
        );
      }

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
          <span className="text-sm text-gray-700">Remove punctuation</span>
        </label>
      </div>

      {/* Formatting Options */}
      <div className="mb-6">
        <label className="flex items-center mb-3">
          <input
            type="checkbox"
            checked={includeFormatting}
            onChange={(e) => setIncludeFormatting(e.target.checked)}
            className="mr-2 h-4 w-4"
          />
          <span className="text-sm font-medium text-gray-700">Include basic formatting</span>
        </label>

        <div className={`border-2 rounded-lg p-4 space-y-4 transition-all ${
          includeFormatting
            ? 'border-blue-300 bg-blue-50/30'
            : 'border-gray-200 bg-gray-50 opacity-60'
        }`}>
          {/* Font Selection */}
          <div>
            <FontPicker
              selectedFont={fontFamily}
              onFontChange={setFontFamily}
              disabled={!includeFormatting}
            />
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Background Color
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                disabled={!includeFormatting}
                className="h-10 w-20 rounded border border-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                disabled={!includeFormatting}
                placeholder="#000000"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={() => setBackgroundColor('transparent')}
                disabled={!includeFormatting}
                className="px-3 py-2 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Text Color */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Text Color
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                disabled={!includeFormatting}
                className="h-10 w-20 rounded border border-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                disabled={!includeFormatting}
                placeholder="#FFFFFF"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Shadow */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeShadow}
                onChange={(e) => setIncludeShadow(e.target.checked)}
                disabled={!includeFormatting}
                className="mr-2 h-4 w-4 disabled:cursor-not-allowed"
              />
              <span className="text-xs text-gray-700">Include shadow</span>
            </label>
          </div>

          {/* Outline */}
          <div>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={includeOutline}
                onChange={(e) => setIncludeOutline(e.target.checked)}
                disabled={!includeFormatting}
                className="mr-2 h-4 w-4 disabled:cursor-not-allowed"
              />
              <span className="text-xs text-gray-700">Include text outline</span>
            </label>

            {includeOutline && (
              <div className="ml-6">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Outline Color
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={outlineColor}
                    onChange={(e) => setOutlineColor(e.target.value)}
                    disabled={!includeFormatting}
                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <input
                    type="text"
                    value={outlineColor}
                    onChange={(e) => setOutlineColor(e.target.value)}
                    disabled={!includeFormatting}
                    placeholder="#000000"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
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
