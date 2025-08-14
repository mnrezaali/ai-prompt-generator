import { ChatMessage } from '../types';

async function* streamApiResponse(url: string, body: object) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text();
    throw new Error(`API request failed with status ${response.status}: ${errorText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    yield decoder.decode(value, { stream: true });
  }
}


export function generateInitialPromptStream(purpose: string, tone: string, audience: string) {
  return streamApiResponse('/api/generate', { type: 'initial', purpose, tone, audience });
}

export function refinePromptStream(chatHistory: ChatMessage[]) {
  return streamApiResponse('/api/generate', { type: 'refine', chatHistory });
}
