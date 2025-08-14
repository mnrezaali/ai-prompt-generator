
export const ADMIN_MASTER_KEY = 'ADMIN_MASTER_KEY';

export const TONE_OPTIONS = ['Professional', 'Friendly', 'Witty', 'Empathetic', 'Formal', 'Casual'];

export const RECOMMENDED_PROMPTS = [
  {
    title: "Productivity Assistant",
    description: "Helps users manage tasks, schedule, and stay organized.",
    purpose: "An expert productivity assistant to help users manage tasks, set reminders, and organize their daily schedule.",
    tone: "Professional",
    audience: "Busy professionals"
  },
  {
    title: "Marketing Copywriter",
    description: "Generates compelling copy for emails, ads, and social media.",
    purpose: "An expert copywriter for marketing emails, social media posts, and ad campaigns.",
    tone: "Witty",
    audience: "Small business owners"
  },
  {
    title: "Creative Storyteller",
    description: "A creative partner for brainstorming and writing stories.",
    purpose: "A creative partner to help authors brainstorm ideas, develop characters, and write engaging story plots.",
    tone: "Friendly",
    audience: "Fiction writers"
  },
  {
    title: "Technical Explainer",
    description: "Breaks down complex technical topics into simple terms.",
    purpose: "An AI that can explain complex technical concepts like blockchain or APIs in simple, easy-to-understand terms.",
    tone: "Formal",
    audience: "Students and beginners"
  }
];

export const INITIAL_PROMPT_SYSTEM_INSTRUCTION = `You are a world-class expert in designing AI assistant prompts. Your task is to take a user's brief idea for an AI assistant and expand it into a comprehensive, well-structured, and effective system prompt. The prompt should be ready to be used directly with a large language model.

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

export const REFINE_PROMPT_SYSTEM_INSTRUCTION = `You are a prompt editing assistant. Your role is to modify a prompt based on user instructions. When the user provides a command, you must rewrite and output the ENTIRE, new, updated prompt. Do not just describe the changes or provide a snippet. Output the complete, ready-to-use prompt.`;
