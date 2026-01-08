
import { GoogleGenAI } from "@google/genai";
import { PROPERTIES } from "../constants";

// Fix: Correct initialization using named parameter and direct process.env.API_KEY access
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTravelRecommendation = async (userPrompt: string) => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    Você é a 'EVA', uma Concierge de luxo e assistente pessoal da plataforma EVA RESERVA. 
    Sua plataforma agora é especializada em 'Day Use' (reservas para um único dia).
    
    Catálogo: ${JSON.stringify(PROPERTIES.map(p => ({ id: p.id, name: p.name, location: p.location, price: p.pricePerNight, features: p.amenities })))}
    
    Regras:
    1. Seja extremamente profissional, calorosa e eficiente.
    2. Sempre que sugerir algo, mencione os benefícios exclusivos de um Day Use com a EVA.
    3. Informe que o usuário deve selecionar exatamente um dia no calendário da tela inicial para prosseguir.
    4. Não trabalhamos com pernoite no momento, apenas experiências de dia inteiro.
    5. Responda no idioma do usuário.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Desculpe, tive um contratempo. Como a EVA pode te ajudar de outra forma?";
  }
};
