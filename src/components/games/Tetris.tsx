import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, RotateCcw, Play, Pause } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TetrisProps {
  onBack: () => void;
}

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 20;

const SHAPES = {
  I: [[1, 1, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
  O: [[1, 1], [1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  T: [[0, 1, 0], [1, 1, 1]],
  Z: [[1, 1, 0], [0, 1, 1]],
};

const COLORS = {
  I: 'bg-cyan-400',
  J: 'bg-blue-500',
  L: 'bg-orange-500',
  O: 'bg-yellow-400',
  S: 'bg-green-500',
  T: 'bg-purple-500',
  Z: 'bg-red-500',
};

type PieceType = keyof typeof SHAPES;

interface Piece {
  pos: { x: number; y: number };
  shape: number[][];
  type: PieceType;
}

export default function Tetris({ onBack }: TetrisProps) {
  const [grid, setGrid] = useState<(PieceType | null)[][]>(
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  );
  const [activePiece, setActivePiece] = useState<Piece | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const spawnPiece = useCallback(() => {
    const types = Object.keys(SHAPES) as PieceType[];
    const type = types[Math.floor(Math.random() * types.length)];
    const shape = SHAPES[type];
    const piece: Piece = {
      pos: { x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 },
      shape,
      type,
    };

    // Check game over
    if (checkCollision(piece.pos.x, piece.pos.y, piece.shape)) {
      setGameOver(true);
      return null;
    }
    return piece;
  }, []);

  const checkCollision = (x: number, y: number, shape: number[][], currentGrid = grid) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = x + c;
          const newY = y + r;
          if (
            newX < 0 ||
            newX >= COLS ||
            newY >= ROWS ||
            (newY >= 0 && currentGrid[newY][newX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const rotatePiece = (piece: Piece) => {
    const rotated = piece.shape[0].map((_, i) =>
      piece.shape.map(row => row[i]).reverse()
    );
    if (!checkCollision(piece.pos.x, piece.pos.y, rotated)) {
      return { ...piece, shape: rotated };
    }
    return piece;
  };

  const mergePiece = (piece: Piece) => {
    const newGrid = grid.map(row => [...row]);
    piece.shape.forEach((row, r) => {
      row.forEach((value, c) => {
        if (value) {
          const y = piece.pos.y + r;
          const x = piece.pos.x + c;
          if (y >= 0) newGrid[y][x] = piece.type;
        }
      });
    });

    // Clear lines
    let linesCleared = 0;
    const filteredGrid = newGrid.filter(row => {
      const isFull = row.every(cell => cell !== null);
      if (isFull) linesCleared++;
      return !isFull;
    });

    while (filteredGrid.length < ROWS) {
      filteredGrid.unshift(Array(COLS).fill(null));
    }

    if (linesCleared > 0) {
      setScore(s => s + [0, 100, 300, 500, 800][linesCleared]);
      if (linesCleared === 4) confetti({ particleCount: 150, spread: 70 });
    }

    setGrid(filteredGrid);
    const next = spawnPiece();
    setActivePiece(next);
  };

  const moveDown = useCallback(() => {
    if (!activePiece || gameOver || isPaused) return;

    if (!checkCollision(activePiece.pos.x, activePiece.pos.y + 1, activePiece.shape)) {
      setActivePiece(p => p ? { ...p, pos: { ...p.pos, y: p.pos.y + 1 } } : null);
    } else {
      mergePiece(activePiece);
    }
  }, [activePiece, grid, gameOver, isPaused, spawnPiece]);

  useEffect(() => {
    if (!activePiece && !gameOver) {
      setActivePiece(spawnPiece());
    }
  }, [activePiece, gameOver, spawnPiece]);

  useEffect(() => {
    gameLoopRef.current = setInterval(moveDown, 1200);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [moveDown]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activePiece || gameOver || isPaused) return;
      switch (e.key) {
        case 'ArrowLeft':
          if (!checkCollision(activePiece.pos.x - 1, activePiece.pos.y, activePiece.shape)) {
            setActivePiece(p => p ? { ...p, pos: { ...p.pos, x: p.pos.x - 1 } } : null);
          }
          break;
        case 'ArrowRight':
          if (!checkCollision(activePiece.pos.x + 1, activePiece.pos.y, activePiece.shape)) {
            setActivePiece(p => p ? { ...p, pos: { ...p.pos, x: p.pos.x + 1 } } : null);
          }
          break;
        case 'ArrowDown':
          moveDown();
          break;
        case 'ArrowUp':
          setActivePiece(p => p ? rotatePiece(p) : null);
          break;
        case ' ':
          setIsPaused(p => !p);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePiece, gameOver, isPaused, moveDown]);

  const resetGame = () => {
    setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setActivePiece(spawnPiece());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-4">
      <div className="w-full max-w-xs flex justify-between items-center mb-6">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-right">
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Score</p>
          <p className="text-2xl font-black font-mono text-cyan-400">{score}</p>
        </div>
      </div>

      <div className="relative bg-zinc-900 border-4 border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        <div 
          className="grid bg-zinc-950/50"
          style={{ 
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            width: 'min(70vw, 300px)',
            height: 'min(140vw, 600px)'
          }}
        >
          {grid.map((row, r) => 
            row.map((cell, c) => {
              let color = 'bg-transparent';
              if (cell) color = COLORS[cell];
              
              // Draw active piece
              if (activePiece) {
                const pr = r - activePiece.pos.y;
                const pc = c - activePiece.pos.x;
                if (pr >= 0 && pr < activePiece.shape.length && pc >= 0 && pc < activePiece.shape[0].length) {
                  if (activePiece.shape[pr][pc]) color = COLORS[activePiece.type];
                }
              }

              return (
                <div 
                  key={`${r}-${c}`} 
                  className={`border-[0.5px] border-zinc-900/30 ${color} rounded-[2px] transition-colors duration-75`}
                />
              );
            })
          )}
        </div>

        {(gameOver || isPaused) && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            {gameOver ? (
              <>
                <h2 className="text-4xl font-black mb-2 text-red-500">GAME OVER</h2>
                <p className="text-zinc-400 mb-8">Final Score: {score}</p>
              </>
            ) : (
              <h2 className="text-4xl font-black mb-8">PAUSED</h2>
            )}
            <button 
              onClick={gameOver ? resetGame : () => setIsPaused(false)}
              className="flex items-center gap-3 bg-white text-black font-black py-4 px-10 rounded-2xl hover:scale-105 active:scale-95 transition-all"
            >
              {gameOver ? <RotateCcw size={20} /> : <Play size={20} />}
              {gameOver ? 'RESTART' : 'RESUME'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-[240px]">
        <div />
        <button onPointerDown={() => setActivePiece(p => p ? rotatePiece(p) : null)} className="p-4 bg-zinc-800 rounded-2xl hover:bg-zinc-700 active:scale-90 transition-all flex justify-center"><ArrowLeft className="rotate-90" /></button>
        <div />
        <button onPointerDown={() => !checkCollision(activePiece!.pos.x - 1, activePiece!.pos.y, activePiece!.shape) && setActivePiece(p => p ? { ...p, pos: { ...p.pos, x: p.pos.x - 1 } } : null)} className="p-4 bg-zinc-800 rounded-2xl hover:bg-zinc-700 active:scale-90 transition-all flex justify-center"><ArrowLeft /></button>
        <button onPointerDown={moveDown} className="p-4 bg-zinc-800 rounded-2xl hover:bg-zinc-700 active:scale-90 transition-all flex justify-center"><ArrowLeft className="-rotate-90" /></button>
        <button onPointerDown={() => !checkCollision(activePiece!.pos.x + 1, activePiece!.pos.y, activePiece!.shape) && setActivePiece(p => p ? { ...p, pos: { ...p.pos, x: p.pos.x + 1 } } : null)} className="p-4 bg-zinc-800 rounded-2xl hover:bg-zinc-700 active:scale-90 transition-all flex justify-center"><ArrowLeft className="rotate-180" /></button>
      </div>
    </div>
  );
}
