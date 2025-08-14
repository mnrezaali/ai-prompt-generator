import React, { useState, useCallback, useEffect } from 'react';
import { UserRole, PromptHistoryItem, ChatMessage, AppSettings } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { generateInitialPromptStream, refinePromptStream } from './services/geminiService';
import LoginScreen from './components/auth/LoginScreen';
import AdminPanel from './components/auth/AdminPanel';
import PromptForm from './components/generator/PromptForm';
import RecommendedPrompts from './components/generator/RecommendedPrompts';
import PromptDisplay from './components/display/PromptDisplay';
import HistoryPanel from './components/display/HistoryPanel';
import ChatPanel from './components/chat/ChatPanel';
import { ADMIN_MASTER_KEY } from './constants';

const App: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<AppSettings>('app-settings', {
    secretWord: 'SHOWCASE',
    guestAccess: true,
  });
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [history, setHistory] = useLocalStorage<PromptHistoryItem[]>('prompt-history', []);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const handleLogin = useCallback((role: UserRole) => {
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    setUserRole(null);
  };
  
  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  const handleGeneration = useCallback(async (purpose: string, tone: string, audience: string) => {
    setIsLoading(true);
    setError(null);
    setGeneratedPrompt('');
    setChatHistory([]);

    try {
      const stream = generateInitialPromptStream(purpose, tone, audience);
      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setGeneratedPrompt(prev => prev + chunk);
      }
      setHistory(prev => [{ id: Date.now(), prompt: fullText }, ...prev.slice(0, 9)]);
    } catch (e) {
      setError('Failed to generate prompt. Please check your API key and try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [setHistory]);

  const handleRefinement = useCallback(async (message: string) => {
    setIsLoading(true);
    setError(null);

    const newChatHistory: ChatMessage[] = [
      ...chatHistory,
      { role: 'user', content: message }
    ];
    setChatHistory(newChatHistory);
    
    // The Gemini API needs the current prompt as the first "model" message
    const apiChatHistory: ChatMessage[] = [{ role: 'model', content: generatedPrompt }, ...newChatHistory];
    
    setGeneratedPrompt('');

    try {
      const stream = refinePromptStream(apiChatHistory);
      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setGeneratedPrompt(prev => prev + chunk);
      }
      setChatHistory(prev => [...prev, { role: 'model', content: fullText }]);
      setHistory(prev => [{ id: Date.now(), prompt: fullText }, ...prev.slice(0, 9)]);
    } catch (e) {
      setError('Failed to refine prompt. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [generatedPrompt, chatHistory, setHistory]);

  const loadFromHistory = useCallback((prompt: string) => {
    setGeneratedPrompt(prompt);
    setChatHistory([]);
    setError(null);
  }, []);

  if (!userRole) {
    return <LoginScreen onLogin={handleLogin} settings={settings} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10 relative">
           <button 
             onClick={handleLogout}
             className="absolute top-0 right-0 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
           >
             Logout
           </button>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text mb-2">
            AI Assistant Prompt Generator
          </h1>
          <p className="text-slate-400 text-lg">
            Craft powerful, structured system prompts for any AI assistant.
          </p>
        </header>

        {userRole === 'admin' && (
          <AdminPanel settings={settings} onSettingsChange={handleSettingsChange} />
        )}

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <PromptForm onGenerate={handleGeneration} isLoading={isLoading} />
            <RecommendedPrompts onSelect={handleGeneration} isLoading={isLoading}/>
          </div>
          <div className="space-y-8">
            <HistoryPanel history={history} loadPrompt={loadFromHistory} clearHistory={() => setHistory([])} />
            <PromptDisplay prompt={generatedPrompt} isLoading={isLoading} error={error} />
            {generatedPrompt && !isLoading && !error && (
              <ChatPanel onSendMessage={handleRefinement} history={chatHistory} isLoading={isLoading} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
