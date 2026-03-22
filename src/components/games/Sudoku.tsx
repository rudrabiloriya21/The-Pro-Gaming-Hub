import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface SudokuProps {
  onBack: () => void;
}

const Sudoku: React.FC<SudokuProps> = ({ onBack }) => {
  const [grid, setGrid] = useState<(number | null)[][]>([]);
  const [initialGrid, setInitialGrid] = useState<(number | null)[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [errors, setErrors] = useState<[number, number][]>([]);

  const generatePuzzle = () => {
    // Simple static puzzle for now, can be improved with a real generator
    const puzzle = [
      [5, 3, null, null, 7, null, null, null, null],
      [6, null, null, 1, 9, 5, null, null, null],
      [null, 9, 8, null, null, null, null, 6, null],
      [8, null, null, null, 6, null, null, null, 3],
      [4, null, null, 8, null, 3, null, null, 1],
      [7, null, null, null, 2, null, null, null, 6],
      [null, 6, null, null, null, null, 2, 8, null],
      [null, null, null, 4, 1, 9, null, null, 5],
      [null, null, null, null, 8, null, null, 7, 9]
    ];
    setGrid(puzzle.map(row => [...row]));
    setInitialGrid(puzzle.map(row => [...row]));
    setIsComplete(false);
    setErrors([]);
  };

  useEffect(() => {
    generatePuzzle();
  }, []);

  const isValid = (grid: (number | null)[][], row: number, col: number, num: number) => {
    for (let x = 0; x < 9; x++) if (grid[row][x] === num) return false;
    for (let x = 0; x < 9; x++) if (grid[x][col] === num) return false;
    let startRow = row - row % 3, startCol = col - col % 3;
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        if (grid[i + startRow][j + startCol] === num) return false;
    return true;
  };

  const handleCellClick = (row: number, col: number) => {
    if (initialGrid[row][col] === null) {
      setSelectedCell([row, col]);
    }
  };

  const handleNumberInput = (num: number) => {
    if (selectedCell) {
      const [row, col] = selectedCell;
      const newGrid = grid.map(r => [...r]);
      newGrid[row][col] = num;
      setGrid(newGrid);
      
      // Check for errors
      const newErrors: [number, number][] = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (newGrid[r][c] !== null) {
            const val = newGrid[r][c]!;
            newGrid[r][c] = null;
            if (!isValid(newGrid, r, c, val)) {
              newErrors.push([r, c]);
            }
            newGrid[r][c] = val;
          }
        }
      }
      setErrors(newErrors);

      // Check if complete
      const isFull = newGrid.every(row => row.every(cell => cell !== null));
      if (isFull && newErrors.length === 0) {
        setIsComplete(true);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 flex items-center justify-between border-b">
        <button onClick={onBack} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-black">SUDOKU</h2>
        <button onClick={generatePuzzle} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <RotateCcw size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="grid grid-cols-9 border-2 border-black mb-8">
          {grid.map((row, rIdx) => (
            row.map((cell, cIdx) => {
              const isSelected = selectedCell?.[0] === rIdx && selectedCell?.[1] === cIdx;
              const isInitial = initialGrid[rIdx][cIdx] !== null;
              const hasError = errors.some(e => e[0] === rIdx && e[1] === cIdx);
              
              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => handleCellClick(rIdx, cIdx)}
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center text-lg font-bold cursor-pointer
                    border-[0.5px] border-neutral-300
                    ${(rIdx + 1) % 3 === 0 && rIdx !== 8 ? 'border-b-2 border-b-black' : ''}
                    ${(cIdx + 1) % 3 === 0 && cIdx !== 8 ? 'border-r-2 border-r-black' : ''}
                    ${isSelected ? 'bg-emerald-100' : ''}
                    ${isInitial ? 'text-black bg-neutral-50' : 'text-blue-600'}
                    ${hasError ? 'bg-red-100 text-red-600' : ''}
                  `}
                >
                  {cell}
                </div>
              );
            })
          ))}
        </div>

        <div className="grid grid-cols-5 gap-2 w-full max-w-md">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              className="h-12 bg-neutral-100 rounded-xl font-black text-xl hover:bg-black hover:text-white transition-all active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => {
              if (selectedCell) {
                const [row, col] = selectedCell;
                const newGrid = grid.map(r => [...r]);
                newGrid[row][col] = null;
                setGrid(newGrid);
              }
            }}
            className="h-12 bg-neutral-200 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all active:scale-95"
          >
            Clear
          </button>
        </div>
      </div>

      {isComplete && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[40px] p-10 text-center max-w-sm w-full"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-3xl font-black mb-2">PUZZLE SOLVED!</h3>
            <p className="text-neutral-500 mb-8">Your logic is impeccable. Ready for another one?</p>
            <button 
              onClick={generatePuzzle}
              className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg hover:scale-105 transition-all"
            >
              NEW PUZZLE
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Sudoku;
