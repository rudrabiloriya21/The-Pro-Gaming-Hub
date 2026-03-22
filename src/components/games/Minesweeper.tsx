import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Bomb, Flag, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MinesweeperProps {
  onBack: () => void;
}

const SIZE = 10;
const MINES_COUNT = 15;

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export default function Minesweeper({ onBack }: MinesweeperProps) {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [minesLeft, setMinesLeft] = useState(MINES_COUNT);
  const [flagMode, setFlagMode] = useState(false);

  const initGrid = useCallback(() => {
    const newGrid: Cell[][] = Array(SIZE).fill(null).map(() => 
      Array(SIZE).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    );

    // Place mines
    let placed = 0;
    while (placed < MINES_COUNT) {
      const r = Math.floor(Math.random() * SIZE);
      const c = Math.floor(Math.random() * SIZE);
      if (!newGrid[r][c].isMine) {
        newGrid[r][c].isMine = true;
        placed++;
      }
    }

    // Calculate neighbors
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && newGrid[nr][nc].isMine) {
                count++;
              }
            }
          }
          newGrid[r][c].neighborMines = count;
        }
      }
    }

    setGrid(newGrid);
    setGameOver(false);
    setWin(false);
    setMinesLeft(MINES_COUNT);
  }, []);

  useEffect(() => {
    initGrid();
  }, [initGrid]);

  const revealCell = (r: number, c: number) => {
    if (gameOver || win || grid[r][c].isRevealed) return;

    if (flagMode) {
      toggleFlag(null, r, c);
      return;
    }

    if (grid[r][c].isFlagged) return;

    const newGrid = [...grid.map(row => [...row])];
    
    if (newGrid[r][c].isMine) {
      // Reveal all mines
      newGrid.forEach(row => row.forEach(cell => {
        if (cell.isMine) cell.isRevealed = true;
      }));
      setGrid(newGrid);
      setGameOver(true);
      return;
    }

    const revealRecursive = (row: number, col: number) => {
      if (row < 0 || row >= SIZE || col < 0 || col >= SIZE || newGrid[row][col].isRevealed || newGrid[row][col].isFlagged) return;
      
      newGrid[row][col].isRevealed = true;
      
      if (newGrid[row][col].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            revealRecursive(row + dr, col + dc);
          }
        }
      }
    };

    revealRecursive(r, c);
    setGrid(newGrid);

    // Check win
    const unrevealedSafe = newGrid.flat().filter(cell => !cell.isMine && !cell.isRevealed).length;
    if (unrevealedSafe === 0) {
      setWin(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const toggleFlag = (e: React.MouseEvent | null, r: number, c: number) => {
    if (e) e.preventDefault();
    if (gameOver || win || grid[r][c].isRevealed) return;

    const newGrid = [...grid.map(row => [...row])];
    const isFlagged = !newGrid[r][c].isFlagged;
    newGrid[r][c].isFlagged = isFlagged;
    setGrid(newGrid);
    setMinesLeft(prev => isFlagged ? prev - 1 : prev + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-100 p-4">
      <div className="w-full max-w-sm flex justify-between items-center mb-8">
        <button onClick={onBack} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-900">
          <ArrowLeft size={24} />
        </button>
        <div className="flex gap-6">
          <button 
            onClick={() => setFlagMode(!flagMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
              flagMode ? 'bg-rose-500 text-white shadow-lg scale-105' : 'bg-stone-200 text-stone-600'
            }`}
          >
            <Flag size={18} />
            <span className="hidden sm:inline">Flag Mode</span>
          </button>
          <div className="text-center">
            <div className="flex items-center gap-1 text-rose-600 mb-1">
              <Bomb size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Mines</span>
            </div>
            <p className="text-2xl font-black text-stone-900">{minesLeft}</p>
          </div>
        </div>
      </div>

      <div 
        className="grid gap-1 bg-stone-300 p-2 rounded-xl shadow-inner"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
      >
        {grid.map((row, r) => 
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => revealCell(r, c)}
              onContextMenu={(e) => toggleFlag(e, r, c)}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-sm flex items-center justify-center text-sm font-bold transition-all ${
                cell.isRevealed 
                  ? cell.isMine ? 'bg-rose-500 text-white' : 'bg-stone-50 text-stone-400'
                  : 'bg-stone-200 hover:bg-stone-300 shadow-sm'
              }`}
            >
              {cell.isRevealed ? (
                cell.isMine ? <Bomb size={16} /> : cell.neighborMines || ''
              ) : (
                cell.isFlagged ? <Flag size={16} className="text-rose-500" /> : ''
              )}
            </button>
          ))
        )}
      </div>

      {(gameOver || win) && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl text-center border-8 border-stone-100">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              win ? 'bg-yellow-100 text-yellow-600' : 'bg-rose-100 text-rose-600'
            }`}>
              {win ? <Trophy size={48} /> : <Bomb size={48} />}
            </div>
            <h2 className="text-4xl font-black text-stone-900 mb-2">
              {win ? 'You Won!' : 'Boom!'}
            </h2>
            <p className="text-stone-500 font-medium mb-8">
              {win ? 'All mines cleared successfully.' : 'Better luck next time!'}
            </p>
            <button 
              onClick={initGrid}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-black py-5 px-8 rounded-3xl transition-all flex items-center justify-center gap-3 text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <RotateCcw size={24} />
              Try Again
            </button>
          </div>
        </div>
      )}

      <p className="mt-8 text-stone-400 text-xs font-bold uppercase tracking-widest">Right-click to flag mines</p>
    </div>
  );
}
