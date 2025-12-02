'use client';

import { useState, useEffect, useRef } from 'react';
import { HymnStructure } from '@/lib/hymn-processor/parser';
import DownloadOptions from './DownloadOptions';
import HymnPreview from './HymnPreview';

interface HymnViewClientProps {
  hymnId: string;
  hymnTitle: string;
  structure: HymnStructure;
}

interface FormattingPreferences {
  includeFormatting: boolean;
  fontFamily: string;
  backgroundColor: string;
  textColor: string;
  includeShadow: boolean;
  includeOutline: boolean;
  outlineColor: string;
}

const PREFERENCES_KEY = 'hymns2go-formatting-preferences';

export default function HymnViewClient({
  hymnId,
  hymnTitle,
  structure
}: HymnViewClientProps) {
  const [linesPerSlide, setLinesPerSlide] = useState(2);
  const [includeVerseNumbers, setIncludeVerseNumbers] = useState(false);
  const [includeTitleSlide, setIncludeTitleSlide] = useState(true);
  const [stripPunctuation, setStripPunctuation] = useState(true);
  const [editedSlides, setEditedSlides] = useState<{ slideIndex: number; lines: string[] }[]>([]);

  // Track if we've loaded preferences to avoid saving on initial render
  const hasLoadedPreferences = useRef(false);

  // Default values for formatting
  const defaultFontFamily = 'CMG Sans';
  const defaultBackgroundColor = '#000000';
  const defaultTextColor = '#FFFFFF';
  const defaultOutlineColor = '#000000';

  // Formatting options - will be initialized from localStorage
  const [includeFormatting, setIncludeFormatting] = useState(false);
  const [fontFamily, setFontFamily] = useState(defaultFontFamily);
  const [backgroundColor, setBackgroundColor] = useState(defaultBackgroundColor);
  const [textColor, setTextColor] = useState(defaultTextColor);
  const [includeShadow, setIncludeShadow] = useState(false);
  const [includeOutline, setIncludeOutline] = useState(false);
  const [outlineColor, setOutlineColor] = useState(defaultOutlineColor);

  // Load saved preferences on mount
  useEffect(() => {
    // Ensure we're in the browser
    if (typeof window === 'undefined') return;

    try {
      const savedPreferences = localStorage.getItem(PREFERENCES_KEY);
      console.log('Loading preferences:', savedPreferences);

      if (savedPreferences) {
        const prefs: FormattingPreferences = JSON.parse(savedPreferences);
        setIncludeFormatting(prefs.includeFormatting ?? false);
        setFontFamily(prefs.fontFamily ?? defaultFontFamily);
        setBackgroundColor(prefs.backgroundColor ?? defaultBackgroundColor);
        setTextColor(prefs.textColor ?? defaultTextColor);
        setIncludeShadow(prefs.includeShadow ?? false);
        setIncludeOutline(prefs.includeOutline ?? false);
        setOutlineColor(prefs.outlineColor ?? defaultOutlineColor);
      }
    } catch (error) {
      console.error('Failed to load formatting preferences:', error);
    } finally {
      // Mark as loaded after a small delay to ensure state updates complete
      setTimeout(() => {
        hasLoadedPreferences.current = true;
      }, 100);
    }
  }, [defaultFontFamily, defaultBackgroundColor, defaultTextColor, defaultOutlineColor]);

  // Save preferences whenever they change (but not on initial load)
  useEffect(() => {
    if (!hasLoadedPreferences.current || typeof window === 'undefined') return;

    const preferences: FormattingPreferences = {
      includeFormatting,
      fontFamily,
      backgroundColor,
      textColor,
      includeShadow,
      includeOutline,
      outlineColor,
    };
    console.log('Saving preferences:', preferences);
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  }, [includeFormatting, fontFamily, backgroundColor, textColor, includeShadow, includeOutline, outlineColor]);

  // Reset to defaults when formatting is disabled
  const handleFormattingToggle = (enabled: boolean) => {
    setIncludeFormatting(enabled);
    if (!enabled) {
      setFontFamily(defaultFontFamily);
      setBackgroundColor(defaultBackgroundColor);
      setTextColor(defaultTextColor);
      setIncludeShadow(false);
      setIncludeOutline(false);
      setOutlineColor(defaultOutlineColor);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Download Options */}
      <div className="lg:col-span-1">
        <DownloadOptions
          hymnId={hymnId}
          hymnTitle={hymnTitle}
          linesPerSlide={linesPerSlide}
          setLinesPerSlide={setLinesPerSlide}
          includeVerseNumbers={includeVerseNumbers}
          setIncludeVerseNumbers={setIncludeVerseNumbers}
          includeTitleSlide={includeTitleSlide}
          setIncludeTitleSlide={setIncludeTitleSlide}
          stripPunctuation={stripPunctuation}
          setStripPunctuation={setStripPunctuation}
          editedSlides={editedSlides}
          includeFormatting={includeFormatting}
          setIncludeFormatting={handleFormattingToggle}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
          textColor={textColor}
          setTextColor={setTextColor}
          includeShadow={includeShadow}
          setIncludeShadow={setIncludeShadow}
          includeOutline={includeOutline}
          setIncludeOutline={setIncludeOutline}
          outlineColor={outlineColor}
          setOutlineColor={setOutlineColor}
        />
      </div>

      {/* Preview */}
      <div className="lg:col-span-2">
        <HymnPreview
          structure={structure}
          title={hymnTitle}
          linesPerSlide={linesPerSlide}
          includeTitleSlide={includeTitleSlide}
          includeVerseNumbers={includeVerseNumbers}
          stripPunctuation={stripPunctuation}
          onSlidesChange={setEditedSlides}
          fontFamily={fontFamily}
          backgroundColor={backgroundColor}
          textColor={includeFormatting ? textColor : '#FFFFFF'}
          includeShadow={includeFormatting && includeShadow}
          includeOutline={includeFormatting && includeOutline}
          outlineColor={outlineColor}
        />
      </div>
    </div>
  );
}
