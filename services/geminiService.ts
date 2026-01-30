import { GoogleGenAI, Chat } from "@google/genai";
import { Product } from "../types";

let chatSession: Chat | null = null;

export const initializeChat = (products: Product[]) => {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.VITE_API_KEY || '';
  if (!apiKey) {
    console.warn('Gemini API key is missing. Set VITE_GEMINI_API_KEY in .env');
    chatSession = null;
    return;
  }
  const ai = new GoogleGenAI({ apiKey });
  
  const productContext = products.map(p => {
    const specs = [
      p.sizes?.length ? `Sizes: ${p.sizes.join(', ')}` : '',
      p.colors?.length ? `Colors: ${p.colors.join(', ')}` : '',
      p.material ? `Material: ${p.material}` : '',
      p.stock !== undefined ? `Stock: ${p.stock}` : ''
    ].filter(Boolean).join(' | ');

    return `- ${p.name} ($${p.price}): ${p.description} (Category: ${p.category}) [${specs}]`;
  }).join('\n');

  const systemInstruction = `You are "Eva", the AI Personal Stylist for Stylero.online.
  
  Tone: Chic, professional, helpful, and concise.
  Goal: Help customers find products, match outfits, and answer fashion questions.
  
  Here is our current inventory catalogue:
  ${productContext}
  
  Rules:
  1. Language: ALWAYS reply in the same language the user speaks to you (Arabic or English).
  2. Only recommend products from our catalogue.
  3. If a user asks for something we don't have, politely suggest a similar item from the catalogue or say we don't have it.
  4. Keep responses short (under 50 words) unless giving detailed styling advice.
  5. Use emojis sparingly but effectively 👗.
  6. If asked about materials, sizes, or stock, use the provided specs in brackets.
  `;

  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction,
    },
  });
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    return "المساعد غير مفعّل حالياً. يرجى التحقق من إعدادات الاتصال.";
  }

  try {
    const response = await chatSession.sendMessage({ message });
    return response.text || "I'm having a fashion emergency! Let me think for a moment...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the fashion server right now. Please try again.";
  }
};