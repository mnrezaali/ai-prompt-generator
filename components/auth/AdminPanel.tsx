
import React, { useState } from 'react';
import { AppSettings } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface AdminPanelProps {
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ settings, onSettingsChange }) => {
  const [secretWord, setSecretWord] = useState(settings.secretWord);
  const [guestAccess, setGuestAccess] = useState(settings.guestAccess);

  const handleSave = () => {
    onSettingsChange({ secretWord, guestAccess });
    alert('Settings saved!');
  };

  return (
    <Card className="mb-8 border-amber-500/50">
      <h2 className="text-2xl font-bold mb-4 text-amber-400">Admin Panel</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="secret-word" className="block text-sm font-medium text-slate-300 mb-1">
            Client Secret Word
          </label>
          <input
            id="secret-word"
            type="text"
            value={secretWord}
            onChange={(e) => setSecretWord(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Enable Guest Access</span>
          <label htmlFor="guest-access-toggle" className="inline-flex relative items-center cursor-pointer">
            <input
              type="checkbox"
              id="guest-access-toggle"
              className="sr-only peer"
              checked={guestAccess}
              onChange={() => setGuestAccess(!guestAccess)}
            />
            <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
          </label>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} variant="warning">
            Save Settings
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AdminPanel;
