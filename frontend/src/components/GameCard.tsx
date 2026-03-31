import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { TStory } from '../types';
import { ChevronRight, Award } from 'lucide-react';

interface GameCardProps {
  story: TStory;
}

const GameCard: React.FC<GameCardProps> = ({ story }) => {
  const navigate = useNavigate();

  const difficultyColors = {
    easy: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
    medium: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    hard: 'text-rose-400 border-rose-400/30 bg-rose-400/10',
  };

  const handleStartGame = () => {
    navigate(`/game/${story.id}`);
  };

  return (
    <div 
      onClick={handleStartGame}
      className="group relative bg-slate-800/50 border border-slate-700 hover:border-amber-400/50 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(251,191,36,0.1)] hover:-translate-y-1 overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Award size={100} />
      </div>

      <div className="flex justify-between items-start mb-4">
        <span className={`text-xs font-bold px-2 py-1 rounded border ${difficultyColors[story.difficulty]}`}>
          {story.difficulty.toUpperCase()}
        </span>
        <div className="flex gap-1">
          {story.tags.map(tag => (
            <span key={tag} className="text-[10px] text-slate-400 bg-slate-900/50 px-2 py-0.5 rounded-full border border-slate-700">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-amber-400 transition-colors">
        {story.title}
      </h3>

      <p className="text-sm text-slate-400 line-clamp-2 mb-6 leading-relaxed">
        {story.surface}
      </p>

      <div className="flex items-center text-amber-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
        <span>开始推理</span>
        <ChevronRight size={16} className="ml-1" />
      </div>
    </div>
  );
};

export default GameCard;
