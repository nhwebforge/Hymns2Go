'use client';

import { useState } from 'react';
import { HymnStructure, formatAsSlides } from '@/lib/hymn-processor/parser';

interface HymnPreviewProps {
  structure: HymnStructure;
  title: string;
}

export default function HymnPreview({ structure, title }: HymnPreviewProps) {
  const [linesPerSlide, setLinesPerSlide] = useState(2);
  const slides = formatAsSlides(structure, linesPerSlide);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Preview</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Lines per slide:</label>
          <select
            value={linesPerSlide}
            onChange={(e) => setLinesPerSlide(parseInt(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={6}>6</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {/* Title Slide */}
        <div className="bg-gray-900 text-white rounded-lg p-8 flex items-center justify-center min-h-[200px]">
          <h3 className="text-3xl font-bold text-center">{title}</h3>
        </div>

        {/* Content Slides */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className="bg-gray-900 text-white rounded-lg p-8 flex items-center justify-center min-h-[200px]"
          >
            <div className="text-center">
              {slide.lines.map((line, lineIndex) => (
                <p key={lineIndex} className="text-2xl mb-2">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t text-sm text-gray-600">
        <p>
          Total slides: {slides.length + 1} (including title slide)
        </p>
      </div>
    </div>
  );
}
