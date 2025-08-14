
import React, { useState } from 'react';
import { PromptHistoryItem } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { TrashIcon } from '../ui/icons';

interface HistoryPanelProps {
  history: PromptHistoryItem[];
  loadPrompt: (prompt: string) => void;
  clearHistory: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, loadPrompt, clearHistory }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (history.length === 0) {
    return null;
  }

  return (
    <Card>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">History</h2>
        <div className="flex items-center gap-2">
           {isOpen && (
             <Button onClick={clearHistory} variant="secondary" className="!p-2" title="Clear History">
                <TrashIcon className="h-5 w-5" />
             </Button>
           )}
          <button onClick={() => setIsOpen(!isOpen)} className="text-sm text-indigo-400 hover:underline">
            {isOpen ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>
      {isOpen && (
        <ul className="mt-4 space-y-2 max-h-48 overflow-y-auto">
          {history.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => loadPrompt(item.prompt)}
                className="w-full text-left p-2 bg-slate-700/50 hover:bg-slate-700 rounded transition-colors text-sm truncate"
              >
                {item.prompt.split('\n')[0]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default HistoryPanel;
