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
}

export default function FontPicker({
  selectedFont,
  onFontChange,
  recommendedGoogleFonts = []
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
    const fontName = selectedFont.replace(/['"]/g, '').split(',')[0].trim();

    // Check if it's a Google Font
    if (googleFonts.includes(fontName)) {
      WebFont.load({
        google: {
          families: [fontName]
        }
      });
    }
  }, [selectedFont, googleFonts]);

  const handleFontSelect = (font: FontOption) => {
    onFontChange(font.family);

    // Load Google Font if needed
    if (font.category === 'google') {
      WebFont.load({
        google: {
          families: [font.name]
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

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Font Family
      </label>

      {/* Selected font display */}
      <div className="relative">
        <select
          value={selectedFont}
          onChange={(e) => {
            const selected = [...customFonts, ...systemFonts].find(f => f.family === e.target.value);
            if (selected) {
              handleFontSelect(selected);
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          style={{ fontFamily: selectedFont }}
        >
          {/* Recommended Custom Fonts */}
          <optgroup label="⭐ Recommended">
            {customFonts.map(font => (
              <option key={font.family} value={font.family}>
                {font.name}
              </option>
            ))}
          </optgroup>

          {/* System Fonts */}
          <optgroup label="System Fonts">
            {systemFonts.map(font => (
              <option key={font.family} value={font.family}>
                {font.name}
              </option>
            ))}
          </optgroup>

          {/* Google Fonts - Recommended First */}
          {recommendedGoogleFonts.length > 0 && (
            <optgroup label="Recommended for Presentations">
              {recommendedGoogleFonts.map(font => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </optgroup>
          )}

          {/* All Google Fonts */}
          <optgroup label="Google Fonts">
            {filteredGoogleFonts
              .filter(font => !recommendedGoogleFonts.includes(font))
              .map(font => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
          </optgroup>
        </select>
      </div>

      {/* Download link for custom fonts */}
      {selectedFontOption.downloadUrl && (
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
      <details className="mt-2">
        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
          Search all Google Fonts
        </summary>
        <div className="mt-2">
          <input
            type="text"
            placeholder="Search Google Fonts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredGoogleFonts.map(font => (
                <button
                  key={font}
                  onClick={() => handleFontSelect({ name: font, family: font, category: 'google' })}
                  className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm"
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              ))}
            </div>
          )}
        </div>
      </details>
    </div>
  );
}
