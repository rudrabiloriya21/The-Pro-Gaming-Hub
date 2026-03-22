import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, CheckCircle2, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WordSearchProps {
  onBack: () => void;
}

const WordSearch: React.FC<WordSearchProps> = ({ onBack }) => {
  const [grid, setGrid] = useState<string[][]>([]);
  const [words, setWords] = useState<{ word: string, found: boolean }[]>([]);
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const wordList = ['GAMING', 'HUB', 'PRO', 'SNAKE', 'TETRIS', 'PUZZLE', 'ARCADE', 'LEVEL', 'SCORE', 'WINNER'];

  const generateGrid = () => {
    const size = 10;
    const newGrid = Array(size).fill(null).map(() => Array(size).fill(''));
    const selectedWords = wordList.sort(() => Math.random() - 0.5).slice(0, 6);
    const wordsToFind = selectedWords.map(word => ({ word, found: false }));

    selectedWords.forEach(word => {
      let placed = false;
      while (!placed) {
        const direction = Math.random() > 0.5 ? 'H' : 'V';
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);

        if (direction === 'H' && col + word.length <= size) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            if (newGrid[row][col + i] !== '' && newGrid[row][col + i] !== word[i]) {
              canPlace = false;
              break;
            }
          }
          if (canPlace) {
            for (let i = 0; i < word.length; i++) newGrid[row][col + i] = word[i];
            placed = true;
          }
        } else if (direction === 'V' && row + word.length <= size) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            if (newGrid[row + i][col] !== '' && newGrid[row + i][col] !== word[i]) {
              canPlace = false;
              break;
            }
          }
          if (canPlace) {
            for (let i = 0; i < word.length; i++) newGrid[row + i][col] = word[i];
            placed = true;
          }
        }
      }
    });

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (newGrid[r][c] === '') {
          newGrid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }

    setGrid(newGrid);
    setWords(wordsToFind);
    setIsComplete(false);
    setSelectedCells([]);
  };

  useEffect(() => {
    generateGrid();
  }, []);

  const handleCellStart = (r: number, c: number) => {
    setIsDragging(true);
    setSelectedCells([[r, c]]);
  };

  const handleCellEnter = (r: number, c: number) => {
    if (isDragging) {
      const start = selectedCells[0];
      const newCells: [number, number][] = [];
      
      if (start[0] === r) {
        const min = Math.min(start[1], c);
        const max = Math.max(start[1], c);
        for (let i = min; i <= max; i++) newCells.push([r, i]);
      } else if (start[1] === c) {
        const min = Math.min(start[0], r);
        const max = Math.max(start[0], r);
        for (let i = min; i <= max; i++) newCells.push([i, c]);
      }
      
      if (newCells.length > 0) setSelectedCells(newCells);
    }
  };

  const handleCellEnd = () => {
    setIsDragging(false);
    const selectedWord = selectedCells.map(([r, c]) => grid[r][c]).join('');
    const reversedWord = selectedWord.split('').reverse().join('');
    
    const wordIdx = words.findIndex(w => (w.word === selectedWord || w.word === reversedWord) && !w.found);
    
    if (wordIdx !== -1) {
      const newWords = [...words];
      newWords[wordIdx].found = true;
      setWords(newWords);
      
      if (newWords.every(w => w.found)) {
        setIsComplete(true);
      }
    }
    setSelectedCells([]);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 flex items-center justify-between border-b">
        <button onClick={onBack} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-black">WORD SEARCH</h2>
        <button onClick={generateGrid} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <RotateCcw size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto">
        <div className="grid grid-cols-10 gap-1 bg-neutral-200 p-1 rounded-xl mb-8 select-none" onMouseUp={handleCellEnd} onTouchEnd={handleCellEnd}>
          {grid.map((row, rIdx) => (
            row.map((cell, cIdx) => {
              const isSelected = selectedCells.some(s => s[0] === rIdx && s[1] === cIdx);
              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  onMouseDown={() => handleCellStart(rIdx, cIdx)}
                  onMouseEnter={() => handleCellEnter(rIdx, cIdx)}
                  onTouchStart={() => handleCellStart(rIdx, cIdx)}
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-lg font-black rounded-lg cursor-pointer transition-all
                    ${isSelected ? 'bg-emerald-500 text-white scale-110' : 'bg-white text-neutral-800 hover:bg-neutral-50'}
                  `}
                >
                  {cell}
                </div>
              );
            })
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-md">
          {words.map((w, idx) => (
            <div 
              key={idx} 
              className={`
                p-3 rounded-xl text-center font-black text-sm tracking-widest border-2 transition-all
                ${w.found ? 'bg-emerald-100 border-emerald-500 text-emerald-600 scale-95 opacity-50' : 'bg-neutral-50 border-neutral-200 text-neutral-400'}
              `}
            >
              {w.word}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isComplete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[40px] p-10 text-center max-w-sm w-full"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-3xl font-black mb-2">WORDS FOUND!</h3>
              <p className="text-neutral-500 mb-8">You have a sharp eye for detail. Ready for more?</p>
              <button 
                onClick={generateGrid}
                className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg hover:scale-105 transition-all"
              >
                PLAY AGAIN
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WordSearch;
