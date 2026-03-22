import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Timer } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WhackAMoleProps {
  onBack: () => void;
}

export default function WhackAMole({ onBack }: WhackAMoleProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [activeMole, setActiveMole] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const moleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const spawnMole = useCallback(() => {
    const nextMole = Math.floor(Math.random() * 9);
    setActiveMole(nextMole);
    
    const speed = Math.max(600, 1200 - (score * 15));
    moleTimerRef.current = setTimeout(() => {
      setActiveMole(null);
      if (gameState === 'playing') {
        setTimeout(spawnMole, Math.random() * 500);
      }
    }, speed);
  }, [score, gameState]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameState('playing');
    spawnMole();
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    setGameState('ended');
    setActiveMole(null);
    if (timerRef.current) clearInterval(timerRef.current);
    if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleWhack = (index: number) => {
    if (gameState !== 'playing' || index !== activeMole) return;
    
    setScore(s => s + 1);
    setActiveMole(null);
    if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
    setTimeout(spawnMole, 100);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50 p-4">
      <div className="w-full max-w-md flex justify-between items-center mb-8">
        <button onClick={onBack} className="p-2 hover:bg-amber-100 rounded-full transition-colors text-amber-900">
          <ArrowLeft size={24} />
        </button>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="flex items-center gap-1 text-amber-600 mb-1">
              <Timer size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Time</span>
            </div>
            <p className="text-2xl font-black text-amber-900">{timeLeft}s</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 text-emerald-600 mb-1">
              <Trophy size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Score</span>
            </div>
            <p className="text-2xl font-black text-emerald-900">{score}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-sm aspect-square">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="relative aspect-square bg-amber-200 rounded-3xl border-b-8 border-amber-300 overflow-hidden">
            <div className="absolute inset-0 bg-amber-900/10 rounded-3xl inner-shadow" />
            
            <button
              onClick={() => handleWhack(i)}
              className={`absolute inset-x-0 bottom-0 transition-all duration-200 flex flex-col items-center ${
                activeMole === i ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
              }`}
            >
              <div className="w-16 h-16 bg-stone-600 rounded-t-full relative">
                <div className="absolute top-4 left-3 w-2 h-2 bg-black rounded-full" />
                <div className="absolute top-4 right-3 w-2 h-2 bg-black rounded-full" />
                <div className="absolute top-7 left-1/2 -translate-x-1/2 w-3 h-2 bg-rose-300 rounded-full" />
              </div>
            </button>
            
            <div className="absolute bottom-0 inset-x-0 h-4 bg-amber-300 rounded-b-3xl" />
          </div>
        ))}
      </div>

      {gameState !== 'playing' && (
        <div className="fixed inset-0 bg-amber-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl text-center border-8 border-amber-100">
            {gameState === 'ended' ? (
              <>
                <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy size={48} />
                </div>
                <h2 className="text-4xl font-black text-amber-900 mb-2">Game Over!</h2>
                <p className="text-amber-600 font-bold mb-8 text-xl">You whacked {score} moles!</p>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Gamepad size={48} />
                </div>
                <h2 className="text-4xl font-black text-amber-900 mb-2">Whack-A-Mole</h2>
                <p className="text-amber-600 font-bold mb-8">How many can you catch in 30 seconds?</p>
              </>
            )}
            <button 
              onClick={startGame}
              className="w-full bg-amber-900 hover:bg-amber-800 text-white font-black py-5 px-8 rounded-3xl transition-all flex items-center justify-center gap-3 text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <RotateCcw size={24} />
              {gameState === 'ended' ? 'Try Again' : 'Start Game'}
            </button>
          </div>
        </div>
      )}

      <p className="mt-12 text-amber-800/40 font-black uppercase tracking-widest text-sm">Be fast. Be precise.</p>
    </div>
  );
}

import { Gamepad } from 'lucide-react';
