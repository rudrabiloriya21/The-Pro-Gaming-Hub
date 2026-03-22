import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Play } from 'lucide-react';

interface BreakoutProps {
  onBack: () => void;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const PADDLE_WIDTH = 75;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 8;
const BRICK_ROWS = 5;
const BRICK_COLS = 7;
const BRICK_WIDTH = 50;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 5;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = 10;

export default function Breakout({ onBack }: BreakoutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver' | 'win'>('idle');
  
  const paddleX = useRef(CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2);
  const ballX = useRef(CANVAS_WIDTH / 2);
  const ballY = useRef(CANVAS_HEIGHT - 30);
  const ballDX = useRef(3);
  const ballDY = useRef(-3);
  const bricks = useRef<any[]>([]);

  const initBricks = useCallback(() => {
    bricks.current = [];
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks.current[c] = [];
      for (let r = 0; r < BRICK_ROWS; r++) {
        bricks.current[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
  }, []);

  useEffect(() => {
    initBricks();
  }, [initBricks]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw bricks
    for (let c = 0; c < BRICK_COLS; c++) {
      for (let r = 0; r < BRICK_ROWS; r++) {
        if (bricks.current[c][r].status === 1) {
          const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
          const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
          bricks.current[c][r].x = brickX;
          bricks.current[c][r].y = brickY;
          ctx.beginPath();
          ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
          ctx.fillStyle = `hsl(${r * 40 + 200}, 70%, 50%)`;
          ctx.fill();
          ctx.closePath();
        }
      }
    }

    // Draw ball
    ctx.beginPath();
    ctx.arc(ballX.current, ballY.current, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.closePath();

    // Draw paddle
    ctx.beginPath();
    ctx.rect(paddleX.current, CANVAS_HEIGHT - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.closePath();

    if (gameState === 'playing') {
      // Collision detection
      for (let c = 0; c < BRICK_COLS; c++) {
        for (let r = 0; r < BRICK_ROWS; r++) {
          const b = bricks.current[c][r];
          if (b.status === 1) {
            if (
              ballX.current > b.x &&
              ballX.current < b.x + BRICK_WIDTH &&
              ballY.current > b.y &&
              ballY.current < b.y + BRICK_HEIGHT
            ) {
              ballDY.current = -ballDY.current;
              b.status = 0;
              setScore(s => s + 10);
              if (bricks.current.flat().every(br => br.status === 0)) {
                setGameState('win');
              }
            }
          }
        }
      }

      // Wall collision
      if (ballX.current + ballDX.current > CANVAS_WIDTH - BALL_RADIUS || ballX.current + ballDX.current < BALL_RADIUS) {
        ballDX.current = -ballDX.current;
      }
      if (ballY.current + ballDY.current < BALL_RADIUS) {
        ballDY.current = -ballDY.current;
      } else if (ballY.current + ballDY.current > CANVAS_HEIGHT - BALL_RADIUS - 10) {
        if (ballX.current > paddleX.current && ballX.current < paddleX.current + PADDLE_WIDTH) {
          ballDY.current = -ballDY.current;
        } else {
          setGameState('gameOver');
        }
      }

      ballX.current += ballDX.current;
      ballY.current += ballDY.current;
    }

    requestAnimationFrame(draw);
  }, [gameState]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      if (relativeX > 0 && relativeX < CANVAS_WIDTH) {
        paddleX.current = relativeX - PADDLE_WIDTH / 2;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX;
      const scaleX = CANVAS_WIDTH / rect.width;
      const relativeX = (touchX - rect.left) * scaleX;
      if (relativeX > 0 && relativeX < CANVAS_WIDTH) {
        paddleX.current = relativeX - PADDLE_WIDTH / 2;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    const animId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animId);
    };
  }, [draw]);

  const startGame = () => {
    ballX.current = CANVAS_WIDTH / 2;
    ballY.current = CANVAS_HEIGHT - 30;
    ballDX.current = 3;
    ballDY.current = -3;
    initBricks();
    setScore(0);
    setGameState('playing');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-sky-50 p-4">
      <div className="w-full max-w-[400px] flex justify-between items-center mb-6">
        <button onClick={onBack} className="p-2 hover:bg-sky-100 rounded-full transition-colors text-sky-900">
          <ArrowLeft size={24} />
        </button>
        <div className="text-right">
          <p className="text-[10px] text-sky-500 uppercase font-bold tracking-widest">Score</p>
          <p className="text-2xl font-black text-sky-900">{score}</p>
        </div>
      </div>

      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-white">
        <canvas 
          ref={canvasRef} 
          width={CANVAS_WIDTH} 
          height={CANVAS_HEIGHT}
          className="bg-sky-100/30"
        />

        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-sky-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl text-center border-8 border-sky-100">
              <h2 className="text-4xl font-black text-sky-900 mb-2">
                {gameState === 'gameOver' ? 'Game Over' : gameState === 'win' ? 'You Win!' : 'Breakout'}
              </h2>
              <p className="text-sky-600 font-bold mb-8">
                {gameState === 'gameOver' ? 'The ball fell!' : gameState === 'win' ? 'Bricks cleared!' : 'Destroy all the bricks!'}
              </p>
              <button 
                onClick={startGame}
                className="w-full bg-sky-900 hover:bg-sky-800 text-white font-black py-5 px-8 rounded-3xl transition-all flex items-center justify-center gap-3 text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {gameState === 'idle' ? <Play size={24} /> : <RotateCcw size={24} />}
                {gameState === 'idle' ? 'Start Game' : 'Try Again'}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-sky-800/40 font-black uppercase tracking-widest text-sm">Move mouse or touch to move paddle</p>
    </div>
  );
}
