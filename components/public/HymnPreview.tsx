'use client';

import { useState, useMemo } from 'react';
import { HymnStructure, formatAsSlides, stripPunctuation } from '@/lib/hymn-processor/parser';

interface HymnPreviewProps {
  structure: HymnStructure;
  title: string;
  linesPerSlide: number;
  includeTitleSlide: boolean;
  includeVerseNumbers: boolean;
  stripPunctuation: boolean;
}

export default function HymnPreview({
  structure,
  title,
  linesPerSlide,
  includeTitleSlide,
  includeVerseNumbers,
  stripPunctuation: shouldStripPunctuation
}: HymnPreviewProps) {
  const slides = useMemo(() => formatAsSlides(structure, linesPerSlide), [structure, linesPerSlide]);

  // Track which sections we've seen to only show label on first slide
  const seenSections = new Set<string>();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Preview</h2>
      </div>

      <div className="space-y-4">
        {/* Title Slide */}
        {includeTitleSlide && (
          <div className="bg-gray-900 text-white rounded-lg p-8 flex items-center justify-center min-h-[200px]">
            <h3 className="text-3xl font-bold text-center">{title}</h3>
          </div>
        )}

        {/* Content Slides */}
        {slides.map((slide, index) => {
          // Determine if we should show section label
          let sectionKey: string | null = null;
          let sectionLabel = '';

          if (slide.sectionType === 'verse' && slide.sectionNumber) {
            sectionKey = `verse-${slide.sectionNumber}`;
            sectionLabel = `Verse ${slide.sectionNumber}`;
          } else if (slide.sectionType === 'chorus') {
            sectionKey = 'chorus';
            sectionLabel = 'Refrain';
          } else if (slide.sectionType === 'bridge') {
            sectionKey = 'bridge';
            sectionLabel = 'Bridge';
          }

          const showSectionLabel = sectionKey && !seenSections.has(sectionKey);
          if (sectionKey && !seenSections.has(sectionKey)) {
            seenSections.add(sectionKey);
          }

          // Prepare slide text with verse number/refrain prefix if needed
          let slideLines = [...slide.lines];
          if (includeVerseNumbers) {
            if (slide.sectionType === 'verse' && slide.sectionNumber && showSectionLabel) {
              // Prepend verse number to first line
              slideLines[0] = `${slide.sectionNumber} ${slideLines[0]}`;
            } else if (slide.sectionType === 'chorus' && showSectionLabel) {
              // Prepend "Refrain: " to first line of chorus
              slideLines[0] = `Refrain: ${slideLines[0]}`;
            }
          }

          // Apply punctuation stripping if requested
          if (shouldStripPunctuation) {
            slideLines = slideLines.map(line => stripPunctuation(line));
          }

          return (
            <div key={index}>
              {/* Section header - only on first slide of each section */}
              {showSectionLabel && (
                <div className="text-sm font-medium text-gray-600 mb-2 px-2">
                  {sectionLabel}
                </div>
              )}
              <div className="bg-gray-900 text-white rounded-lg p-8 flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  {slideLines.map((line, lineIndex) => (
                    <p key={lineIndex} className="text-2xl mb-2">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t text-sm text-gray-600">
        <p>
          Total slides: {(includeTitleSlide ? 1 : 0) + slides.length}
        </p>
      </div>
    </div>
  );
}
