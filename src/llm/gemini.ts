import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function generateResponse(prompt: string): Promise<{
  generated_text: string;
  answer: string;
}> {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing GEMINI_API_KEY in environment variables.');
  }

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    console.log(
      'Gemini API raw response:',
      JSON.stringify(response.data, null, 2)
    );

    const candidates = response.data.candidates;
    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      throw new Error("Invalid response from Gemini API: no candidates returned");
    }
    const candidate = candidates[0];
    if (
      !candidate.content ||
      !candidate.content.parts ||
      candidate.content.parts.length === 0
    ) {
      throw new Error("Invalid response from Gemini API: missing content parts");
    }
    const generatedText = candidate.content.parts[0].text;
    if (!generatedText) {
      throw new Error("Invalid response from Gemini API: missing generated text");
    }
    return { generated_text: generatedText, answer: generatedText };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}