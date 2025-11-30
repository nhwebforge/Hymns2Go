'use client';

export default function AlphabetNav() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const scrollToLetter = (letter: string) => {
    // Navigate to hymns starting with this letter
    window.location.href = `/hymns?startsWith=${letter}`;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-4 border border-gray-100 mb-8 sticky top-24 z-40">
      <div className="flex flex-wrap justify-center gap-2">
        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => scrollToLetter(letter)}
            className="w-9 h-9 rounded-lg font-bold text-gray-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md"
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}
