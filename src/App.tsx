import React, { useState, useEffect } from 'react';
import { Gamepad2, Brain, Grid3X3, Smartphone, Laptop, Tablet, Monitor, LucideIcon, Bomb, Download, Rocket, Type, Palette, Layers, Puzzle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import GameCard from './components/GameCard';
import InstallModal from './components/InstallModal';
import Snake from './components/games/Snake';
import MemoryMatch from './components/games/MemoryMatch';
import Game2048 from './components/games/Game2048';
import Tetris from './components/games/Tetris';
import WhackAMole from './components/games/WhackAMole';
import TicTacToe from './components/games/TicTacToe';
import Minesweeper from './components/games/Minesweeper';
import Breakout from './components/games/Breakout';
import FlappyBird from './components/games/FlappyBird';
import Hangman from './components/games/Hangman';
import SimonSays from './components/games/SimonSays';
import DinoRun from './components/games/DinoRun';
import ConnectFour from './components/games/ConnectFour';
import Sudoku from './components/games/Sudoku';
import SpaceShooter from './components/games/SpaceShooter';
import WordSearch from './components/games/WordSearch';
import ColorMatch from './components/games/ColorMatch';
import TowerStack from './components/games/TowerStack';

type GameType = 'snake' | 'memory' | '2048' | 'tetris' | 'whack' | 'tictactoe' | 'minesweeper' | 'breakout' | 'flappy' | 'hangman' | 'simon' | 'dino' | 'connect4' | 'sudoku' | 'shooter' | 'wordsearch' | 'colormatch' | 'tower' | null;

interface GameInfo {
  id: 'snake' | '2048' | 'memory' | 'tetris' | 'whack' | 'tictactoe' | 'minesweeper' | 'breakout' | 'flappy' | 'hangman' | 'simon' | 'dino' | 'connect4' | 'sudoku' | 'shooter' | 'wordsearch' | 'colormatch' | 'tower';
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export default function App() {
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(true);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setShowInstallBtn(false);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    // Simulate a high-speed download progress
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Faster at the start, slower at the end for "realism"
        const increment = prev < 70 ? 8 : 3;
        return Math.min(prev + increment, 100);
      });
    }, 80);

    // Wait for "download" to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsDownloading(false);

    // Trigger a functional "Web Launcher" download
    const appUrl = window.location.href;
    const launcherContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Pro Gaming Hub Launcher</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="2; url=${appUrl}">
    <style>
        body { 
            background: #0a0a0a; 
            color: #ffffff; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex; 
            flex-direction: column;
            align-items: center; 
            justify-content: center; 
            height: 100vh; 
            margin: 0;
            overflow: hidden;
        }
        .container { text-align: center; padding: 2rem; }
        .logo { width: 80px; height: 80px; background: #000; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #10b981; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        h1 { font-size: 1.5rem; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 0.5rem; }
        p { color: #888; font-size: 0.9rem; }
        a { color: #10b981; text-decoration: none; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4M8 10v4M15 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3-3a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>
        </div>
        <div class="spinner"></div>
        <h1>Launching Pro Gaming Hub</h1>
        <p>Connecting to secure servers...</p>
        <p style="margin-top: 2rem; font-size: 0.8rem;">If the app doesn't open, <a href="${appUrl}">click here to launch manually</a>.</p>
    </div>
</body>
</html>`;

    const blob = new Blob([launcherContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ProGamingHub_Launcher.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Also trigger the PWA install prompt for the full experience
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBtn(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallModal(true);
    }
  };

  const games: GameInfo[] = [
    {
      id: 'snake',
      title: 'Retro Snake',
      description: 'The classic arcade experience. Grow your snake, avoid the walls, and beat your high score.',
      icon: Gamepad2,
      color: 'bg-emerald-500',
      difficulty: 'Medium',
    },
    {
      id: '2048',
      title: '2048 Puzzle',
      description: 'Slide tiles and merge them to reach the 2048 tile. A test of strategy and foresight.',
      icon: Grid3X3,
      color: 'bg-orange-500',
      difficulty: 'Hard',
    },
    {
      id: 'memory',
      title: 'Memory Match',
      description: 'Flip cards and find pairs. Sharpen your focus and memory in this brain-training challenge.',
      icon: Brain,
      color: 'bg-indigo-500',
      difficulty: 'Easy',
    },
    {
      id: 'tetris',
      title: 'Block Puzzle',
      description: 'The ultimate classic. Stack blocks, clear lines, and survive as long as you can.',
      icon: Smartphone,
      color: 'bg-zinc-800',
      difficulty: 'Hard',
    },
    {
      id: 'whack',
      title: 'Whack-A-Mole',
      description: 'Test your reflexes! Whack the moles as they pop up. Speed is everything.',
      icon: Gamepad2,
      color: 'bg-amber-600',
      difficulty: 'Medium',
    },
    {
      id: 'tictactoe',
      title: 'Tic-Tac-Toe',
      description: 'The classic game of X and O. Play against a friend and get three in a row.',
      icon: Grid3X3,
      color: 'bg-blue-500',
      difficulty: 'Easy',
    },
    {
      id: 'minesweeper',
      title: 'Minesweeper',
      description: 'Clear the grid without hitting a mine. A classic game of logic and deduction.',
      icon: Bomb,
      color: 'bg-stone-600',
      difficulty: 'Medium',
    },
    {
      id: 'breakout',
      title: 'Breakout',
      description: 'Classic brick-breaking action. Bounce the ball and clear all the bricks.',
      icon: Laptop,
      color: 'bg-sky-500',
      difficulty: 'Medium',
    },
    {
      id: 'flappy',
      title: 'Flappy Bird',
      description: 'Navigate through the pipes. A test of timing and patience.',
      icon: Smartphone,
      color: 'bg-cyan-500',
      difficulty: 'Hard',
    },
    {
      id: 'hangman',
      title: 'Hangman',
      description: 'Guess the hidden word before it is too late. A classic word puzzle.',
      icon: Brain,
      color: 'bg-slate-700',
      difficulty: 'Medium',
    },
    {
      id: 'simon',
      title: 'Simon Says',
      description: 'Watch the sequence and repeat it. How long can you remember?',
      icon: Grid3X3,
      color: 'bg-zinc-900',
      difficulty: 'Medium',
    },
    {
      id: 'dino',
      title: 'Dino Run',
      description: 'Jump over the obstacles in this endless runner. Speed increases over time.',
      icon: Gamepad2,
      color: 'bg-stone-800',
      difficulty: 'Medium',
    },
    {
      id: 'connect4',
      title: 'Connect Four',
      description: 'Drop discs and get four in a row. A classic strategy game for two players.',
      icon: Tablet,
      color: 'bg-blue-700',
      difficulty: 'Medium',
    },
    {
      id: 'sudoku',
      title: 'Sudoku',
      description: 'The ultimate logic puzzle. Fill the grid with numbers 1-9 without repeating.',
      icon: Grid3X3,
      color: 'bg-rose-500',
      difficulty: 'Hard',
    },
    {
      id: 'shooter',
      title: 'Space Shooter',
      description: 'Defend the galaxy! Blast through waves of alien invaders in this fast-paced shooter.',
      icon: Rocket,
      color: 'bg-purple-600',
      difficulty: 'Hard',
    },
    {
      id: 'wordsearch',
      title: 'Word Search',
      description: 'Find the hidden words in the grid. A relaxing but challenging vocabulary test.',
      icon: Type,
      color: 'bg-teal-600',
      difficulty: 'Easy',
    },
    {
      id: 'colormatch',
      title: 'Color Match',
      description: 'Match the colors as they fall. A high-speed test of your visual processing.',
      icon: Palette,
      color: 'bg-pink-500',
      difficulty: 'Medium',
    },
    {
      id: 'tower',
      title: 'Tower Stack',
      description: 'Stack the blocks as high as you can. Precision and timing are key to a stable tower.',
      icon: Layers,
      color: 'bg-indigo-600',
      difficulty: 'Medium',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      <AnimatePresence mode="wait">
        {!activeGame ? (
          <motion.main
            key="hub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto px-6 py-12 md:py-20"
          >
            <header className="mb-16 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <Gamepad2 size={24} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight flex flex-col md:flex-row md:items-baseline gap-2">
                  <span>The Pro Gaming Hub</span>
                  <span className="text-sm md:text-base font-medium text-neutral-400 tracking-normal">by Rudra Biloriya</span>
                </h1>
              </div>
              <p className="text-xl text-neutral-500 max-w-2xl leading-relaxed">
                A premium collection of cross-platform games designed for every screen. 
                No downloads, no ads, just pure play.
              </p>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              {games.map((game) => (
                <div key={game.id}>
                  <GameCard
                    title={game.title}
                    description={game.description}
                    icon={game.icon}
                    color={game.color}
                    difficulty={game.difficulty}
                    onClick={() => setActiveGame(game.id)}
                  />
                </div>
              ))}
            </section>

            {showInstallBtn && (
              <section className="mb-20 bg-black rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl border border-white/10">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] -ml-64 -mb-64" />
                
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                  <div className="text-center lg:text-left flex-1">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-500/30">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      Official Pro Release
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">Direct Download <br/><span className="text-emerald-400">Pro Launcher</span></h2>
                    <p className="text-neutral-400 max-w-md text-lg leading-relaxed mb-8">
                      Get the official high-performance launcher. One click to download, one click to play. No browser bars, just pure gaming.
                    </p>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-6 opacity-50">
                      <div className="flex items-center gap-2">
                        <Smartphone size={16} />
                        <span className="text-xs font-bold">Android / iOS</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Monitor size={16} />
                        <span className="text-xs font-bold">Windows / Mac</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bomb size={16} />
                        <span className="text-xs font-bold">0 MB Storage</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-6 w-full lg:w-auto">
                    <div className="bg-neutral-900/50 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl w-full lg:min-w-[400px]">
                      <button 
                        onClick={handleInstallClick}
                        disabled={isDownloading}
                        className="w-full flex items-center justify-center gap-5 bg-white text-black px-10 py-6 rounded-2xl font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] group relative overflow-hidden disabled:opacity-80 disabled:scale-100"
                      >
                        <div className="bg-black p-3 rounded-xl text-white group-hover:bg-emerald-500 transition-colors">
                          <Download size={32} className={isDownloading ? "animate-bounce" : ""} />
                        </div>
                        <div className="text-left">
                          <p className="text-[11px] uppercase font-bold opacity-60 leading-none mb-1">
                            {isDownloading ? "Downloading Package..." : "Get Started"}
                          </p>
                          <p className="text-2xl leading-none">
                            {isDownloading ? `${downloadProgress}% COMPLETE` : "DOWNLOAD NOW"}
                          </p>
                        </div>
                        
                        {isDownloading && (
                          <motion.div 
                            className="absolute bottom-0 left-0 h-1.5 bg-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${downloadProgress}%` }}
                          />
                        )}
                      </button>
                      
                      <div className="mt-8 space-y-4">
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-tighter text-neutral-500">
                          <span>Security Check</span>
                          <span className="text-emerald-400">Verified Safe</span>
                        </div>
                        <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                          <div className="h-full w-full bg-emerald-500/20" />
                        </div>
                        <p className="text-[10px] text-center text-neutral-600 font-bold uppercase">
                          Compatible with all modern devices
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <footer className="border-t border-neutral-200 pt-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-neutral-200 pb-12">
                <div>
                  <h4 className="font-bold text-lg mb-2">Cross-Platform Ready</h4>
                  <p className="text-neutral-500 text-sm">Optimized for touch, mouse, and keyboard inputs.</p>
                </div>
                <div className="flex gap-6 text-neutral-400">
                  <div className="flex flex-col items-center gap-1">
                    <Smartphone size={20} />
                    <span className="text-[10px] uppercase font-bold">iOS/Android</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Monitor size={20} />
                    <span className="text-[10px] uppercase font-bold">Windows</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Laptop size={20} />
                    <span className="text-[10px] uppercase font-bold">macOS</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Tablet size={20} />
                    <span className="text-[10px] uppercase font-bold">Web</span>
                  </div>
                </div>
              </div>
              <div className="py-8 text-center">
                <p className="text-neutral-400 text-xs font-medium">
                  Made by <span className="text-neutral-900 font-bold">Rudra Biloriya</span>
                </p>
              </div>
            </footer>
          </motion.main>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="fixed inset-0 z-50 overflow-auto bg-white"
          >
            {activeGame === 'snake' && <Snake onBack={() => setActiveGame(null)} />}
            {activeGame === 'memory' && <MemoryMatch onBack={() => setActiveGame(null)} />}
            {activeGame === '2048' && <Game2048 onBack={() => setActiveGame(null)} />}
            {activeGame === 'tetris' && <Tetris onBack={() => setActiveGame(null)} />}
            {activeGame === 'whack' && <WhackAMole onBack={() => setActiveGame(null)} />}
            {activeGame === 'tictactoe' && <TicTacToe onBack={() => setActiveGame(null)} />}
            {activeGame === 'minesweeper' && <Minesweeper onBack={() => setActiveGame(null)} />}
            {activeGame === 'breakout' && <Breakout onBack={() => setActiveGame(null)} />}
            {activeGame === 'flappy' && <FlappyBird onBack={() => setActiveGame(null)} />}
            {activeGame === 'hangman' && <Hangman onBack={() => setActiveGame(null)} />}
            {activeGame === 'simon' && <SimonSays onBack={() => setActiveGame(null)} />}
            {activeGame === 'dino' && <DinoRun onBack={() => setActiveGame(null)} />}
            {activeGame === 'connect4' && <ConnectFour onBack={() => setActiveGame(null)} />}
            {activeGame === 'sudoku' && <Sudoku onBack={() => setActiveGame(null)} />}
            {activeGame === 'shooter' && <SpaceShooter onBack={() => setActiveGame(null)} />}
            {activeGame === 'wordsearch' && <WordSearch onBack={() => setActiveGame(null)} />}
            {activeGame === 'colormatch' && <ColorMatch onBack={() => setActiveGame(null)} />}
            {activeGame === 'tower' && <TowerStack onBack={() => setActiveGame(null)} />}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInstallModal && (
          <InstallModal onClose={() => setShowInstallModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
