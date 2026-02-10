
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

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

/**
 * Limpia profundamente la respuesta de la IA para obtener solo el objeto JSON.
 */
function extractJSON(text: string): string {
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      return text.substring(start, end + 1);
    }
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
  } catch (e) {
    return text;
  }
}

/**
 * Genera una imagen realista basada en el nombre y descripción del producto.
 */
export async function generateProductImage(productName: string, description: string, businessType: string): Promise<string> {
  try {
    const prompt = `Fotografía publicitaria de alta resolución (8k, comida real) de "${productName}". 
    Descripción: ${description}. 
    Estilo: Fotografía de catálogo para un ${businessType}. 
    La imagen debe ser ultra realista, iluminación profesional de estudio, fondo desenfocado, colores vibrantes y apetitosos.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        imageConfig: {
          aspectRatio: "4:3"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return `https://placehold.co/600x400?text=${encodeURIComponent(productName)}`;
  } catch (error) {
    console.error("Error generating product image:", error);
    return `https://placehold.co/600x400?text=Imagen+No+Disponible`;
  }
}

export async function generateProductFromText(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: `Crea un producto para el menú basado en esto: "${prompt}"` }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: productSchema,
        systemInstruction: "Eres un experto en marketing gastronómico. Genera productos que vendan. Devuelve solo JSON."
      },
    });

    return JSON.parse(extractJSON(response.text || '{}'));
  } catch (error) {
    console.error("Error generating product from text:", error);
    throw error;
  }
}

export async function generateProductFromVoice(audioBase64: string, businessType: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: audioBase64, mimeType: 'audio/webm' } },
          { text: `Analiza el audio y crea un producto detallado para un negocio de tipo: ${businessType}. Extrae nombre, descripción apetitosa, precio y categoría. Responde estrictamente en formato JSON.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: productSchema,
      },
    });

    const cleanJson = extractJSON(response.text || '{}');
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Error generating product from voice:", error);
    throw error;
  }
}
