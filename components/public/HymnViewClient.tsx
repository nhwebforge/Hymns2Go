'use client';

import { useState } from 'react';
import { HymnStructure } from '@/lib/hymn-processor/parser';
import DownloadOptions from './DownloadOptions';
import HymnPreview from './HymnPreview';

interface HymnViewClientProps {
  hymnId: string;
  hymnTitle: string;
  structure: HymnStructure;
}

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

  // Formatting options
  const [includeFormatting, setIncludeFormatting] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [includeShadow, setIncludeShadow] = useState(false);
  const [includeOutline, setIncludeOutline] = useState(false);
  const [outlineColor, setOutlineColor] = useState('#000000');

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
          setIncludeFormatting={setIncludeFormatting}
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
          backgroundColor={includeFormatting ? backgroundColor : '#1F2937'}
          textColor={includeFormatting ? textColor : '#FFFFFF'}
        />
      </div>
    </div>
  );
}
