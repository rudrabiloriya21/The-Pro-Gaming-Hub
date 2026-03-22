import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Brain, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MemoryMatchProps {
  onBack: () => void;
}

const EMOJIS = ['🎮', '🕹️', '🎲', '🧩', '👾', '🚀', '🌈', '🔥', '⚡', '💎', '🍀', '🍎'];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryMatch({ onBack }: MemoryMatchProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const initializeGame = useCallback(() => {
    const duplicatedEmojis = [...EMOJIS, ...EMOJIS];
    const shuffled = duplicatedEmojis
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched || gameOver) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstId, secondId] = newFlipped;

      if (cards[firstId].emoji === cards[secondId].emoji) {
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[firstId].isMatched = true;
          matchedCards[secondId].isMatched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          setMatches(m => {
            const newMatches = m + 1;
            if (newMatches === EMOJIS.length) {
              setGameOver(true);
              confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 }
              });
            }
            return newMatches;
          });
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstId].isFlipped = false;
          resetCards[secondId].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-100 p-4">
      <div className="w-full max-w-2xl flex justify-between items-center mb-8">
        <button onClick={onBack} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-600">
          <ArrowLeft size={24} />
        </button>
        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-xs text-stone-500 uppercase font-bold tracking-widest">Moves</p>
            <p className="text-2xl font-black text-stone-800">{moves}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-stone-500 uppercase font-bold tracking-widest">Matches</p>
            <p className="text-2xl font-black text-stone-800">{matches}/{EMOJIS.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 w-full max-w-2xl">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`aspect-square relative transition-all duration-500 transform preserve-3d ${
              card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
            }`}
          >
            <div className={`absolute inset-0 backface-hidden bg-white border-2 border-stone-200 rounded-2xl shadow-sm flex items-center justify-center text-stone-300 ${!card.isMatched && !card.isFlipped ? 'hover:border-stone-400 hover:shadow-md' : ''}`}>
              <Brain size={24} />
            </div>
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white border-2 border-emerald-400 rounded-2xl shadow-inner flex items-center justify-center text-4xl">
              {card.emoji}
            </div>
            {card.isMatched && (
              <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl pointer-events-none" />
            )}
          </button>
        ))}
      </div>

      {gameOver && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy size={40} />
            </div>
            <h2 className="text-3xl font-black text-stone-800 mb-2">Well Done!</h2>
            <p className="text-stone-500 mb-8">You matched all pairs in {moves} moves.</p>
            <button 
              onClick={initializeGame}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} />
              Play Again
            </button>
          </div>
        </div>
      )}

      <style>{`
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
