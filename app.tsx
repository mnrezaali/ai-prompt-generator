

import React, { useState, useCallback, useEffect, memo, useRef } from 'react';
import { SparklesIcon, CopyIcon, CheckIcon, SpinnerIcon, EyeIcon, EyeSlashIcon, ArrowLeftOnRectangleIcon, ClockIcon, TrashIcon, ChevronDownIcon, PaperAirplaneIcon } from './components/icons.tsx';

// --- ACCESS CONTROL CONFIGURATION ---
const ADMIN_ACCESS_CODE = 'ADMIN_MASTER_KEY';
const DEFAULT_ACCESS_BASE_SECRET = 'SHOWCASE';

const toneOptions = ['Professional', 'Friendly', 'Witty', 'Empathetic', 'Formal', 'Casual'];

const recommendedPrompts = [
    {
        title: 'The Productivity Assistant',
        description: 'Helps organize your day, draft emails, and create meeting agendas.',
        fullPrompt: 'I want to create a Productivity Assistant. It should be an expert in time management, task prioritization, and streamlining workflows. Its purpose is to help users organize their day, draft quick emails, and create meeting agendas.'
    },
    {
        title: 'The Business Strategist',
        description: 'For competitive analysis, market research, and developing project frameworks.',
        fullPrompt: 'I want to create a Business Strategist assistant. It should act as a seasoned business consultant and analyst. Its purpose is to help with high-level thinking, competitive analysis, market research, and developing frameworks for new projects.'
    },
    {
        title: 'The Learning & Research Assistant',
        description: 'Summarizes documents, creates study guides, and deepens understanding.',
        fullPrompt: 'I want to create a Learning & Research Assistant. It should act as a Socratic tutor and expert researcher. Its purpose is to multiply a user\'s ability to learn and digest information by summarizing large documents, creating study guides, and asking clarifying questions to deepen understanding.'
    },
    {
        title: 'The Creativity & Content Generation Assistant',
        description: 'Writes social media posts, brainstorms marketing ideas, and drafts headlines.',
        fullPrompt: 'I want to create a Creativity & Content Generation Assistant. It should act as a professional copywriter and creative director. Its purpose is to help with all creative tasks, from writing social media posts and brainstorming marketing ideas to drafting compelling headlines.'
    },
    {
        title: 'The Team & Leadership Coach',
        description: 'Helps navigate difficult conversations and motivate teams.',
        fullPrompt: 'I want to create a Team & Leadership Coach. It should be an expert in team dynamics, motivation, and leadership principles. Its purpose is to help a user navigate difficult conversations, prepare for performance reviews, or develop a plan to motivate a team.'
    }
];

// --- UI COMPONENTS ---

const AppHeader: React.FC<{ subtitle: string }> = ({ subtitle }) => (
    <header className="text-center my-8">
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
            AI Assistant Prompt Generator
        </h1>
        <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            {subtitle}
        </p>
    </header>
);

const RecommendedPromptCard: React.FC<{ title: string; description: string; onSelect: () => void; }> = ({ title, description, onSelect }) => (
    <div
        onClick={onSelect}
        className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-indigo-500 hover:bg-slate-700/50 cursor-pointer transition-all duration-200 h-full flex flex-col hover:shadow-xl hover:scale-[1.02]"
        role="button"
        tabIndex={0}
        onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
    >
        <h4 className="font-bold text-slate-200">{title}</h4>
        <p className="text-sm text-slate-400 mt-1 flex-grow">{description}</p>
    </div>
);


