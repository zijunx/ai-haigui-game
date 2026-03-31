import React from 'react';
import { useNavigate } from 'react-router-dom';

const Result: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-4xl font-bold mb-6 text-emerald-400 drop-shadow-md">剧透时刻</h2>
      <p className="text-gray-300 mb-8 max-w-md text-center">
        “红鞋其实是血染红的，真相总是充满残酷。”
      </p>
      
      <div className="w-full max-w-lg bg-slate-800 rounded-lg shadow-xl p-6 mb-8 border border-slate-700">
         <h3 className="text-xl text-amber-500 font-bold mb-4">通关评价</h3>
         <p className="text-gray-300">⭐ ⭐ ⭐ 逻辑大师</p>
         <p className="text-sm text-slate-500 mt-2">共使用 0 次提示，提问 12 次揭开真相</p>
      </div>

      <button 
        onClick={() => navigate('/')}
        className="px-8 py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-lg font-semibold transition-colors mt-8"
      >
        返回主界面
      </button>
    </div>
  );
};

export default Result;
