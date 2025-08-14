
import React, { useState, useMemo } from 'react';
import { UserRole, AppSettings } from '../../types';
import { ADMIN_MASTER_KEY } from '../../constants';
import Button from '../ui/Button';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
  settings: AppSettings;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, settings }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');

  const clientCode = useMemo(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${settings.secretWord}-${day}-${month}-${year}`;
  }, [settings.secretWord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === clientCode) {
      onLogin('client');
    } else if (accessCode === ADMIN_MASTER_KEY) {
      onLogin('admin');
    } else {
      setError('Invalid access code.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
            Access Gate
          </h1>
          <p className="mt-2 text-slate-400">Enter your code to proceed.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              id="access-code"
              name="access-code"
              type="password"
              autoComplete="current-password"
              required
              value={accessCode}
              onChange={(e) => {
                setAccessCode(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
              placeholder="Access Code"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <Button type="submit" className="w-full text-lg">
            Enter
          </Button>
        </form>
        {settings.guestAccess && (
          <>
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-600"></div>
              <span className="flex-shrink mx-4 text-slate-500">OR</span>
              <div className="flex-grow border-t border-slate-600"></div>
            </div>
            <Button onClick={() => onLogin('guest')} variant="secondary" className="w-full">
              Continue as Guest
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
