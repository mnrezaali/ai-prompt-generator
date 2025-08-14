
import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { TONE_OPTIONS } from '../../constants';
import Spinner from '../ui/Spinner';

interface PromptFormProps {
  onGenerate: (purpose: string, tone: string, audience: string) => void;
  isLoading: boolean;
}

const PromptForm: React.FC<PromptFormProps> = ({ onGenerate, isLoading }) => {
  const [purpose, setPurpose] = useState('');
  const [tone, setTone] = useState(TONE_OPTIONS[0]);
  const [audience, setAudience] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (purpose.trim()) {
      onGenerate(purpose, tone, audience);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-slate-300 mb-1">
            Assistant's Purpose
          </label>
          <textarea
            id="purpose"
            rows={4}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., An expert copywriter for marketing emails"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-slate-300 mb-1">
              Tone
            </label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {TONE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="audience" className="block text-sm font-medium text-slate-300 mb-1">
              Target Audience (Optional)
            </label>
            <input
              id="audience"
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Small business owners"
            />
          </div>
        </div>
        <Button type="submit" disabled={isLoading || !purpose.trim()} className="w-full">
          {isLoading ? <><Spinner size="sm" /> Generating...</> : 'Generate Prompt'}
        </Button>
      </form>
    </Card>
  );
};

export default PromptForm;
