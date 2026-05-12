import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY not set. AI generation will fail.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

interface GeminiCall<T> {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodSchema<T>;
  temperature?: number;
  maxRetries?: number;
}

export async function callGemini<T>({
  systemPrompt,
  userPrompt,
  schema,
  temperature = 0.7,
  maxRetries = 2,
}: GeminiCall<T>): Promise<T> {
  if (!genAI) {
    throw new Error('Gemini client not initialized');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature,
      responseMimeType: 'application/json',
    },
  });

  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(
        `${systemPrompt}\n\n${userPrompt}`
      );
      const text = result.response.text();
      const parsed = JSON.parse(text);
      const validated = schema.parse(parsed);
      return validated;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}
