import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Layers, Bomb, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TowerStackProps {
  onBack: () => void;
}

const TowerStack: React.FC<TowerStackProps> = ({ onBack }) => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [blocks, setBlocks] = useState<{ x: number, width: number, color: string }[]>([]);
  const [currentBlock, setCurrentBlock] = useState({ x: 0, width: 200, speed: 5, direction: 1 });
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  const startGame = () => {
    setScore(0);
    setGameOver(false);
    setBlocks([{ x: 100, width: 200, color: colors[0] }]);
    setCurrentBlock({ x: 0, width: 200, speed: 5, direction: 1 });
  };

  useEffect(() => {
    startGame();
  }, []);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const interval = setInterval(() => {
      setCurrentBlock(prev => {
        let newX = prev.x + prev.speed * prev.direction;
        let newDirection = prev.direction;
        
        if (newX + prev.width > 400 || newX < 0) {
          newDirection *= -1;
          newX = prev.x + prev.speed * newDirection;
        }
        
        return { ...prev, x: newX, direction: newDirection };
      });
    }, 20);

    return () => clearInterval(interval);
  }, [gameOver, isPaused]);

  const handleStack = () => {
    if (gameOver || isPaused) return;

    const lastBlock = blocks[blocks.length - 1];
    const overlapStart = Math.max(currentBlock.x, lastBlock.x);
    const overlapEnd = Math.min(currentBlock.x + currentBlock.width, lastBlock.x + lastBlock.width);
    const overlapWidth = overlapEnd - overlapStart;

    if (overlapWidth <= 0) {
      setGameOver(true);
      return;
    }

    const newBlock = {
      x: overlapStart,
      width: overlapWidth,
      color: colors[(blocks.length) % colors.length]
    };

    setBlocks(prev => [...prev, newBlock]);
    setScore(prev => prev + 1);
    setCurrentBlock({
      x: 0,
      width: overlapWidth,
      speed: 5 + Math.min(score / 5, 10),
      direction: 1
    });
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 overflow-hidden" onClick={handleStack}>
      <div className="p-4 flex items-center justify-between border-b bg-white relative z-10">
        <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-black tracking-widest text-neutral-900">TOWER STACK</h2>
          <p className="text-xs font-bold opacity-50">SCORE: {score}</p>
        </div>
        <button onClick={(e) => { e.stopPropagation(); startGame(); }} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <RotateCcw size={24} />
        </button>
      </div>

      <div className="flex-1 relative flex flex-col-reverse items-center p-6 bg-neutral-100 overflow-hidden" ref={containerRef}>
        <div className="w-[400px] h-full relative border-x border-neutral-200 bg-white/50">
          {blocks.map((block, idx) => (
            <motion.div
              key={idx}
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute h-10 rounded-sm shadow-sm border-b border-black/10"
              style={{
                bottom: idx * 40,
                left: block.x,
                width: block.width,
                backgroundColor: block.color
              }}
            />
          ))}

          {!gameOver && (
            <div
              className="absolute h-10 rounded-sm shadow-md border-b border-black/10"
              style={{
                bottom: blocks.length * 40,
                left: currentBlock.x,
                width: currentBlock.width,
                backgroundColor: colors[blocks.length % colors.length]
              }}
            />
          )}
        </div>
        
        <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-2">Tap to Stack</p>
          <div className="flex items-center justify-center gap-2">
            <Layers size={20} className="text-neutral-300" />
            <span className="text-4xl font-black text-neutral-200">{score}</span>
          </div>
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
              <h3 className="text-4xl font-black mb-2 text-neutral-900">TOWER FELL!</h3>
              <p className="text-neutral-500 mb-8 text-lg">Final Height: <span className="text-emerald-500 font-black">{score}</span></p>
              <div className="space-y-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); startGame(); }}
                  className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-lg"
                >
                  REBUILD TOWER
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onBack(); }}
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

export default TowerStack;