const PromptOutput: React.FC<{ prompt: string; isLoading: boolean; error: string | null }> = memo(({ prompt, isLoading, error }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    if (isLoading && !prompt) {
        return (
            <div className="w-full bg-slate-800 rounded-lg p-8 flex flex-col items-center justify-center min-h-[384px] animate-pulse">
                <SpinnerIcon className="w-12 h-12 text-indigo-400 animate-spin" />
                <p className="mt-4 text-slate-400">Generating your prompt...</p>
                <p className="mt-2 text-sm text-slate-500">The AI is thinking. Please wait a moment.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-red-300 animate-fade-in-up">
                <h3 className="font-bold">An Error Occurred</h3>
                <p className="mt-2">{error}</p>
            </div>
        );
    }
    
    if (!prompt && !isLoading) {
        return (
            <div className="w-full bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center min-h-[384px]">
                <SparklesIcon className="w-16 h-16 text-slate-600" />
                <p className="mt-4 text-slate-500 text-center">Your generated prompt will appear here.</p>
                <p className="mt-1 text-sm text-slate-600 text-center">Describe your assistant above and click 'Generate Prompt' to begin.</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-slate-800 rounded-xl shadow-lg p-6 relative animate-fade-in-up">
            <button
                onClick={handleCopy}
                className="absolute top-4 right-4 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-1.5 px-3 rounded-lg flex items-center transition-all duration-200"
                aria-label="Copy prompt"
            >
                {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                <span className="ml-2 text-sm">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-slate-100 whitespace-pre-wrap font-sans text-base leading-relaxed">
                 {prompt.split('\n').map((line, index) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                        return <h2 key={index} className="text-xl font-bold text-indigo-300 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h2>;
                    }
                     if (line.startsWith('* ')) {
                         return <p key={index} className="flex items-start"><span className="text-indigo-400 mr-3 mt-1">&#8226;</span><span>{line.substring(2)}</span></p>;
                    }
                    return <p key={index}>{line}</p>;
                 })}
            </div>
        </div>
    );
});

const AccessGate: React.FC<{ 
    onUnlock: (level: 'client' | 'admin') => void; 
    baseSecret: string;
    isGateEnabled: boolean;
}> = ({ onUnlock, baseSecret, isGateEnabled }) => {
    const [inputCode, setInputCode] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!inputCode) return;

        const now = new Date();
        const day = String(now.getUTCDate()).padStart(2, '0');
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const year = now.getUTCFullYear();
        const correctClientCode = `${baseSecret}-${day}-${month}-${year}`;

        if (inputCode === ADMIN_ACCESS_CODE) {
            setError('');
            onUnlock('admin');
        } else if (inputCode === correctClientCode) {
            setError('');
            onUnlock('client');
        } else {
            setError('Your access code is invalid or has expired. Please contact me at your.email@example.com for a new code.');
        }
    };

    return (
        <>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 w-full">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="relative">
                         <input
                            type={showPassword ? 'text' : 'password'}
                            value={inputCode}
                            onChange={(e) => {
                                setInputCode(e.target.value);
                                if(error) setError('');
                            }}
                            placeholder="Enter access code"
                            className="w-full p-3 pr-10 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                            aria-label="Access Code"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-200"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeSlashIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
                        </button>
                    </div>

                     {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
                        disabled={!inputCode}
                    >
                        Unlock
                    </button>
                </form>

                 {!isGateEnabled && (
                    <>
                        <div className="relative flex py-5 items-center">
                          <div className="flex-grow border-t border-slate-600"></div>
                          <span className="flex-shrink mx-4 text-slate-500 text-sm">OR</span>
                          <div className="flex-grow border-t border-slate-600"></div>
                        </div>
                        <button
                            onClick={() => onUnlock('client')}
                            className="w-full inline-flex items-center justify-center px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500"
                        >
                           Continue as Guest
                        </button>
                    </>
                 )}

            </div>
             <div className="text-center mt-8 text-slate-500 text-sm">
                <p>An app coded by Reza Ali and Google AI Studio.</p>
                <p>For non-commercial use only.</p>
            </div>
        </>
    );
};

