import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Palette, Zap, Bomb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ColorMatchProps {
  onBack: () => void;
}

const ColorMatch: React.FC<ColorMatchProps> = ({ onBack }) => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentColor, setCurrentColor] = useState<{ name: string, color: string } | null>(null);
  const [nextColor, setNextColor] = useState<{ name: string, color: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  const colors = [
    { name: 'RED', color: '#ef4444' },
    { name: 'BLUE', color: '#3b82f6' },
    { name: 'GREEN', color: '#10b981' },
    { name: 'YELLOW', color: '#f59e0b' },
    { name: 'PURPLE', color: '#8b5cf6' },
    { name: 'PINK', color: '#ec4899' }
  ];

  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  const startGame = () => {
    setScore(0);
    setGameOver(false);
    setTimeLeft(100);
    setCurrentColor(getRandomColor());
    setNextColor(getRandomColor());
  };

  useEffect(() => {
    startGame();
  }, []);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          setGameOver(true);
          return 0;
        }
        return prev - (0.5 + score / 500);
      });
    }, 50);

    return () => clearInterval(timer);
  }, [gameOver, isPaused, score]);

  const handleMatch = (colorName: string) => {
    if (gameOver || isPaused) return;

    if (currentColor?.name === colorName) {
      setScore(prev => prev + 10);
      setTimeLeft(prev => Math.min(prev + 10, 100));
      setCurrentColor(nextColor);
      setNextColor(getRandomColor());
    } else {
      setGameOver(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b relative z-10">
        <button onClick={onBack} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-black tracking-widest text-neutral-900">COLOR MATCH</h2>
          <p className="text-xs font-bold opacity-50">SCORE: {score}</p>
        </div>
        <button onClick={startGame} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <RotateCcw size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-neutral-50">
        <div className="w-full max-w-md h-2 bg-neutral-200 rounded-full mb-12 overflow-hidden">
          <motion.div 
            className="h-full bg-emerald-500"
            animate={{ width: `${timeLeft}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>

        <div className="relative mb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentColor?.name}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.2, opacity: 0, y: -20 }}
              className="w-48 h-48 rounded-[40px] flex items-center justify-center shadow-2xl"
              style={{ backgroundColor: currentColor?.color }}
            >
              <span className="text-white text-4xl font-black tracking-tighter drop-shadow-md">
                {currentColor?.name}
              </span>
            </motion.div>
          </AnimatePresence>
          
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-neutral-100">
            <div 
              className="w-8 h-8 rounded-lg"
              style={{ backgroundColor: nextColor?.color }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
          {colors.map(c => (
            <button
              key={c.name}
              onClick={() => handleMatch(c.name)}
              className="h-20 rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-4 border-white"
              style={{ backgroundColor: c.color }}
            >
              <span className="text-white text-xs font-black tracking-widest drop-shadow-sm">
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[40px] p-10 text-center max-w-sm w-full shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bomb size={48} />
              </div>
              <h3 className="text-4xl font-black mb-2 text-neutral-900">GAME OVER</h3>
              <p className="text-neutral-500 mb-8 text-lg">Final Score: <span className="text-emerald-500 font-black">{score}</span></p>
              <div className="space-y-4">
                <button 
                  onClick={startGame}
                  className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-lg"
                >
                  RETRY MATCH
                </button>
                <button 
                  onClick={onBack}
                  className="w-full bg-neutral-100 text-neutral-500 py-4 rounded-2xl font-black text-lg hover:bg-neutral-200 transition-all"
                >
                  RETURN TO HUB
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ColorMatch;
