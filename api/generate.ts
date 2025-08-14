import { GoogleGenAI, Chat } from '@google/genai';
import type { Context } from '@netlify/functions';

// IMPORTANT: Set the API_KEY in your Netlify project's environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const GENERATE_SYSTEM_INSTRUCTION = `You are an expert in designing AI assistant system prompts. A user will provide a high-level description of an assistant they want to build. Your task is to generate a comprehensive, well-structured system prompt based on their input.

The output MUST be a single block of text.

The prompt must include the following sections, clearly marked with headings:

1.  **Core Identity:** Define who the AI is.
2.  **Key Responsibilities:** List the primary tasks and functions of the AI.
3.  **Rules & Constraints:** Specify limitations, boundaries, and critical rules the AI must follow.
4.  **Interaction Style:** Describe the AI's tone, personality, and how it should communicate.
5.  **Example Opening:** Provide a sample first response to a user interaction.

**CRITICAL RULE:** Under "Rules & Constraints," you MUST ALWAYS include a disclaimer stating that the AI is not a licensed professional (e.g., financial advisor, doctor, lawyer) and its advice should not be taken as professional guidance.

Analyze the user's request for purpose, tone, and audience to tailor each section effectively. Output only the complete, final prompt.`;

const REFINE_SYSTEM_INSTRUCTION = `You are a prompt editing assistant. The user will provide a complete system prompt and a command to refine it. Your task is to rewrite the ENTIRE prompt based on the user's command, incorporating their changes seamlessly. You MUST output the complete, new version of the prompt. Do not just output the changes or a confirmation message. Output ONLY the full, updated prompt text.`;

// Helper to convert the SDK's async generator to a browser-compatible ReadableStream
function toReadableStream(
  iterator: AsyncGenerator<any>,
  encoder: TextEncoder,
  parser: (chunk: any) => string
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async pull(controller) {
      try {
        const { value, done } = await iterator.next();
        if (done) {
          controller.close();
        } else {
          const text = parser(value);
          controller.enqueue(encoder.encode(text));
        }
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

export default async (req: Request, context: Context): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { type, ...payload } = await req.json();
    const encoder = new TextEncoder();
    let iterator;

    if (type === 'generate') {
      const { userInput, tone, targetAudience } = payload;
      const fullPrompt = `Generate a system prompt for an AI assistant.
      
      **Assistant's Purpose:** ${userInput}
      **Desired Tone:** ${tone}
      **Target Audience:** ${targetAudience}`;
      
      iterator = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        config: {
          systemInstruction: GENERATE_SYSTEM_INSTRUCTION,
        },
      });

    } else if (type === 'refine') {
      const { message, originalPrompt } = payload;

      const chat: Chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: REFINE_SYSTEM_INSTRUCTION,
        },
        history: [{ role: 'model', parts: [{ text: originalPrompt }] }]
      });
      
      iterator = await chat.sendMessageStream({ message });
      
    } else {
      return new Response(JSON.stringify({ error: 'Invalid request type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const readableStream = toReadableStream(iterator, encoder, (chunk) => chunk.text);
    
    return new Response(readableStream, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: 'Failed to generate content', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
