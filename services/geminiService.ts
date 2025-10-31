import { GoogleGenAI, Modality } from "@google/genai";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove `data:${file.type};base64,` prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const retouchImage = async (file: File): Promise<string> => {
  // CORRECTIF DÉFINITIF: Utilisation de `import.meta.env.VITE_API_KEY` qui est la seule méthode correcte pour Vite.
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

  const base64Data = await fileToBase64(file);
  const prompt = `Retouche cette photo pour un 'home staging' virtuel hyper-réaliste. L'objectif est de moderniser et de désencombrer l'espace pour le rendre plus attractif pour la vente, tout en conservant impérativement la structure, les dimensions, et l'agencement d'origine de la pièce (murs, fenêtres, portes, sols). Le résultat doit être photoréaliste, lumineux, et donner l'impression que c'est la même pièce, mais redécorée professionnellement.`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
            {
                inlineData: {
                data: base64Data,
                mimeType: file.type,
                },
            },
            {
                text: prompt,
            },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    if (!response.candidates || response.candidates.length === 0) {
      if (response.promptFeedback?.blockReason) {
        throw new Error(`Retouche bloquée par la sécurité (Raison: ${response.promptFeedback.blockReason}). Essayez une autre image.`);
      }
      throw new Error("L'IA n'a pas pu générer d'image. Essayez une photo différente ou de meilleure qualité.");
    }


    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
    }
    
    throw new Error("Aucune donnée d'image trouvée dans la réponse de l'IA.");
  } catch (error) {
    console.error("Erreur lors de la retouche de l'image avec l'API Gemini:", error);
    
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error('Clé API invalide. Vérifiez la configuration de votre projet.');
        }
        if (error.message.includes('-image` is not accessible')) {
            throw new Error("Le modèle d'IA d'image n'est pas accessible. Votre clé n'a peut-être pas les permissions.");
        }
        if (error.message.includes('Deadline Exceeded')) {
            throw new Error("La requête a expiré. Le service est peut-être surchargé, veuillez réessayer.");
        }
        // Re-throw the specific messages from the try block or other unhandled errors
        throw error; 
    }
    
    // Generic fallback
    throw new Error("Échec de la retouche de l'image. Une erreur inconnue est survenue.");
  }
};