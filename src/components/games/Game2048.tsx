import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Game2048Props {
  onBack: () => void;
}

type Grid = (number | null)[][];

export default function Game2048({ onBack }: Game2048Props) {
  const [grid, setGrid] = useState<Grid>(Array(4).fill(null).map(() => Array(4).fill(null)));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(Number(localStorage.getItem('2048BestScore') || 0));
  const [gameOver, setGameOver] = useState(false);

  const addRandomTile = useCallback((currentGrid: Grid) => {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentGrid[r][c] === null) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return currentGrid;
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = currentGrid.map(row => [...row]);
    newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  }, []);

  const initializeGame = useCallback(() => {
    let newGrid = Array(4).fill(null).map(() => Array(4).fill(null));
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
  }, [addRandomTile]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;

    setGrid(prevGrid => {
      let newGrid = prevGrid.map(row => [...row]);
      let moved = false;
      let addedScore = 0;

      const rotate = (g: Grid) => {
        const rotated: Grid = Array(4).fill(null).map(() => Array(4).fill(null));
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            rotated[c][3 - r] = g[r][c];
          }
        }
        return rotated;
      };

      // Normalize to 'left' move
      let rotations = 0;
      if (direction === 'up') rotations = 3;
      if (direction === 'right') rotations = 2;
      if (direction === 'down') rotations = 1;

      for (let i = 0; i < rotations; i++) newGrid = rotate(newGrid);

      // Process rows
      for (let r = 0; r < 4; r++) {
        let row = newGrid[r].filter(val => val !== null) as number[];
        for (let i = 0; i < row.length - 1; i++) {
          if (row[i] === row[i + 1]) {
            row[i] *= 2;
            addedScore += row[i];
            row.splice(i + 1, 1);
            moved = true;
            if (row[i] === 2048) {
              confetti({ particleCount: 200, spread: 100 });
            }
          }
        }
        const newRow = [...row, ...Array(4 - row.length).fill(null)];
        if (JSON.stringify(newRow) !== JSON.stringify(newGrid[r])) moved = true;
        newGrid[r] = newRow;
      }

      // Rotate back
      for (let i = 0; i < (4 - rotations) % 4; i++) newGrid = rotate(newGrid);

      if (moved) {
        newGrid = addRandomTile(newGrid);
        setScore(s => {
          const newScore = s + addedScore;
          if (newScore > bestScore) {
            setBestScore(newScore);
            localStorage.setItem('2048BestScore', newScore.toString());
          }
          return newScore;
        });
        
        // Check game over
        let canMove = false;
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            if (newGrid[r][c] === null) canMove = true;
            if (c < 3 && newGrid[r][c] === newGrid[r][c + 1]) canMove = true;
            if (r < 3 && newGrid[r][c] === newGrid[r + 1][c]) canMove = true;
          }
        }
        if (!canMove) setGameOver(true);
      }

      return newGrid;
    });
  }, [gameOver, addRandomTile, bestScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') move('up');
      if (e.key === 'ArrowDown') move('down');
      if (e.key === 'ArrowLeft') move('left');
      if (e.key === 'ArrowRight') move('right');
    };
    window.addEventListener('keydown', handleKeyDown);

    // Swipe support
    let touchStartX = 0;
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > 30) move(dx > 0 ? 'right' : 'left');
      } else {
        if (Math.abs(dy) > 30) move(dy > 0 ? 'down' : 'up');
      }
    };
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [move]);

  const getTileColor = (val: number | null) => {
    if (!val) return 'bg-neutral-200';
    const colors: Record<number, string> = {
      2: 'bg-neutral-100 text-neutral-800',
      4: 'bg-neutral-200 text-neutral-800',
      8: 'bg-orange-200 text-neutral-800',
      16: 'bg-orange-300 text-white',
      32: 'bg-orange-400 text-white',
      64: 'bg-orange-500 text-white',
      128: 'bg-yellow-300 text-white text-2xl',
      256: 'bg-yellow-400 text-white text-2xl',
      512: 'bg-yellow-500 text-white text-2xl',
      1024: 'bg-yellow-600 text-white text-xl',
      2048: 'bg-yellow-700 text-white text-xl',
    };
    return colors[val] || 'bg-neutral-900 text-white';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-4">
      <div className="w-full max-w-sm flex justify-between items-center mb-8">
        <button onClick={onBack} className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-600">
          <ArrowLeft size={24} />
        </button>
        <div className="flex gap-4">
          <div className="bg-neutral-200 px-4 py-2 rounded-xl text-center min-w-[80px]">
            <p className="text-[10px] uppercase font-bold text-neutral-500">Score</p>
            <p className="text-xl font-black text-neutral-800">{score}</p>
          </div>
          <div className="bg-neutral-200 px-4 py-2 rounded-xl text-center min-w-[80px]">
            <p className="text-[10px] uppercase font-bold text-neutral-500">Best</p>
            <p className="text-xl font-black text-neutral-800">{bestScore}</p>
          </div>
        </div>
      </div>

      <div className="bg-neutral-300 p-3 rounded-2xl shadow-inner relative">
        <div className="grid grid-cols-4 gap-3 w-[min(90vw,340px)] h-[min(90vw,340px)]">
          {grid.flat().map((val, i) => (
            <div 
              key={i} 
              className={`w-full h-full rounded-xl flex items-center justify-center text-3xl font-black transition-all duration-100 transform ${getTileColor(val)} ${val ? 'scale-100 shadow-sm' : 'scale-95 opacity-50'}`}
            >
              {val}
            </div>
          ))}
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10">
            <h2 className="text-4xl font-black text-neutral-800 mb-2">Game Over!</h2>
            <p className="text-neutral-600 mb-8 font-medium">Final Score: {score}</p>
            <button 
              onClick={initializeGame}
              className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-4 px-10 rounded-2xl transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <RotateCcw size={20} />
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="mt-12 grid grid-cols-3 gap-3 w-full max-w-[180px]">
        <div />
        <button onClick={() => move('up')} className="p-4 bg-white border-2 border-neutral-200 rounded-2xl hover:border-neutral-400 active:scale-90 transition-all flex justify-center shadow-sm"><ArrowLeft className="rotate-90 text-neutral-600" /></button>
        <div />
        <button onClick={() => move('left')} className="p-4 bg-white border-2 border-neutral-200 rounded-2xl hover:border-neutral-400 active:scale-90 transition-all flex justify-center shadow-sm"><ArrowLeft className="text-neutral-600" /></button>
        <button onClick={() => move('down')} className="p-4 bg-white border-2 border-neutral-200 rounded-2xl hover:border-neutral-400 active:scale-90 transition-all flex justify-center shadow-sm"><ArrowLeft className="-rotate-90 text-neutral-600" /></button>
        <button onClick={() => move('right')} className="p-4 bg-white border-2 border-neutral-200 rounded-2xl hover:border-neutral-400 active:scale-90 transition-all flex justify-center shadow-sm"><ArrowLeft className="rotate-180 text-neutral-600" /></button>
      </div>

      <p className="mt-8 text-neutral-400 text-sm font-medium">Swipe or use arrow keys to join tiles!</p>
    </div>
  );
}
