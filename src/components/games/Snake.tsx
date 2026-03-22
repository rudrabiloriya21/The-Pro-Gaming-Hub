import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SnakeProps {
  onBack: () => void;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };

export default function Snake({ onBack }: SnakeProps) {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(Number(localStorage.getItem('snakeHighScore') || 0));
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isColliding = snake.some(segment => segment.x === newFood!.x && segment.y === newFood!.y);
      if (!isColliding) break;
    }
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood());
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = { x: prevSnake[0].x + direction.x, y: prevSnake[0].y + direction.y };

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(s => {
          const newScore = s + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snakeHighScore', newScore.toString());
          }
          return newScore;
        });
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPaused, generateFood, highScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
        case ' ': setIsPaused(p => !p); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  const handleDirectionChange = (newDir: { x: number, y: number }) => {
    if (gameOver || isPaused) return;
    if (newDir.x !== 0 && direction.x === 0) setDirection(newDir);
    if (newDir.y !== 0 && direction.y === 0) setDirection(newDir);
  };

  useEffect(() => {
    gameLoopRef.current = setInterval(moveSnake, 200);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [moveSnake]);

  useEffect(() => {
    if (gameOver) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [gameOver]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white p-4">
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-xs text-neutral-400 uppercase tracking-widest">Score</p>
            <p className="text-xl font-bold font-mono">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-400 uppercase tracking-widest">Best</p>
            <p className="text-xl font-bold font-mono text-emerald-400">{highScore}</p>
          </div>
        </div>
      </div>

      <div 
        className="relative bg-neutral-800 border-4 border-neutral-700 rounded-lg overflow-hidden shadow-2xl"
        style={{ width: 'min(85vw, 400px)', height: 'min(85vw, 400px)' }}
      >
        <div 
          className="grid gap-px bg-neutral-700/50 h-full w-full"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isSnakeHead = snake[0].x === x && snake[0].y === y;
            const isSnakeBody = snake.slice(1).some(s => s.x === x && s.y === y);
            const isFood = food.x === x && food.y === y;

            return (
              <div 
                key={i} 
                className={`w-full h-full transition-all duration-150 ${
                  isSnakeHead ? 'bg-emerald-400 rounded-sm scale-110 z-10' : 
                  isSnakeBody ? 'bg-emerald-600' : 
                  isFood ? 'bg-rose-500 rounded-full animate-pulse' : 'bg-neutral-800'
                }`}
              />
            );
          })}
        </div>

        {(gameOver || isPaused) && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            {gameOver ? (
              <>
                <Trophy className="text-yellow-400 mb-4" size={48} />
                <h2 className="text-3xl font-bold mb-2">Game Over</h2>
                <p className="text-neutral-300 mb-6">You scored {score} points!</p>
              </>
            ) : (
              <h2 className="text-3xl font-bold mb-6">Paused</h2>
            )}
            <button 
              onClick={resetGame}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 active:scale-95"
            >
              <RotateCcw size={20} />
              {gameOver ? 'Try Again' : 'Resume'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-[200px] md:hidden">
        <div />
        <button 
          onPointerDown={() => handleDirectionChange({ x: 0, y: -1 })} 
          className="p-4 bg-neutral-800 rounded-xl hover:bg-neutral-700 active:scale-90 transition-all flex justify-center"
        >
          <ArrowLeft className="rotate-90" />
        </button>
        <div />
        <button 
          onPointerDown={() => handleDirectionChange({ x: -1, y: 0 })} 
          className="p-4 bg-neutral-800 rounded-xl hover:bg-neutral-700 active:scale-90 transition-all flex justify-center"
        >
          <ArrowLeft />
        </button>
        <button 
          onPointerDown={() => handleDirectionChange({ x: 0, y: 1 })} 
          className="p-4 bg-neutral-800 rounded-xl hover:bg-neutral-700 active:scale-90 transition-all flex justify-center"
        >
          <ArrowLeft className="-rotate-90" />
        </button>
        <button 
          onPointerDown={() => handleDirectionChange({ x: 1, y: 0 })} 
          className="p-4 bg-neutral-800 rounded-xl hover:bg-neutral-700 active:scale-90 transition-all flex justify-center"
        >
          <ArrowLeft className="rotate-180" />
        </button>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-[200px] hidden md:grid">
        <div />
        <button onClick={() => direction.y === 0 && setDirection({ x: 0, y: -1 })} className="p-4 bg-neutral-800 rounded-xl hover:bg-neutral-700 active:scale-90 transition-all flex justify-center"><ArrowLeft className="rotate-90" /></button>
        <div />
        <button onClick={() => direction.x === 0 && setDirection({ x: -1, y: 0 })} className="p-4 bg-neutral-800 rounded-xl hover:bg-neutral-700 active:scale-90 transition-all flex justify-center"><ArrowLeft /></button>
        <button onClick={() => direction.y === 0 && setDirection({ x: 0, y: 1 })} className="p-4 bg-neutral-800 rounded-xl hover:bg-neutral-700 active:scale-90 transition-all flex justify-center"><ArrowLeft className="-rotate-90" /></button>
        <button onClick={() => direction.x === 0 && setDirection({ x: 1, y: 0 })} className="p-4 bg-neutral-800 rounded-xl hover:bg-neutral-700 active:scale-90 transition-all flex justify-center"><ArrowLeft className="rotate-180" /></button>
      </div>
      
      <p className="mt-6 text-neutral-500 text-sm">Use arrow keys or buttons to move. Space to pause.</p>
    </div>
  );
}
