import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HangmanProps {
  onBack: () => void;
}

const WORDS = ['REACT', 'TYPESCRIPT', 'VITE', 'TAILWIND', 'GAMING', 'DEVELOPER', 'JAVASCRIPT', 'BROWSER', 'INTERFACE', 'COMPONENT'];

export default function Hangman({ onBack }: HangmanProps) {
  const [word, setWord] = useState('');
  const [guessed, setGuessed] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'win' | 'loss'>('playing');

  const initGame = () => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWord(randomWord);
    setGuessed([]);
    setMistakes(0);
    setGameState('playing');
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleGuess = (letter: string) => {
    if (gameState !== 'playing' || guessed.includes(letter)) return;

    setGuessed(prev => [...prev, letter]);

    if (!word.includes(letter)) {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (newMistakes >= 6) setGameState('loss');
    } else {
      const allGuessed = word.split('').every(l => [...guessed, letter].includes(l));
      if (allGuessed) {
        setGameState('win');
        confetti({ particleCount: 150, spread: 70 });
      }
    }
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md flex justify-between items-center mb-12">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-900">
          <ArrowLeft size={24} />
        </button>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Mistakes</p>
          <p className="text-2xl font-black text-rose-600">{mistakes}/6</p>
        </div>
      </div>

      <div className="mb-12 flex flex-col items-center">
        {/* Hangman Drawing */}
        <svg width="120" height="120" className="mb-8 stroke-slate-900 stroke-[4] fill-none">
          <path d="M20 110 L100 110 M40 110 L40 10 L80 10 L80 30" />
          {mistakes > 0 && <circle cx="80" cy="40" r="10" />}
          {mistakes > 1 && <path d="M80 50 L80 80" />}
          {mistakes > 2 && <path d="M80 60 L65 70" />}
          {mistakes > 3 && <path d="M80 60 L95 70" />}
          {mistakes > 4 && <path d="M80 80 L65 95" />}
          {mistakes > 5 && <path d="M80 80 L95 95" />}
        </svg>

        <div className="flex gap-2 mb-8">
          {word.split('').map((letter, i) => (
            <div key={i} className="w-8 h-10 border-b-4 border-slate-900 flex items-center justify-center text-2xl font-black">
              {guessed.includes(letter) || gameState === 'loss' ? letter : ''}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 max-w-md">
          {alphabet.map(letter => (
            <button
              key={letter}
              onClick={() => handleGuess(letter)}
              disabled={guessed.includes(letter) || gameState !== 'playing'}
              className={`w-10 h-10 rounded-lg font-bold transition-all ${
                guessed.includes(letter)
                  ? word.includes(letter) ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  : 'bg-white text-slate-900 shadow-sm hover:shadow-md active:scale-95'
              } disabled:opacity-50`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {gameState !== 'playing' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl text-center border-8 border-slate-100">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              gameState === 'win' ? 'bg-yellow-100 text-yellow-600' : 'bg-rose-100 text-rose-600'
            }`}>
              {gameState === 'win' ? <Trophy size={48} /> : <RotateCcw size={48} />}
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-2">
              {gameState === 'win' ? 'You Won!' : 'Game Over'}
            </h2>
            <p className="text-slate-500 font-medium mb-8">
              {gameState === 'win' ? 'Brilliant guessing!' : `The word was ${word}`}
            </p>
            <button 
              onClick={initGame}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 px-8 rounded-3xl transition-all flex items-center justify-center gap-3 text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <RotateCcw size={24} />
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
