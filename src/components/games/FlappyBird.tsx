import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, RotateCcw, Play } from 'lucide-react';

interface FlappyBirdProps {
  onBack: () => void;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const BIRD_SIZE = 30;
const GRAVITY = 0.4;
const JUMP = -7;
const PIPE_WIDTH = 50;
const PIPE_GAP = 170;
const PIPE_SPEED = 2;

export default function FlappyBird({ onBack }: FlappyBirdProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver'>('idle');
  
  const birdY = useRef(CANVAS_HEIGHT / 2);
  const birdVelocity = useRef(0);
  const pipes = useRef<any[]>([]);
  const frameId = useRef<number>(0);

  const initPipes = useCallback(() => {
    pipes.current = [];
    for (let i = 0; i < 3; i++) {
      pipes.current.push({
        x: CANVAS_WIDTH + i * 250,
        top: Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50
      });
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw bird
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(50 + BIRD_SIZE / 2, birdY.current + BIRD_SIZE / 2, BIRD_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    // Draw pipes
    ctx.fillStyle = '#22c55e';
    pipes.current.forEach(pipe => {
      // Top pipe
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.top);
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.top + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - (pipe.top + PIPE_GAP));
    });

    if (gameState === 'playing') {
      birdVelocity.current += GRAVITY;
      birdY.current += birdVelocity.current;

      pipes.current.forEach(pipe => {
        pipe.x -= PIPE_SPEED;

        // Collision detection
        if (
          50 + BIRD_SIZE > pipe.x &&
          50 < pipe.x + PIPE_WIDTH &&
          (birdY.current < pipe.top || birdY.current + BIRD_SIZE > pipe.top + PIPE_GAP)
        ) {
          setGameState('gameOver');
        }

        // Score
        if (pipe.x + PIPE_WIDTH < 50 && !pipe.passed) {
          pipe.passed = true;
          setScore(s => s + 1);
        }

        // Reset pipe
        if (pipe.x + PIPE_WIDTH < 0) {
          pipe.x = CANVAS_WIDTH + 250;
          pipe.top = Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50;
          pipe.passed = false;
        }
      });

      if (birdY.current + BIRD_SIZE > CANVAS_HEIGHT || birdY.current < 0) {
        setGameState('gameOver');
      }
    }

    frameId.current = requestAnimationFrame(draw);
  }, [gameState]);

  useEffect(() => {
    initPipes();
    frameId.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId.current);
  }, [draw, initPipes]);

  const jump = useCallback(() => {
    if (gameState === 'playing') {
      birdVelocity.current = JUMP;
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
    birdY.current = CANVAS_HEIGHT / 2;
    birdVelocity.current = 0;
    initPipes();
    setScore(0);
    setGameState('playing');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-sky-50 p-4" onClick={jump}>
      <div className="w-full max-w-[400px] flex justify-between items-center mb-6">
        <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="p-2 hover:bg-sky-100 rounded-full transition-colors text-sky-900">
          <ArrowLeft size={24} />
        </button>
        <div className="text-right">
          <p className="text-[10px] text-sky-500 uppercase font-bold tracking-widest">Score</p>
          <p className="text-2xl font-black text-sky-900">{score}</p>
        </div>
      </div>

      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-white w-full max-w-[400px]">
        <canvas 
          ref={canvasRef} 
          width={CANVAS_WIDTH} 
          height={CANVAS_HEIGHT}
          className="w-full h-auto"
        />

        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-sky-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl text-center border-8 border-sky-100">
              <h2 className="text-4xl font-black text-sky-900 mb-2">
                {gameState === 'gameOver' ? 'Game Over' : 'Flappy Bird'}
              </h2>
              <p className="text-sky-600 font-bold mb-8">
                {gameState === 'gameOver' ? `Score: ${score}` : 'Tap or Space to jump!'}
              </p>
              <button 
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="w-full bg-sky-900 hover:bg-sky-800 text-white font-black py-5 px-8 rounded-3xl transition-all flex items-center justify-center gap-3 text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {gameState === 'idle' ? <Play size={24} /> : <RotateCcw size={24} />}
                {gameState === 'idle' ? 'Start Game' : 'Try Again'}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-sky-800/40 font-black uppercase tracking-widest text-sm">Tap, Click or Space to jump</p>
    </div>
  );
}