const AdminPanel: React.FC<{
    currentSecret: string;
    onSecretChange: (newSecret: string) => void;
    isGateEnabled: boolean;
    onGateToggle: (isEnabled: boolean) => void;
}> = ({ currentSecret, onSecretChange, isGateEnabled, onGateToggle }) => {
    const [localSecret, setLocalSecret] = useState(currentSecret);
    const [secretSaved, setSecretSaved] = useState(false);

    const handleSecretSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSecretChange(localSecret);
        setSecretSaved(true);
        setTimeout(() => setSecretSaved(false), 2500);
    };

    return (
        <div className="w-full bg-slate-800/50 border border-amber-400/30 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-amber-300">Admin Controls</h3>
            <p className="text-slate-400 text-sm mt-1">Changes are saved to your browser's local storage.</p>
            <div className="mt-6 space-y-6 divide-y divide-slate-700">
                <form onSubmit={handleSecretSave} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-6 first:pt-0">
                    <div className="flex-grow w-full">
                        <label htmlFor="access-secret" className="block text-sm font-medium text-slate-300 mb-1">
                            Client Access Secret Word
                        </label>
                        <input
                            id="access-secret"
                            type="text"
                            value={localSecret}
                            onChange={(e) => setLocalSecret(e.target.value)}
                            className="w-full p-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full sm:w-auto mt-2 sm:mt-0 sm:self-end px-5 py-2 bg-amber-600 text-white font-semibold rounded-lg shadow-md hover:bg-amber-700 disabled:bg-amber-900/50 transition-all duration-200"
                    >
                        {secretSaved ? 'Saved!' : 'Save Secret'}
                    </button>
                </form>
                <div className="pt-6">
                     <label className="block text-sm font-medium text-slate-300">
                        Require Access Code for Clients
                     </label>
                      <p className="text-xs text-slate-500 mt-1 mb-3">If disabled, clients can enter the app as a guest without a code.</p>
                     <button
                        type="button"
                        onClick={() => onGateToggle(!isGateEnabled)}
                        className={`${isGateEnabled ? 'bg-indigo-600' : 'bg-slate-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
                        role="switch"
                        aria-checked={isGateEnabled}
                    >
                        <span
                            aria-hidden="true"
                            className={`${isGateEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};

const HistoryPanel: React.FC<{
    history: string[];
    onSelect: (prompt: string) => void;
    onClear: () => void;
}> = ({ history, onSelect, onClear }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (history.length === 0) return null;

    return (
        <div className="w-full bg-slate-800/50 border border-slate-700 rounded-xl mb-8">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left"
            >
                <div className="flex items-center gap-3">
                    <ClockIcon className="w-6 h-6 text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-200">Generation History</h3>
                </div>
                <div className='flex items-center gap-4'>
                    {isOpen && (
                         <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                if (window.confirm('Are you sure you want to clear the generation history? This action cannot be undone.')) {
                                    onClear();
                                }
                            }}
                            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-400 transition-colors"
                            aria-label="Clear History"
                         >
                            <TrashIcon className="w-4 h-4" />
                            <span>Clear</span>
                         </button>
                    )}
                    <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-slate-700 max-h-60 overflow-y-auto">
                    <ul className="space-y-2">
                        {history.map((item, index) => (
                            <li key={index}>
                                <button
                                    onClick={() => onSelect(item)}
                                    className="w-full text-left p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-sm text-slate-300 truncate"
                                >
                                    {item.split('\n')[0]}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

type ChatMessage = { role: 'user' | 'model'; text: string; };

const ChatPanel: React.FC<{
    chatHistory: ChatMessage[];
    isLoading: boolean;
    onSendMessage: (message: string) => void;
}> = memo(({ chatHistory, isLoading, onSendMessage }) => {
    const [input, setInput] = useState('');
    const chatEndRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="mt-8 w-full bg-slate-800/50 border border-slate-700 rounded-xl">
            <div className="p-4 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-slate-200">Refine Prompt</h3>
                <p className="text-sm text-slate-400">Chat with the AI to make changes to the prompt above.</p>
            </div>
            <div className="p-4 h-80 overflow-y-auto space-y-4" aria-live="polite">
                {chatHistory.slice(1).map((msg, index) => ( // Omit the first model message (the full prompt)
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xl p-3 rounded-xl ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="max-w-xl p-3 rounded-xl bg-slate-700 text-slate-200 flex items-center gap-2">
                            <SpinnerIcon className="w-5 h-5 animate-spin" />
                            <span>AI is thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700 flex gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g., 'Make it more empathetic' or 'Add a rule to never give financial advice'"
                    className="flex-grow p-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="px-5 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed"
                    disabled={isLoading || !input.trim()}
                    aria-label="Send message"
                >
                    <PaperAirplaneIcon className="h-6 w-6" />
                </button>
            </form>
        </div>
    )
});


function App() {
    // --- STATE MANAGEMENT ---
    const [accessLevel, setAccessLevel] = useState<'none' | 'client' | 'admin'>('none');
    const [accessSecret, setAccessSecret] = useState(() => localStorage.getItem('accessSecret') || DEFAULT_ACCESS_BASE_SECRET);
    const [isGateEnabled, setIsGateEnabled] = useState(() => {
        const storedValue = localStorage.getItem('isGateEnabled');
        return storedValue !== null ? JSON.parse(storedValue) : true;
    });

    // Core generation state
    const [userInput, setUserInput] = useState('');
    const [tone, setTone] = useState(toneOptions[0]);
    const [targetAudience, setTargetAudience] = useState('');
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // History state
    const [history, setHistory] = useState<string[]>([]);

    // Chat refinement state
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    
    // Refs for focus management
    const resultsContainerRef = useRef<HTMLDivElement>(null);


    // --- EFFECTS ---
    useEffect(() => {
        if (accessLevel === 'admin') {
            localStorage.setItem('accessSecret', accessSecret);
        }
    }, [accessSecret, accessLevel]);

    useEffect(() => {
        localStorage.setItem('isGateEnabled', JSON.stringify(isGateEnabled));
    }, [isGateEnabled]);
    
    useEffect(() => {
        const storedHistory = localStorage.getItem('generationHistory');
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        }
    }, []);

    // Effect for focus and scroll management
    useEffect(() => {
        // When a generation finishes (successfully or with an error), scroll to and focus the results.
        if (!isLoading && (generatedPrompt || error)) {
            resultsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
             // Add a small delay for the content to render before focusing
            setTimeout(() => {
                resultsContainerRef.current?.focus({ preventScroll: true });
            }, 100);
        }
    }, [isLoading, generatedPrompt, error]);

    const saveHistory = useCallback((newPrompt: string) => {
        setHistory(prev => {
            const updatedHistory = [newPrompt, ...prev.filter(p => p !== newPrompt)].slice(0, 10);
            localStorage.setItem('generationHistory', JSON.stringify(updatedHistory));
            return updatedHistory;
        });
    }, []);

    const handleSelectHistory = (prompt: string) => {
        setGeneratedPrompt(prompt);
        // Reset chat when loading from history
        setChatHistory([{ role: 'model', text: prompt }]);
    };
    
    const handleClearHistory = () => {
        setHistory([]);
        localStorage.removeItem('generationHistory');
    };
    
    const processStream = async (stream: ReadableStream<Uint8Array>, onChunk: (text: string) => void) => {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = decoder.decode(value);
            onChunk(text);
        }
    };

    // --- API HANDLERS ---
    const handleGeneratePrompt = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userInput.trim()) {
            setError('Please enter a description for your AI assistant.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedPrompt('');
        setChatHistory([]);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'generate',
                    userInput,
                    tone,
                    targetAudience
                })
            });

            if (!response.ok || !response.body) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response from server.' }));
                throw new Error(errorData.error || `Request failed: ${response.statusText}`);
            }

            let fullText = "";
            await processStream(response.body, (chunkText) => {
                fullText += chunkText;
                setGeneratedPrompt(prev => prev + chunkText);
            });

            if (!fullText) throw new Error("Received an empty response from the AI.");
            
            saveHistory(fullText);
            setChatHistory([{ role: 'model', text: fullText }]);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [userInput, tone, targetAudience, saveHistory]);
    
    const handleSendMessage = useCallback(async (message: string) => {
        if (isChatLoading) return;

        setIsChatLoading(true);
        const currentChatHistory = [...chatHistory, { role: 'user' as 'user', text: message }];
        setChatHistory(currentChatHistory);
        
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'refine',
                    message,
                    chatHistory
                })
            });

            if (!response.ok || !response.body) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response from server.' }));
                throw new Error(errorData.error || `Request failed: ${response.statusText}`);
            }

            let fullResponse = "";
            setChatHistory(prev => [...prev, { role: 'model', text: '' }]);

            await processStream(response.body, (chunkText) => {
                 fullResponse += chunkText;
                 setChatHistory(prev => {
                     const newHistory = [...prev];
                     const lastMessageIndex = newHistory.length - 1;
                     if (lastMessageIndex >= 0) {
                         const lastMessage = newHistory[lastMessageIndex];
                         if (lastMessage.role === 'model') {
                             newHistory[lastMessageIndex] = { ...lastMessage, text: fullResponse };
                         }
                     }
                     return newHistory;
                 });
            });

            setGeneratedPrompt(fullResponse);
            saveHistory(fullResponse);

        } catch(err) {
            const errorMessage = err instanceof Error ? err.message : 'Sorry, an unknown error occurred.';
            setChatHistory(prev => {
                const updatedHistory = [...prev];
                const lastMessageIndex = updatedHistory.length - 1;
                 if (lastMessageIndex >= 0) {
                    const lastMessage = updatedHistory[lastMessageIndex];
                     if (lastMessage?.role === 'model') {
                        updatedHistory[lastMessageIndex] = { ...lastMessage, text: `An error occurred during refinement: ${errorMessage}` };
                     }
                 }
                return updatedHistory;
            });
        } finally {
            setIsChatLoading(false);
        }

    }, [chatHistory, isChatLoading, saveHistory]);


    // --- RENDER LOGIC ---
    if (accessLevel === 'none') {
         return (
             <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-start pt-12 sm:pt-16 p-4">
                <div className="w-full max-w-md mx-auto">
                    <AppHeader subtitle="Describe your ideal AI assistant, and we'll craft the perfect system prompt for you using Gemini."/>
                    <div className="mt-[-0.5rem]">
                        <AccessGate onUnlock={setAccessLevel} baseSecret={accessSecret} isGateEnabled={isGateEnabled}/>
                    </div>
                </div>
            </div>
         );
    }
    
    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl mx-auto">
                
                {accessLevel === 'admin' && (
                    <AdminPanel 
                        currentSecret={accessSecret} 
                        onSecretChange={setAccessSecret}
                        isGateEnabled={isGateEnabled}
                        onGateToggle={setIsGateEnabled}
                    />
                )}

                <AppHeader subtitle="Describe your ideal AI assistant, and we'll craft the perfect system prompt for you using Gemini." />

                <main className="flex flex-col gap-8">
                    <form onSubmit={handleGeneratePrompt} className="w-full flex flex-col gap-6 p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
                        <div>
                            <label htmlFor="userInput" className="text-base font-semibold text-slate-300">
                                1. Describe the AI assistant you want to create
                            </label>
                            <textarea
                                id="userInput"
                                value={userInput}
                                onChange={(e) => { setUserInput(e.target.value); if(error) setError(null); }}
                                placeholder="e.g., 'An AI assistant that is an expert in mental health and wellness' or 'A witty sommelier AI that suggests wine pairings for meals'"
                                className="w-full mt-2 min-h-[120px] p-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                                rows={4}
                                disabled={isLoading}
                                aria-required="true"
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="tone" className="text-base font-semibold text-slate-300">2. Select a Tone</label>
                                <select 
                                    id="tone" 
                                    value={tone} 
                                    onChange={(e) => setTone(e.target.value)}
                                    className="w-full mt-2 p-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500"
                                    disabled={isLoading}
                                >
                                    {toneOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="targetAudience" className="text-base font-semibold text-slate-300">3. Define Target Audience <span className="text-slate-400 font-normal">(Optional)</span></label>
                                <input
                                    type="text"
                                    id="targetAudience"
                                    value={targetAudience}
                                    onChange={(e) => setTargetAudience(e.target.value)}
                                    placeholder="e.g., 'Software developers' or 'Children under 10'"
                                    className="w-full mt-2 p-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={isLoading || !userInput}
                            className="w-full sm:w-auto self-end inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
                        >
                            {isLoading ? (
                                <>
                                    <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="-ml-1 mr-2 h-5 w-5" />
                                    Generate Prompt
                                </>
                             )}
                        </button>
                    </form>

                    <div className="w-full">
                        <h3 className="text-lg font-semibold text-slate-300 mb-4 text-center">
                            Need inspiration? Try an example.
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recommendedPrompts.map((prompt, index) => (
                                <RecommendedPromptCard 
                                    key={index}
                                    title={prompt.title}
                                    description={prompt.description}
                                    onSelect={() => {
                                        setUserInput(prompt.fullPrompt);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    
                    <HistoryPanel history={history} onSelect={handleSelectHistory} onClear={handleClearHistory} />

                    <div 
                      ref={resultsContainerRef} 
                      className="w-full mt-4 focus:outline-none" 
                      tabIndex={-1} 
                      aria-live="polite"
                    >
                       <PromptOutput prompt={generatedPrompt} isLoading={isLoading} error={error} />
                       {chatHistory.length > 0 && <ChatPanel chatHistory={chatHistory} isLoading={isChatLoading} onSendMessage={handleSendMessage} />}
                    </div>
                </main>
                
                 <footer className="text-center mt-12 text-slate-500 text-sm">
                    <p>Powered by Google Gemini. Generated prompts are suggestions and should be reviewed.</p>
                     <p className="mt-4">An app coded by Reza Ali and Google AI Studio. For non-commercial use only.</p>
                     <div className="mt-6">
                        <button 
                            onClick={() => {
                                setAccessLevel('none');
                                setGeneratedPrompt('');
                                setChatHistory([]);
                                setError(null);
                            }}
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors"
                        >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                            <span>Switch Access</span>
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default App;