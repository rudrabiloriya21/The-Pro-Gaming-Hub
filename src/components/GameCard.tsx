import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface GameCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  onClick: () => void;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export default function GameCard({ title, description, icon: Icon, color, onClick, difficulty }: GameCardProps) {
  return (
    <motion.button
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative bg-white rounded-3xl p-6 text-left shadow-sm hover:shadow-xl transition-all border border-neutral-100 overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-150 ${color}`} />
      
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-6 ${color} text-white shadow-lg`}>
        <Icon size={28} />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-neutral-900">{title}</h3>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
            difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
            difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
            'bg-rose-100 text-rose-700'
          }`}>
            {difficulty}
          </span>
        </div>
        <p className="text-neutral-500 text-sm leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-6 flex items-center text-sm font-bold text-neutral-900 group-hover:translate-x-1 transition-transform">
        Play Now
        <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </motion.button>
  );
}
