
import React from 'react';
import Card from '../ui/Card';
import { RECOMMENDED_PROMPTS } from '../../constants';

interface RecommendedPromptsProps {
  onSelect: (purpose: string, tone: string, audience:string) => void;
  isLoading: boolean;
}

const RecommendedPrompts: React.FC<RecommendedPromptsProps> = ({ onSelect, isLoading }) => {
  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Or, start with an idea...</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RECOMMENDED_PROMPTS.map((prompt) => (
          <button
            key={prompt.title}
            onClick={() => onSelect(prompt.purpose, prompt.tone, prompt.audience)}
            disabled={isLoading}
            className="p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <h3 className="font-semibold text-indigo-400">{prompt.title}</h3>
            <p className="text-sm text-slate-400">{prompt.description}</p>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default RecommendedPrompts;
