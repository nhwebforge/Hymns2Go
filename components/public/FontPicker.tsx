'use client';

import { useState, useEffect } from 'react';
import WebFont from 'webfontloader';

export interface FontOption {
  name: string;
  family: string;
  category: 'recommended' | 'google' | 'system';
  downloadUrl?: string;
  description?: string;
}

interface FontPickerProps {
  selectedFont: string;
  onFontChange: (fontFamily: string) => void;
  recommendedGoogleFonts?: string[];
  disabled?: boolean;
}

export default function FontPicker({
  selectedFont,
  onFontChange,
  recommendedGoogleFonts = [],
  disabled = false
}: FontPickerProps) {
  const [googleFonts, setGoogleFonts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingFonts, setIsLoadingFonts] = useState(false);

  // Recommended custom fonts
  const customFonts: FontOption[] = [
    {
      name: 'CMG Sans',
      family: 'CMG Sans',
      category: 'recommended',
      downloadUrl: '/fonts/CMG-Sans.zip',
      description: 'Designed specifically for church presentations'
    },
    {
      name: 'FS Me',
      family: 'FS Me',
      category: 'recommended',
      downloadUrl: '/fonts/FS_Me.zip',
      description: 'Highly accessible font with excellent readability'
    }
  ];

  // System fonts (widely available on Windows/Mac)
  const systemFonts: FontOption[] = [
    { name: 'Arial', family: 'Arial, sans-serif', category: 'system' },
    { name: 'Helvetica', family: 'Helvetica, sans-serif', category: 'system' },
    { name: 'Calibri', family: 'Calibri, sans-serif', category: 'system' },
    { name: 'Verdana', family: 'Verdana, sans-serif', category: 'system' },
    { name: 'Tahoma', family: 'Tahoma, sans-serif', category: 'system' },
    { name: 'Trebuchet MS', family: '"Trebuchet MS", sans-serif', category: 'system' },
    { name: 'Georgia', family: 'Georgia, serif', category: 'system' },
    { name: 'Times New Roman', family: '"Times New Roman", serif', category: 'system' },
  ];

  // Recommended Google Fonts for presentations
  const defaultRecommendedFonts = [
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Inter',
    'Noto Sans',
    'Fira Sans',
    'Source Sans Pro',
    'Raleway',
    'Nunito',
    'Quicksand',
    'Poppins',
    'League Spartan',
    'Archivo Black',
    'Playfair Display',
    'Libre Baskerville',
    'Lora',
    'Merriweather',
    'Dosis',
    'Mulish'
  ];

  // Fetch Google Fonts list
  useEffect(() => {
    const fetchGoogleFonts = async () => {
      setIsLoadingFonts(true);
      try {
        // Combine recommended fonts with any additional ones passed in
        const recommended = recommendedGoogleFonts.length > 0
          ? recommendedGoogleFonts
          : defaultRecommendedFonts;

        // Add more popular Google Fonts for the extended list
        const additionalFonts = [
          'Ubuntu', 'PT Sans', 'Rubik', 'Oswald', 'Barlow',
          'Work Sans', 'Karla', 'DM Sans', 'Outfit', 'Manrope',
          'Space Grotesk', 'Exo 2', 'Bebas Neue', 'Anton',
          'Crimson Text', 'Cormorant', 'EB Garamond', 'Bitter'
        ];

        setGoogleFonts([...recommended, ...additionalFonts]);
      } catch (error) {
        console.error('Failed to fetch Google Fonts:', error);
      } finally {
        setIsLoadingFonts(false);
      }
    };

    fetchGoogleFonts();
  }, [recommendedGoogleFonts]);

  // Load selected font if it's a Google Font
  useEffect(() => {
    if (disabled) return;

    const fontName = selectedFont.replace(/['"]/g, '').split(',')[0].trim();

    // Check if it's a Google Font
    if (googleFonts.includes(fontName)) {
      WebFont.load({
        google: {
          families: [fontName]
        }
      });
    }
  }, [selectedFont, googleFonts, disabled]);

  const handleFontSelect = (fontFamily: string) => {
    if (disabled) return;

    onFontChange(fontFamily);

    // Load Google Font if needed
    const fontName = fontFamily.replace(/['"]/g, '').split(',')[0].trim();
    if (googleFonts.includes(fontName)) {
      WebFont.load({
        google: {
          families: [fontName]
        }
      });
    }
  };

  // Filter fonts based on search
  const filteredGoogleFonts = googleFonts.filter(font =>
    font.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedFontOption =
    customFonts.find(f => f.family === selectedFont) ||
    systemFonts.find(f => f.family === selectedFont) ||
    { name: selectedFont.replace(/['"]/g, '').split(',')[0], family: selectedFont, category: 'google' as const };

  // Get recommended fonts (first 20 in googleFonts array)
  const recommendedFonts = googleFonts.slice(0, 20);
  const allOtherFonts = googleFonts.slice(20);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Font Family
      </label>

      {/* Selected font display with dropdown */}
      <div className="relative">
        <select
          value={selectedFont}
          onChange={(e) => handleFontSelect(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ fontFamily: disabled ? undefined : selectedFont }}
        >
          {/* Recommended Custom Fonts */}
          <optgroup label="⭐ Recommended">
            {customFonts.map(font => (
              <option key={font.family} value={font.family} style={{ fontFamily: font.family }}>
                {font.name}
              </option>
            ))}
          </optgroup>

          {/* System Fonts */}
          <optgroup label="System Fonts">
            {systemFonts.map(font => (
              <option key={font.family} value={font.family} style={{ fontFamily: font.family }}>
                {font.name}
              </option>
            ))}
          </optgroup>

          {/* Recommended Google Fonts */}
          <optgroup label="Recommended for Presentations">
            {recommendedFonts.map(font => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </optgroup>

          {/* All Other Google Fonts */}
          {allOtherFonts.length > 0 && (
            <optgroup label="More Google Fonts">
              {allOtherFonts.map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {/* Download link for custom fonts */}
      {!disabled && selectedFontOption.downloadUrl && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">
            {selectedFontOption.description}
          </span>
          <a
            href={selectedFontOption.downloadUrl}
            download
            className="text-blue-600 hover:text-blue-700 font-medium underline"
          >
            Download Font
          </a>
        </div>
      )}

      {/* Google Font search */}
      {!disabled && (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-medium">
            🔍 Search all Google Fonts
          </summary>
          <div className="mt-3 space-y-2">
            <input
              type="text"
              placeholder="Type to search Google Fonts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && filteredGoogleFonts.length > 0 && (
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg bg-white shadow-sm">
                {filteredGoogleFonts.map(font => (
                  <button
                    key={font}
                    onClick={() => {
                      handleFontSelect(font);
                      setSearchTerm(''); // Clear search after selection
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors text-gray-900"
                    style={{ fontFamily: font }}
                  >
                    <div className="font-medium text-base">{font}</div>
                    <div className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: font }}>
                      The quick brown fox jumps over the lazy dog
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchTerm && filteredGoogleFonts.length === 0 && (
              <div className="text-sm text-gray-500 py-2 px-3">
                No fonts found matching "{searchTerm}"
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
}
