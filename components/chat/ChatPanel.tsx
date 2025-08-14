
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { SendIcon } from '../ui/icons';

interface ChatPanelProps {
  onSendMessage: (message: string) => void;
  history: ChatMessage[];
  isLoading: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ onSendMessage, history, isLoading }) => {
  const [message, setMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <Card className="flex flex-col h-96">
      <h2 className="text-xl font-bold mb-4 flex-shrink-0">Refine Prompt</h2>
      <div ref={chatContainerRef} className="flex-grow space-y-4 overflow-y-auto p-1 -mr-2 pr-2">
        {history.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-700'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
         {isLoading && history.length > 0 && history[history.length - 1].role === 'user' && (
           <div className="flex justify-start">
             <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg bg-slate-700">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                </div>
             </div>
           </div>
         )}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2 flex-shrink-0">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g., Make the tone more formal"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !message.trim()} className="!p-2.5">
          <SendIcon className="h-5 w-5" />
        </Button>
      </form>
    </Card>
  );
};

export default ChatPanel;
