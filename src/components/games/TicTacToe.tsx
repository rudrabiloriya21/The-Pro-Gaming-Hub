import React, { useState, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TicTacToeProps {
  onBack: () => void;
}

type Player = 'X' | 'O' | null;

export default function TicTacToe({ onBack }: TicTacToeProps) {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<Player | 'Draw'>(null);

  const calculateWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6], // Diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every(square => square !== null)) return 'Draw';
    return null;
  };

  const handleClick = (i: number) => {
    if (winner || board[i]) return;
    
    const newBoard = [...board];
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    
    const result = calculateWinner(newBoard);
    if (result) {
      setWinner(result);
      if (result !== 'Draw') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } else {
      setIsXNext(!isXNext);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-sm flex justify-between items-center mb-12">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-900">
          <ArrowLeft size={24} />
        </button>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Turn</p>
          <p className={`text-2xl font-black ${isXNext ? 'text-blue-600' : 'text-rose-600'}`}>
            {winner ? 'Game Over' : `Player ${isXNext ? 'X' : 'O'}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-sm aspect-square bg-slate-200 p-3 rounded-3xl shadow-inner">
        {board.map((square, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={`aspect-square bg-white rounded-2xl flex items-center justify-center text-5xl font-black transition-all transform active:scale-90 shadow-sm hover:shadow-md ${
              square === 'X' ? 'text-blue-600' : 'text-rose-600'
            }`}
          >
            {square}
          </button>
        ))}
      </div>

      {winner && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl text-center border-8 border-slate-100">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              winner === 'Draw' ? 'bg-slate-100 text-slate-600' : 'bg-yellow-100 text-yellow-600'
            }`}>
              <Trophy size={48} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-2">
              {winner === 'Draw' ? "It's a Draw!" : `Player ${winner} Wins!`}
            </h2>
            <p className="text-slate-500 font-medium mb-8">
              {winner === 'Draw' ? 'A perfectly matched game.' : 'A brilliant victory!'}
            </p>
            <button 
              onClick={resetGame}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 px-8 rounded-3xl transition-all flex items-center justify-center gap-3 text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <RotateCcw size={24} />
              Play Again
            </button>
          </div>
        </div>
      )}

      <div className="mt-12 flex gap-8">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-blue-600" />
          <span className="font-bold text-slate-600">Player X</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-rose-600" />
          <span className="font-bold text-slate-600">Player O</span>
        </div>
      </div>
    </div>
  );
}
