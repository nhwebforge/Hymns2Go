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
  const [stripPunctuation, setStripPunctuation] = useState(false);

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
        />
      </div>
    </div>
  );
}
