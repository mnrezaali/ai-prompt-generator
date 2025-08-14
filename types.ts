
export type UserRole = 'client' | 'admin' | 'guest';

export interface AppSettings {
  secretWord: string;
  guestAccess: boolean;
}

export interface PromptHistoryItem {
  id: number;
  prompt: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
