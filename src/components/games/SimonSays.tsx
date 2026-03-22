import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SimonSaysProps {
  onBack: () => void;
}

const COLORS = ['emerald', 'rose', 'blue', 'amber'];
const COLOR_CLASSES = {
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
};

export default function SimonSays({ onBack }: SimonSaysProps) {
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'showing' | 'gameOver'>('idle');
  const [score, setScore] = useState(0);

  const playSequence = useCallback(async (newSequence: string[]) => {
    setGameState('showing');
    for (const color of newSequence) {
      await new Promise(r => setTimeout(r, 400));
      setActiveColor(color);
      await new Promise(r => setTimeout(r, 400));
      setActiveColor(null);
    }
    setGameState('playing');
  }, []);

  const startGame = () => {
    const firstColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setSequence([firstColor]);
    setUserSequence([]);
    setScore(0);
    playSequence([firstColor]);
  };

  const handleColorClick = (color: string) => {
    if (gameState !== 'playing') return;

    const newUserSequence = [...userSequence, color];
    setUserSequence(newUserSequence);
    
    // Flash color
    setActiveColor(color);
    setTimeout(() => setActiveColor(null), 200);

    const currentIndex = newUserSequence.length - 1;
    if (newUserSequence[currentIndex] !== sequence[currentIndex]) {
      setGameState('gameOver');
      return;
    }

    if (newUserSequence.length === sequence.length) {
      setScore(s => s + 1);
      const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      const nextSequence = [...sequence, nextColor];
      setSequence(nextSequence);
      setUserSequence([]);
      setTimeout(() => playSequence(nextSequence), 800);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-4">
      <div className="w-full max-w-sm flex justify-between items-center mb-12">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-right">
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Round</p>
          <p className="text-2xl font-black text-emerald-400">{score + 1}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm aspect-square">
        {COLORS.map(color => (
          <button
            key={color}
            onClick={() => handleColorClick(color)}
            className={`aspect-square rounded-3xl transition-all transform active:scale-90 ${
              COLOR_CLASSES[color as keyof typeof COLOR_CLASSES]
            } ${activeColor === color ? 'brightness-150 scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]' : 'brightness-50'}`}
          />
        ))}
      </div>

      {gameState === 'idle' || gameState === 'gameOver' ? (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-zinc-900 rounded-[40px] p-10 max-w-sm w-full shadow-2xl text-center border-8 border-zinc-800">
            <h2 className="text-4xl font-black mb-2">
              {gameState === 'gameOver' ? 'Game Over' : 'Simon Says'}
            </h2>
            <p className="text-zinc-400 font-bold mb-8">
              {gameState === 'gameOver' ? `Final Round: ${score + 1}` : 'Repeat the sequence!'}
            </p>
            <button 
              onClick={startGame}
              className="w-full bg-white text-black font-black py-5 px-8 rounded-3xl transition-all flex items-center justify-center gap-3 text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {gameState === 'idle' ? <Play size={24} /> : <RotateCcw size={24} />}
              {gameState === 'idle' ? 'Start Game' : 'Try Again'}
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-12 text-zinc-500 font-black uppercase tracking-widest text-sm">
          {gameState === 'showing' ? 'Watch carefully...' : 'Your turn!'}
        </p>
      )}
    </div>
  );
}
