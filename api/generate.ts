import { GoogleGenAI, Content, Part } from "@google/genai";
import { ChatMessage } from '../types';

// These constants are duplicated here to be self-contained within the serverless function.
const INITIAL_PROMPT_SYSTEM_INSTRUCTION = `You are a world-class expert in designing AI assistant prompts. Your task is to take a user's brief idea for an AI assistant and expand it into a comprehensive, well-structured, and effective system prompt. The prompt should be ready to be used directly with a large language model.

When generating the prompt, you must follow this structure and include these sections:

1. **Core Identity**:
   - **Persona**: Define the AI's personality and communication style. Be specific.
   - **Primary Role**: State the AI's main purpose in a single, clear sentence.

2. **Key Responsibilities & Capabilities**:
   - Use a bulleted list to detail the specific tasks the AI can perform.

3. **Rules & Constraints**:
   - Use a bulleted list to define clear boundaries.
   - **Crucially, you must always include a disclaimer that the AI is not a substitute for a licensed professional (e.g., therapist, doctor, lawyer).**

4. **Interaction Style**:
   - Describe how the AI should interact with the user.

5. **Example Opening**:
   - Provide a sample opening message that the AI could use to introduce itself.`;

const REFINE_PROMPT_SYSTEM_INSTRUCTION = `You are a prompt editing assistant. Your role is to modify a prompt based on user instructions. When the user provides a command, you must rewrite and output the ENTIRE, new, updated prompt. Do not just describe the changes or provide a snippet. Output the complete, ready-to-use prompt.`;


export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  if (!process.env.API_KEY) {
    return new Response('API_KEY environment variable not set', { status: 500 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const body = await req.json();
    const { type } = body;

    let systemInstruction: string;
    let contents: Content[] | string;

    if (type === 'initial') {
      const { purpose, tone, audience } = body;
      systemInstruction = INITIAL_PROMPT_SYSTEM_INSTRUCTION;
      contents = `- **Purpose**: ${purpose}\n- **Tone**: ${tone}\n- **Target Audience**: ${audience || 'General audience'}`;
    } else if (type === 'refine') {
      const chatHistory: ChatMessage[] = body.chatHistory;
      systemInstruction = REFINE_PROMPT_SYSTEM_INSTRUCTION;
      contents = chatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }] as Part[],
      }));
    } else {
      return new Response('Invalid request type', { status: 400 });
    }
    
    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction,
        },
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
                controller.enqueue(new TextEncoder().encode(text));
            }
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return new Response('Error processing your request.', { status: 500 });
  }
}
