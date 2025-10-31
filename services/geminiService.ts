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
  const prompt = `Retouche cette photo pour un 'home staging' virtuel hyper-réaliste. L'objectif est de moderniser et de désencombrer l'espace pour le rendre plus attractif pour la vente, tout en conservant impérativement la structure, les dimensions, et l'agencement d'origine de la pièce (murs, fenêtres, portes, sols). Le résultat doit être photoréaliste, lumineux, et donner l'impression que c'est la même pièce, mais redécorée professionnellement. La sortie doit être uniquement l'image, sans aucun texte.`;

  try {
    const response = await ai.models.generateContent({
        // MODIFICATION: Changement du modèle pour un autre potentiellement moins restreint.
        model: 'gemini-2.5-flash',
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
        // IMPORTANT: Le modèle `gemini-2.5-flash` ne supporte pas `responseModalities`.
        // Cette configuration est spécifique à `gemini-2.5-flash-image`.
        // Nous la retirons pour assurer la compatibilité.
        // config: {
        //     responseModalities: [Modality.IMAGE],
        // },
    });

    if (response.promptFeedback?.blockReason) {
      const reason = response.promptFeedback.blockReason;
      let frenchReason = "Raison inconnue";
      if (reason === 'SAFETY') frenchReason = "contenu non sûr";
      if (reason === 'OTHER') frenchReason = "autre raison";
      throw new Error(`Retouche bloquée par la sécurité (Raison: ${frenchReason}). Essayez une autre image.`);
    }

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("L'IA n'a pas pu générer d'image. Essayez une photo différente ou de meilleure qualité.");
    }

    // Avec gemini-2.5-flash, la réponse peut être dans un format légèrement différent.
    // Il faut s'assurer de bien extraire la partie image.
    const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      return imagePart.inlineData.data;
    }
    
    throw new Error("Aucune donnée d'image trouvée dans la réponse de l'IA. Le modèle a peut-être répondu avec du texte.");
  } catch (error) {
    console.error("Erreur détaillée de l'API Gemini:", error);
    
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error('Clé API invalide. Vérifiez la configuration de votre projet.');
        }
        if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
            throw new Error("Votre quota gratuit est épuisé ou le modèle est surchargé. Pour continuer à utiliser le service, assurez-vous que la facturation est bien activée ET liée à ce projet sur la console Google Cloud. C'est le fonctionnement normal de l'API une fois les crédits gratuits utilisés.");
        }
        if (error.message.includes('Deadline Exceeded') || error.message.includes('503')) {
            throw new Error("Le service est temporairement surchargé. Veuillez réessayer dans quelques instants.");
        }
        if (error.message.includes('Retouche bloquée')) {
          throw error;
        }
        // Pour toute autre erreur, affichez le message réel de l'API pour un meilleur débogage.
        throw new Error(`Échec de la retouche: ${error.message}`);
    }
    
    // Fallback générique
    throw new Error("Échec de la retouche de l'image. Une erreur inconnue est survenue.");
  }
};