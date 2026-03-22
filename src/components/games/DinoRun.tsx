import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, RotateCcw, Play } from 'lucide-react';

interface DinoRunProps {
  onBack: () => void;
}

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 200;
const DINO_WIDTH = 40;
const DINO_HEIGHT = 40;
const GRAVITY = 0.8;
const JUMP = -15;

export default function DinoRun({ onBack }: DinoRunProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver'>('idle');
  
  const dinoY = useRef(CANVAS_HEIGHT - DINO_HEIGHT);
  const dinoVelocity = useRef(0);
  const obstacles = useRef<any[]>([]);
  const frameId = useRef<number>(0);
  const speed = useRef(5);

  const spawnObstacle = useCallback(() => {
    obstacles.current.push({
      x: CANVAS_WIDTH,
      width: 20 + Math.random() * 30,
      height: 30 + Math.random() * 40,
    });
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw ground
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT - 2);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 2);
    ctx.strokeStyle = '#333';
    ctx.stroke();

    // Draw dino
    ctx.fillStyle = '#333';
    ctx.fillRect(50, dinoY.current, DINO_WIDTH, DINO_HEIGHT);

    // Draw obstacles
    ctx.fillStyle = '#ef4444';
    obstacles.current.forEach(obs => {
      ctx.fillRect(obs.x, CANVAS_HEIGHT - obs.height, obs.width, obs.height);
    });

    if (gameState === 'playing') {
      dinoVelocity.current += GRAVITY;
      dinoY.current += dinoVelocity.current;

      if (dinoY.current > CANVAS_HEIGHT - DINO_HEIGHT) {
        dinoY.current = CANVAS_HEIGHT - DINO_HEIGHT;
        dinoVelocity.current = 0;
      }

      obstacles.current.forEach(obs => {
        obs.x -= speed.current;

        // Collision
        if (
          50 + DINO_WIDTH > obs.x &&
          50 < obs.x + obs.width &&
          dinoY.current + DINO_HEIGHT > CANVAS_HEIGHT - obs.height
        ) {
          setGameState('gameOver');
        }
      });

      // Remove off-screen obstacles
      if (obstacles.current.length > 0 && obstacles.current[0].x + obstacles.current[0].width < 0) {
        obstacles.current.shift();
        setScore(s => s + 1);
        speed.current += 0.1;
      }

      // Spawn new obstacles
      if (obstacles.current.length === 0 || (CANVAS_WIDTH - obstacles.current[obstacles.current.length - 1].x > 200 + Math.random() * 300)) {
        spawnObstacle();
      }
    }

    frameId.current = requestAnimationFrame(draw);
  }, [gameState, spawnObstacle]);

  useEffect(() => {
    frameId.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId.current);
  }, [draw]);

  const jump = useCallback(() => {
    if (gameState === 'playing' && dinoY.current === CANVAS_HEIGHT - DINO_HEIGHT) {
      dinoVelocity.current = JUMP;
    } else if (gameState !== 'playing') {
      startGame();
    }
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') jump();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  const startGame = () => {
    dinoY.current = CANVAS_HEIGHT - DINO_HEIGHT;
    dinoVelocity.current = 0;
    obstacles.current = [];
    speed.current = 5;
    setScore(0);
    setGameState('playing');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 p-4" onClick={jump}>
      <div className="w-full max-w-[600px] flex justify-between items-center mb-6">
        <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-900">
          <ArrowLeft size={24} />
        </button>
        <div className="text-right">
          <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Score</p>
          <p className="text-2xl font-black text-stone-900">{score}</p>
        </div>
      </div>

      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-white w-full max-w-[600px]">
        <canvas 
          ref={canvasRef} 
          width={CANVAS_WIDTH} 
          height={CANVAS_HEIGHT}
          className="w-full h-auto"
        />

        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl text-center border-8 border-stone-100">
              <h2 className="text-4xl font-black text-stone-900 mb-2">
                {gameState === 'gameOver' ? 'Game Over' : 'Dino Run'}
              </h2>
              <p className="text-stone-600 font-bold mb-8">
                {gameState === 'gameOver' ? `Score: ${score}` : 'Jump over the obstacles!'}
              </p>
              <button 
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-black py-5 px-8 rounded-3xl transition-all flex items-center justify-center gap-3 text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {gameState === 'idle' ? <Play size={24} /> : <RotateCcw size={24} />}
                {gameState === 'idle' ? 'Start Game' : 'Try Again'}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-stone-800/40 font-black uppercase tracking-widest text-sm">Tap or Space to jump</p>
    </div>
  );
}
