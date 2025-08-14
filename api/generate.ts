import { GoogleGenAI } from "@google/genai";

// --- CONFIGURATION ---
const GEMINI_MODEL = 'gemini-2.5-flash';
// The API key is read from environment variables.
// In local development, this is loaded from the .env file by the Vite server.
// In deployment (e.g., on Vercel), this is set in the environment variables of the platform.
const API_KEY = process.env.API_KEY;

// --- TYPE DEFINITIONS ---
type ChatMessage = {
    role: 'user' | 'model';
    text: string;
};

// Request Body for 'generate' action
interface GenerateRequest {
    type: 'generate';
    userInput: string;
    tone: string;
    targetAudience: string;
}

// Request Body for 'refine' action
interface RefineRequest {
    type: 'refine';
    message: string;
    chatHistory: ChatMessage[];
}

// Union type for the request body
type RequestBody = GenerateRequest | RefineRequest;


// --- SYSTEM INSTRUCTIONS ---
const GENERATE_SYSTEM_INSTRUCTION = `You are a world-class expert in designing AI assistant prompts. Your task is to take a user's brief idea for an AI assistant and expand it into a comprehensive, well-structured, and effective system prompt. The prompt should be ready to be used directly with a large language model.

When generating the prompt, you must follow this structure and include these sections:

**1. Core Identity:**
   - **Persona:** Define the AI's personality and communication style. Be specific (e.g., "A calm, empathetic, and knowledgeable wellness coach," not just "helpful").
   - **Primary Role:** State the AI's main purpose in a single, clear sentence.

**2. Key Responsibilities & Capabilities:**
   - Use a bulleted list to detail the specific tasks the AI can perform.
   - These should be actionable and directly related to the user's original request.
   - For example: "Provide evidence-based information on mindfulness techniques," "Offer guided meditation scripts," "Suggest healthy coping mechanisms for stress."

**3. Rules & Constraints:**
   - This is a critical section for safety and focus.
   - Use a bulleted list to define clear boundaries.
   - **Crucially, you must always include a disclaimer that the AI is not a substitute for a licensed professional (e.g., therapist, doctor, lawyer).**
   - Other rules could include: "Do not create fictional case studies," "Maintain a positive and supportive tone," "Do not diagnose conditions."

**4. Interaction Style:**
   - Describe how the AI should interact with the user.
   - For example: "Always start by acknowledging the user's feelings," "Use open-ended questions to encourage reflection," "Break down complex topics into simple, understandable steps."

**5. Example Opening:**
   - Provide a sample opening message that the AI could use to introduce itself to a user for the first time. This helps set the tone immediately.

Based on this structure, generate a system prompt for the user request.`;

const REFINE_SYSTEM_INSTRUCTION = `You are a prompt editing assistant. Your role is to modify a prompt based on user instructions. When the user provides a command (e.g., "make it more formal" or "add a rule to avoid financial advice"), you must rewrite and output the ENTIRE, new, updated prompt. Do not just describe the changes or provide a snippet. Output the complete, ready-to-use prompt.`;


/**
 * Converts a Gemini stream to a ReadableStream for the browser.
 * @param stream The stream to convert.
 * @returns A ReadableStream.
 */
function toReadableStream(stream: AsyncGenerator<any>): ReadableStream {
    const encoder = new TextEncoder();
    return new ReadableStream({
        async start(controller) {
            for await (const chunk of stream) {
                const text = chunk.text;
                if (text) {
                  controller.enqueue(encoder.encode(text));
                }
            }
            controller.close();
        },
    });
}


export default async (req: Request) => {
    if (!API_KEY) {
        return new Response(JSON.stringify({ error: "API key not configured." }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    try {
        const body = await req.json() as RequestBody;
        const ai = new GoogleGenAI({ apiKey: API_KEY });

        if (body.type === 'generate') {
            const { userInput, tone, targetAudience } = body;
            let fullUserInput = `User Request: "${userInput}"`;
            if (tone) fullUserInput += `\n- Desired Tone: ${tone}`;
            if (targetAudience) fullUserInput += `\n- Target Audience: ${targetAudience}`;
            
            const stream = await ai.models.generateContentStream({
                model: GEMINI_MODEL,
                contents: fullUserInput,
                config: { systemInstruction: GENERATE_SYSTEM_INSTRUCTION },
            });

            return new Response(toReadableStream(stream), {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });

        } else if (body.type === 'refine') {
            const { chatHistory, message } = body;
            if (!Array.isArray(chatHistory) || chatHistory.length === 0) {
                return new Response(JSON.stringify({ error: "Invalid chat history for refine request." }), { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const originalPrompt = chatHistory[0].text;
            const conversationHistory = chatHistory.slice(1).map((msg) => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }));

            const systemInstruction = `${REFINE_SYSTEM_INSTRUCTION}\n\nThe user wants you to edit the following prompt:\n\n---\n${originalPrompt}\n---`;

            const chat = ai.chats.create({ 
                model: GEMINI_MODEL,
                history: conversationHistory,
                config: { systemInstruction }
            });

            const stream = await chat.sendMessageStream({ message });
            
            return new Response(toReadableStream(stream), {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });
        }

        return new Response(JSON.stringify({ error: "Invalid request type specified." }), { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown internal error occurred.";
        return new Response(JSON.stringify({ error: errorMessage }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};