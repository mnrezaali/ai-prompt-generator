
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';
import { CopyIcon, CheckIcon } from '../ui/icons';

interface PromptDisplayProps {
  prompt: string;
  isLoading: boolean;
  error: string | null;
}

const FormattedPrompt: React.FC<{ text: string }> = React.memo(({ text }) => {
  const parts = text.split(/(\*\*.*?\*\*)/g).filter(part => part.length > 0);

  return (
    <div className="prose prose-invert prose-slate max-w-none">
        {parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="text-indigo-400">{part.slice(2, -2)}</strong>;
            }
            return <span key={index}>{part}</span>;
        })}
    </div>
  );
});
FormattedPrompt.displayName = 'FormattedPrompt';


const PromptDisplay: React.FC<PromptDisplayProps> = ({ prompt, isLoading, error }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const renderContent = () => {
    if (isLoading && !prompt) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <Spinner />
          <p className="text-slate-400">Generating your prompt...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex items-center justify-center h-full text-center text-red-400">
          <p>{error}</p>
        </div>
      );
    }
    if (!prompt && !isLoading) {
      return (
        <div className="flex items-center justify-center h-full text-center">
          <p className="text-slate-500">Your generated prompt will appear here.</p>
        </div>
      );
    }
    return <FormattedPrompt text={prompt} />;
  };

  return (
    <Card className="min-h-[400px] flex flex-col relative">
      <div className="flex-grow overflow-y-auto pr-4 -mr-4">
        {renderContent()}
      </div>
      {prompt && !isLoading && !error && (
        <div className="absolute top-4 right-4">
          <Button onClick={handleCopy} variant="secondary" className="!p-2">
            {copied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <CopyIcon className="h-5 w-5" />}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default PromptDisplay;
