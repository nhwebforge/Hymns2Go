'use client';

import { useState, useMemo } from 'react';
import { IconCheck } from '@tabler/icons-react';
import { HymnStructure, formatAsSlides, stripPunctuation } from '@/lib/hymn-processor/parser';

interface HymnPreviewProps {
  structure: HymnStructure;
  title: string;
  linesPerSlide: number;
  includeTitleSlide: boolean;
  includeVerseNumbers: boolean;
  stripPunctuation: boolean;
  onSlidesChange?: (slides: { slideIndex: number; lines: string[] }[]) => void;
  fontFamily?: string;
  backgroundColor?: string;
  textColor?: string;
  includeShadow?: boolean;
  includeOutline?: boolean;
  outlineColor?: string;
}

export default function HymnPreview({
  structure,
  title,
  linesPerSlide,
  includeTitleSlide,
  includeVerseNumbers,
  stripPunctuation: shouldStripPunctuation,
  onSlidesChange,
  fontFamily = 'CMG Sans',
  backgroundColor = '#1F2937',
  textColor = '#FFFFFF',
  includeShadow = false,
  includeOutline = false,
  outlineColor = '#000000'
}: HymnPreviewProps) {
  const baseSlides = useMemo(() => formatAsSlides(structure, linesPerSlide), [structure, linesPerSlide]);

  // Store temporary edits: Map of slideIndex -> edited lines
  const [editedSlides, setEditedSlides] = useState<Map<number, string[]>>(new Map());
  const [editingSlide, setEditingSlide] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  // Track which sections we've seen to only show label on first slide
  const seenSections = new Set<string>();

  // Generate text style with shadow and outline
  const getTextStyle = (isTitle: boolean = false) => {
    const styles: React.CSSProperties = {
      fontFamily: fontFamily,
      color: textColor
    };

    const shadows: string[] = [];

    // Add text shadow (bottom-right at 315 degrees, 5px offset)
    if (includeShadow) {
      // Calculate shadow offset for 315 degrees (bottom-right)
      // 315 degrees = -45 degrees from horizontal
      // In CSS, positive Y goes DOWN, so we negate the Y value
      const angle = 315 * (Math.PI / 180);
      const distance = 5;
      const x = Math.cos(angle) * distance;
      const y = -Math.sin(angle) * distance; // Negate because CSS Y axis is inverted
      shadows.push(`${x}px ${y}px 0px rgba(0, 0, 0, 1)`);
    }

    // Add text outline/stroke (3px)
    if (includeOutline) {
      const strokeWidth = 3;
      // Create multiple shadows in a circle to simulate stroke
      for (let i = 0; i < 8; i++) {
        const angle = (i * 45) * (Math.PI / 180);
        const x = Math.cos(angle) * strokeWidth;
        const y = Math.sin(angle) * strokeWidth;
        shadows.push(`${x}px ${y}px 0px ${outlineColor}`);
      }
    }

    if (shadows.length > 0) {
      styles.textShadow = shadows.join(', ');
    }

    if (isTitle) {
      styles.fontWeight = 'bold';
    }

    return styles;
  };

  // Get the lines for a slide, using edited version if available
  const getSlideLines = (slideIndex: number, originalLines: string[]) => {
    return editedSlides.get(slideIndex) || originalLines;
  };

  // Handle clicking a slide to edit
  const handleSlideClick = (slideIndex: number, currentLines: string[]) => {
    setEditingSlide(slideIndex);
    setEditText(currentLines.join('\n'));
  };

  // Handle saving edits
  const handleSaveEdit = () => {
    if (editingSlide === null) return;

    const newLines = editText.split('\n').filter(line => line.trim());
    const originalLines = getSlideLines(editingSlide, baseSlides[editingSlide].lines);

    // Check if there are actual changes
    const hasChanges = newLines.length !== originalLines.length ||
                       newLines.some((line, i) => line !== originalLines[i]);

    if (hasChanges) {
      const newEditedSlides = new Map(editedSlides);
      newEditedSlides.set(editingSlide, newLines);
      setEditedSlides(newEditedSlides);

      // Notify parent component of changes if callback provided
      if (onSlidesChange) {
        const allEdits = Array.from(newEditedSlides.entries()).map(([slideIndex, lines]) => ({
          slideIndex,
          lines
        }));
        onSlidesChange(allEdits);
      }
    }

    setEditingSlide(null);
    setEditText('');
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingSlide(null);
    setEditText('');
  };

  // Handle resetting all edits
  const handleResetAllEdits = () => {
    setEditedSlides(new Map());
    if (onSlidesChange) {
      onSlidesChange([]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Preview</h2>
        {editedSlides.size > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-blue-600 font-medium">
              {editedSlides.size} slide{editedSlides.size > 1 ? 's' : ''} edited
            </span>
            <button
              onClick={handleResetAllEdits}
              className="text-sm text-gray-600 hover:text-red-600 font-medium underline"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingSlide !== null && (() => {
        const originalLines = getSlideLines(editingSlide, baseSlides[editingSlide].lines);
        const currentLines = editText.split('\n').filter(line => line.trim());
        const hasChanges = currentLines.length !== originalLines.length ||
                          currentLines.some((line, i) => line !== originalLines[i]);

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <h3 className="text-xl font-bold mb-4">Edit Slide</h3>
              <p className="text-sm text-gray-600 mb-4">
                Edit the text below. Changes are temporary and won't be saved to the database.
              </p>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter slide text (one line per paragraph)"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSaveEdit}
                  disabled={!hasChanges}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        {/* Title Slide */}
        {includeTitleSlide && (
          <div className="flex flex-col">
            <div className="text-xs font-medium text-gray-600 mb-1 px-2">
              Title
            </div>
            <div
              className={`rounded-lg p-6 flex items-center justify-center aspect-[16/9] ${backgroundColor === 'transparent' ? 'bg-checkerboard' : ''}`}
              style={{
                backgroundColor: backgroundColor === 'transparent' ? undefined : backgroundColor
              }}
            >
              <h3 className="text-2xl text-center" style={getTextStyle(true)}>{title}</h3>
            </div>
          </div>
        )}

        {/* Content Slides */}
        {baseSlides.map((slide, index) => {
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

          // Get the slide lines (use edited version if available, otherwise original)
          let slideLines = getSlideLines(index, [...slide.lines]);

          // Prepare slide text with verse number/refrain prefix if needed
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

          const isEdited = editedSlides.has(index);

          return (
            <div key={index} className="flex flex-col">
              {/* Section header - only on first slide of each section */}
              {showSectionLabel && (
                <div className="text-xs font-medium text-gray-600 mb-1 px-2 flex items-center gap-2">
                  {sectionLabel}
                  {isEdited && (
                    <span className="text-blue-600 flex items-center gap-1">
                      <IconCheck size={14} />
                      Edited
                    </span>
                  )}
                </div>
              )}
              <div
                onClick={() => handleSlideClick(index, getSlideLines(index, [...slide.lines]))}
                className={`rounded-lg p-6 flex items-center justify-center aspect-[16/9] cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all relative group ${backgroundColor === 'transparent' ? 'bg-checkerboard' : ''}`}
                style={{
                  backgroundColor: backgroundColor === 'transparent' ? undefined : backgroundColor
                }}
              >
                {isEdited && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
                <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 rounded-lg transition-all"></div>
                <div className="text-center space-y-4 relative z-10">
                  {slideLines.map((line, lineIndex) => (
                    <p key={lineIndex} className="text-lg leading-tight" style={getTextStyle()}>
                      {line}
                    </p>
                  ))}
                </div>
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-white/70">Click to edit</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t text-sm text-gray-600">
        <p>
          Total slides: {(includeTitleSlide ? 1 : 0) + baseSlides.length}
        </p>
      </div>
    </div>
  );
}
