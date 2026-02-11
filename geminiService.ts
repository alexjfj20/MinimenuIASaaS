
import { GoogleGenAI, Type } from "@google/genai";

const productSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: 'Nombre corto y atractivo del plato o producto.' },
    description: { type: Type.STRING, description: 'Descripción detallada, ingredientes y por qué es especial.' },
    price: { type: Type.NUMBER, description: 'Precio numérico sugerido.' },
    category: { type: Type.STRING, description: 'Categoría lógica (Entradas, Platos Fuertes, Bebidas, etc.).' }
  },
  required: ['name', 'description', 'price', 'category'],
};

function extractJSON(text: string): string {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
  } catch (e) {
    return text;
  }
}

export async function generateProductImage(productName: string, description: string, businessType: string): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return `https://placehold.co/600x400?text=Error+API+Key`;

  // Always use {apiKey: ...} for initialization
  const ai = new GoogleGenAI({ apiKey });
  try {
    const prompt = `Fotografía publicitaria profesional de "${productName}". Descripción: ${description}. Negocio: ${businessType}. Estilo: Iluminación de estudio, 8k, fondo desenfocado.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: "4:3" }
      }
    });

    // Find the image part as per guidelines
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (part?.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    return `https://placehold.co/600x400?text=${encodeURIComponent(productName)}`;
  } catch (error) {
    console.error("Error generating product image:", error);
    return `https://placehold.co/600x400?text=Error+Imagen`;
  }
}

export async function generateProductFromText(promptText: string) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key no configurada");

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      // Use gemini-3-pro-preview for complex reasoning and structure extraction
      model: 'gemini-3-pro-preview',
      contents: { 
        parts: [{ text: `Genera un producto atractivo basado en: "${promptText}"` }] 
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: productSchema,
        systemInstruction: "Eres un experto en menús para SaaS. Devuelve solo JSON válido."
      },
    });

    // Access .text property directly
    const text = response.text;
    if (!text) throw new Error("Respuesta de IA vacía");
    
    return JSON.parse(extractJSON(text));
  } catch (error) {
    console.error("Error in generateProductFromText:", error);
    throw error;
  }
}

export async function generateProductFromVoice(audioBase64: string, businessType: string) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key no configurada");

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      // Use gemini-3-pro-preview for complex reasoning and structure extraction from audio
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: audioBase64, mimeType: 'audio/webm' } },
          { text: `Analiza el audio para este negocio: ${businessType}. Extrae nombre, descripción, precio y categoría.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: productSchema,
      },
    });

    // Access .text property directly
    const text = response.text;
    if (!text) throw new Error("Respuesta de voz vacía");

    return JSON.parse(extractJSON(text));
  } catch (error) {
    console.error("Error in generateProductFromVoice:", error);
    throw error;
  }
}
