'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { HexColorPicker } from 'react-colorful';
import { IconFile, IconFiles } from '@tabler/icons-react';
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
  const [activeColorPicker, setActiveColorPicker] = useState<'background' | 'text' | 'outline' | null>(null);

  const backgroundPickerRef = useRef<HTMLDivElement>(null);
  const textPickerRef = useRef<HTMLDivElement>(null);
  const outlinePickerRef = useRef<HTMLDivElement>(null);

  // Validate hex color code
  const isValidHex = (color: string): boolean => {
    if (color === 'transparent') return true;
    return /^#[0-9A-F]{6}$/i.test(color);
  };

  // Handle color change with validation
  const handleColorChange = (value: string, setter: (value: string) => void, currentValue: string) => {
    const uppercaseValue = value.toUpperCase();
    // Allow typing in progress or valid hex
    if (uppercaseValue === '' || uppercaseValue === '#' || /^#[0-9A-F]{0,6}$/i.test(uppercaseValue)) {
      setter(uppercaseValue);
    } else if (!isValidHex(uppercaseValue)) {
      // Revert to current value if invalid
      setter(currentValue);
    } else {
      setter(uppercaseValue);
    }
  };

  // Close color picker when clicking outside
  useEffect(() => {
    if (!activeColorPicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        !backgroundPickerRef.current?.contains(event.target as Node) &&
        !textPickerRef.current?.contains(event.target as Node) &&
        !outlinePickerRef.current?.contains(event.target as Node)
      ) {
        setActiveColorPicker(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeColorPicker]);

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

      {/* CMG Sans Font Download Link */}
      <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-700">
            Download CMG Sans font for presentations
          </span>
          <a
            href="https://www.churchmotiongraphics.com/cmg-sans/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 font-medium underline whitespace-nowrap"
          >
            Download
          </a>
        </div>
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

          {/* Background and Text Colours Side by Side */}
          <div className="flex gap-3 items-end">
            {/* Background Colour */}
            <div className="flex-1 relative" ref={backgroundPickerRef}>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Background Colour
              </label>
              <div className="flex gap-2 items-center">
                <div
                  className={`h-[1.875rem] w-[1.875rem] flex-shrink-0 rounded border border-gray-300 ${backgroundColor === 'transparent' ? 'bg-checkerboard' : ''} ${!includeFormatting ? 'cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}`}
                  style={{ backgroundColor: backgroundColor === 'transparent' ? undefined : backgroundColor }}
                  onClick={() => includeFormatting && setActiveColorPicker(activeColorPicker === 'background' ? null : 'background')}
                ></div>
                <input
                  type="text"
                  value={backgroundColor === 'transparent' ? 'None' : backgroundColor.toUpperCase()}
                  onChange={(e) => handleColorChange(e.target.value, setBackgroundColor, backgroundColor)}
                  disabled={!includeFormatting}
                  placeholder="#000000"
                  className="w-[4.75rem] h-[1.875rem] px-2 text-sm border border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Color Picker Popup */}
              {activeColorPicker === 'background' && includeFormatting && (
                <div className="absolute z-50 mt-2 p-3 bg-white rounded-lg shadow-xl border border-gray-300">
                  <HexColorPicker
                    color={backgroundColor === 'transparent' ? '#000000' : backgroundColor}
                    onChange={(color) => setBackgroundColor(color.toUpperCase())}
                  />
                  <button
                    onClick={() => {
                      setBackgroundColor('transparent');
                      setActiveColorPicker(null);
                    }}
                    className="w-full mt-3 px-3 py-2 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
                  >
                    None
                  </button>
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => {
                  if (!includeFormatting) return;
                  const tempBg = backgroundColor;
                  setBackgroundColor(textColor);
                  setTextColor(tempBg);
                }}
                disabled={!includeFormatting}
                className="h-[1.875rem] w-[1.875rem] flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Swap background and text colours"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </button>
            </div>

            {/* Text Colour */}
            <div className="flex-1 relative" ref={textPickerRef}>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Text Colour
              </label>
              <div className="flex gap-2 items-center">
                <div
                  className={`h-[1.875rem] w-[1.875rem] flex-shrink-0 rounded border border-gray-300 ${textColor === 'transparent' ? 'bg-checkerboard' : ''} ${!includeFormatting ? 'cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}`}
                  style={{ backgroundColor: textColor === 'transparent' ? undefined : textColor }}
                  onClick={() => includeFormatting && setActiveColorPicker(activeColorPicker === 'text' ? null : 'text')}
                ></div>
                <input
                  type="text"
                  value={textColor === 'transparent' ? 'None' : textColor.toUpperCase()}
                  onChange={(e) => handleColorChange(e.target.value, setTextColor, textColor)}
                  disabled={!includeFormatting}
                  placeholder="#FFFFFF"
                  className="w-[4.75rem] h-[1.875rem] px-2 text-sm border border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Color Picker Popup */}
              {activeColorPicker === 'text' && includeFormatting && (
                <div className="absolute z-50 mt-2 p-3 bg-white rounded-lg shadow-xl border border-gray-300">
                  <HexColorPicker
                    color={textColor === 'transparent' ? '#FFFFFF' : textColor}
                    onChange={(color) => setTextColor(color.toUpperCase())}
                  />
                </div>
              )}
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
              <span className="text-xs text-gray-700">Include text shadow</span>
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative" ref={outlinePickerRef}>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Outline Colour
                    </label>
                    <div className="flex gap-2 items-center">
                      <div
                        className={`h-[1.875rem] w-[1.875rem] flex-shrink-0 rounded border border-gray-300 ${outlineColor === 'transparent' ? 'bg-checkerboard' : ''} ${!includeFormatting ? 'cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}`}
                        style={{ backgroundColor: outlineColor === 'transparent' ? undefined : outlineColor }}
                        onClick={() => includeFormatting && setActiveColorPicker(activeColorPicker === 'outline' ? null : 'outline')}
                      ></div>
                      <input
                        type="text"
                        value={outlineColor === 'transparent' ? 'None' : outlineColor.toUpperCase()}
                        onChange={(e) => handleColorChange(e.target.value, setOutlineColor, outlineColor)}
                        disabled={!includeFormatting}
                        placeholder="#000000"
                        className="w-[4.75rem] h-[1.875rem] px-2 text-sm border border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Color Picker Popup */}
                    {activeColorPicker === 'outline' && includeFormatting && (
                      <div className="absolute z-50 mt-2 p-3 bg-white rounded-lg shadow-xl border border-gray-300">
                        <HexColorPicker
                          color={outlineColor === 'transparent' ? '#000000' : outlineColor}
                          onChange={(color) => setOutlineColor(color.toUpperCase())}
                        />
                      </div>
                    )}
                  </div>
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

        <div className="flex items-stretch gap-3">
          <div className="w-12 flex-shrink-0 flex items-center justify-center">
            <IconFile size={48} className="text-gray-600" stroke={1.5} />
          </div>
          <button
            onClick={() => handleDownload('text')}
            disabled={downloading}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {downloading ? 'Downloading...' : 'Download as Text'}
          </button>
        </div>

        <div className="flex items-stretch gap-3">
          <div className="w-12 flex-shrink-0 flex items-center justify-center">
            <IconFiles size={48} className="text-gray-600" stroke={1.5} />
          </div>
          <button
            onClick={() => handleDownload('text-per-slide')}
            disabled={downloading}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {downloading ? 'Downloading...' : 'Download as Text (Per Slide)'}
          </button>
        </div>
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
