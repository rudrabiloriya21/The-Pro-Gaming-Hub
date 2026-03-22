import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Rocket, Bomb, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SpaceShooterProps {
  onBack: () => void;
}

const SpaceShooter: React.FC<SpaceShooterProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let player = { x: canvas.width / 2, y: canvas.height - 50, width: 30, height: 30, speed: 5 };
    let bullets: { x: number, y: number, radius: number, speed: number }[] = [];
    let enemies: { x: number, y: number, width: number, height: number, speed: number, color: string }[] = [];
    let particles: { x: number, y: number, radius: number, color: string, velocity: { x: number, y: number }, alpha: number }[] = [];
    let keys: { [key: string]: boolean } = {};

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 400;
      canvas.height = canvas.parentElement?.clientHeight || 600;
      player.x = canvas.width / 2;
      player.y = canvas.height - 50;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const handleKeyDown = (e: KeyboardEvent) => keys[e.code] = true;
    const handleKeyUp = (e: KeyboardEvent) => keys[e.code] = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const spawnEnemy = () => {
      if (gameOver || isPaused) return;
      const width = 30 + Math.random() * 20;
      const x = Math.random() * (canvas.width - width);
      const colors = ['#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];
      enemies.push({
        x,
        y: -50,
        width,
        height: width,
        speed: 1.5 + Math.random() * 1.5 + score / 2000,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    };

    let spawnInterval = setInterval(spawnEnemy, 1500);

    const createExplosion = (x: number, y: number, color: string) => {
      for (let i = 0; i < 10; i++) {
        particles.push({
          x,
          y,
          radius: Math.random() * 3,
          color,
          velocity: {
            x: (Math.random() - 0.5) * 5,
            y: (Math.random() - 0.5) * 5
          },
          alpha: 1
        });
      }
    };

    const update = () => {
      if (gameOver || isPaused) return;

      // Player movement
      if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
      if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;
      if (keys['Space']) {
        if (bullets.length === 0 || bullets[bullets.length - 1].y < canvas.height - 100) {
          bullets.push({ x: player.x + player.width / 2, y: player.y, radius: 4, speed: 7 });
        }
      }

      // Bullets
      bullets.forEach((bullet, bIdx) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) bullets.splice(bIdx, 1);
      });

      // Enemies
      enemies.forEach((enemy, eIdx) => {
        enemy.y += enemy.speed;
        
        // Collision with player
        if (
          player.x < enemy.x + enemy.width &&
          player.x + player.width > enemy.x &&
          player.y < enemy.y + enemy.height &&
          player.y + player.height > enemy.y
        ) {
          setGameOver(true);
        }

        // Collision with bullets
        bullets.forEach((bullet, bIdx) => {
          if (
            bullet.x > enemy.x &&
            bullet.x < enemy.x + enemy.width &&
            bullet.y > enemy.y &&
            bullet.y < enemy.y + enemy.height
          ) {
            createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
            enemies.splice(eIdx, 1);
            bullets.splice(bIdx, 1);
            setScore(prev => prev + 10);
          }
        });

        if (enemy.y > canvas.height) enemies.splice(eIdx, 1);
      });

      // Particles
      particles.forEach((particle, pIdx) => {
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        particle.alpha -= 0.02;
        if (particle.alpha <= 0) particles.splice(pIdx, 1);
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Player
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(player.x + player.width / 2, player.y);
      ctx.lineTo(player.x, player.y + player.height);
      ctx.lineTo(player.x + player.width, player.y + player.height);
      ctx.closePath();
      ctx.fill();
      
      // Engine glow
      ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.beginPath();
      ctx.arc(player.x + player.width / 2, player.y + player.height + 5, 5 + Math.random() * 5, 0, Math.PI * 2);
      ctx.fill();

      // Bullets
      ctx.fillStyle = '#fbbf24';
      bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Enemies
      enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
      });

      // Particles
      particles.forEach(particle => {
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      update();
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(spawnInterval);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameOver, isPaused]);

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-white/10 relative z-10">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-black tracking-widest text-emerald-400">SPACE SHOOTER</h2>
          <p className="text-xs font-bold opacity-50">SCORE: {score}</p>
        </div>
        <button onClick={resetGame} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <RotateCcw size={24} />
        </button>
      </div>

      <div className="flex-1 relative bg-neutral-950">
        <canvas ref={canvasRef} className="w-full h-full block" />
        
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-12 md:hidden">
          <button 
            className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20 active:scale-90"
            onPointerDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }))}
            onPointerUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowLeft' }))}
          >
            <ArrowLeft size={32} />
          </button>
          <button 
            className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/40 active:scale-90"
            onPointerDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }))}
            onPointerUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }))}
          >
            <Zap size={32} className="text-emerald-400" />
          </button>
          <button 
            className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20 active:scale-90"
            onPointerDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }))}
            onPointerUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight' }))}
          >
            <ArrowLeft size={32} className="rotate-180" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-neutral-900 border border-white/10 rounded-[40px] p-10 text-center max-w-sm w-full shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bomb size={48} />
              </div>
              <h3 className="text-4xl font-black mb-2 text-white">GAME OVER</h3>
              <p className="text-neutral-500 mb-8 text-lg">Final Score: <span className="text-emerald-400 font-black">{score}</span></p>
              <div className="space-y-4">
                <button 
                  onClick={resetGame}
                  className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-lg shadow-emerald-500/20"
                >
                  RETRY MISSION
                </button>
                <button 
                  onClick={onBack}
                  className="w-full bg-white/5 text-white py-4 rounded-2xl font-black text-lg hover:bg-white/10 transition-all"
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

export default SpaceShooter;
