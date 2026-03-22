import React, { useState, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ConnectFourProps {
  onBack: () => void;
}

const COLS = 7;
const ROWS = 6;

export default function ConnectFour({ onBack }: ConnectFourProps) {
  const [board, setBoard] = useState<(number | null)[][]>(
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 or 2
  const [winner, setWinner] = useState<number | 'Draw' | null>(null);

  const checkWinner = (newBoard: (number | null)[][], r: number, c: number) => {
    const player = newBoard[r][c];
    if (!player) return false;

    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1] // horizontal, vertical, diag1, diag2
    ];

    for (const [dr, dc] of directions) {
      let count = 1;
      // Check one way
      for (let i = 1; i < 4; i++) {
        const nr = r + dr * i;
        const nc = c + dc * i;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && newBoard[nr][nc] === player) count++;
        else break;
      }
      // Check other way
      for (let i = 1; i < 4; i++) {
        const nr = r - dr * i;
        const nc = c - dc * i;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && newBoard[nr][nc] === player) count++;
        else break;
      }
      if (count >= 4) return true;
    }
    return false;
  };

  const dropDisc = (c: number) => {
    if (winner) return;

    const newBoard = board.map(row => [...row]);
    let droppedRow = -1;

    for (let r = ROWS - 1; r >= 0; r--) {
      if (newBoard[r][c] === null) {
        newBoard[r][c] = currentPlayer;
        droppedRow = r;
        break;
      }
    }

    if (droppedRow === -1) return;

    setBoard(newBoard);

    if (checkWinner(newBoard, droppedRow, c)) {
      setWinner(currentPlayer);
      confetti({ particleCount: 150, spread: 70 });
    } else if (newBoard.every(row => row.every(cell => cell !== null))) {
      setWinner('Draw');
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setCurrentPlayer(1);
    setWinner(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-50 p-4">
      <div className="w-full max-w-md flex justify-between items-center mb-8">
        <button onClick={onBack} className="p-2 hover:bg-indigo-100 rounded-full transition-colors text-indigo-900">
          <ArrowLeft size={24} />
        </button>
        <div className="text-right">
          <p className="text-[10px] text-indigo-500 uppercase font-bold tracking-widest">Turn</p>
          <p className={`text-2xl font-black ${currentPlayer === 1 ? 'text-rose-500' : 'text-amber-500'}`}>
            {winner ? 'Game Over' : `Player ${currentPlayer}`}
          </p>
        </div>
      </div>

      <div className="bg-blue-700 p-4 rounded-3xl shadow-2xl border-b-8 border-blue-800">
        <div className="grid grid-cols-7 gap-2 md:gap-4">
          {Array.from({ length: COLS }).map((_, c) => (
            <button
              key={c}
              onClick={() => dropDisc(c)}
              className="group flex flex-col gap-2 md:gap-4"
            >
              {board.map((row, r) => (
                <div 
                  key={`${r}-${c}`}
                  className={`w-8 h-8 md:w-12 md:h-12 rounded-full shadow-inner transition-all duration-300 ${
                    row[c] === 1 ? 'bg-rose-500' : 
                    row[c] === 2 ? 'bg-amber-500' : 
                    'bg-blue-900/50 group-hover:bg-blue-800'
                  }`}
                />
              ))}
            </button>
          ))}
        </div>
      </div>

      {winner && (
        <div className="fixed inset-0 bg-indigo-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl text-center border-8 border-indigo-100">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              winner === 'Draw' ? 'bg-slate-100 text-slate-600' : 
              winner === 1 ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
            }`}>
              <Trophy size={48} />
            </div>
            <h2 className="text-4xl font-black text-indigo-900 mb-2">
              {winner === 'Draw' ? "It's a Draw!" : `Player ${winner} Wins!`}
            </h2>
            <p className="text-indigo-500 font-medium mb-8">
              {winner === 'Draw' ? 'A perfectly matched game.' : 'A brilliant strategy!'}
            </p>
            <button 
              onClick={resetGame}
              className="w-full bg-indigo-900 hover:bg-indigo-800 text-white font-black py-5 px-8 rounded-3xl transition-all flex items-center justify-center gap-3 text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <RotateCcw size={24} />
              Play Again
            </button>
          </div>
        </div>
      )}

      <div className="mt-12 flex gap-8">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-rose-500" />
          <span className="font-bold text-indigo-600">Player 1</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-amber-500" />
          <span className="font-bold text-indigo-600">Player 2</span>
        </div>
      </div>
    </div>
  );
}
