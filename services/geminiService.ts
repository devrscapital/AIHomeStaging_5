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
        // Retour au modèle spécialisé 'gemini-2.5-flash-image' pour de meilleurs résultats.
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
            // Configuration requise pour forcer le modèle à retourner une image.
            responseModalities: [Modality.IMAGE],
        },
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

    // CORRECTIF: Ajout de vérifications robustes pour éviter le crash "Cannot read properties of undefined".
    // La structure de la réponse peut être vide si le modèle ne peut pas traiter la demande.
    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        const finishReason = candidate.finishReason || 'INCONNUE';
        console.error("Réponse de l'IA invalide ou vide. Finish reason:", finishReason, "Candidate:", candidate);
        throw new Error(`La réponse de l'IA est vide (Raison: ${finishReason}). Le modèle n'a peut-être pas pu traiter l'image.`);
    }

    const imagePart = candidate.content.parts.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      return imagePart.inlineData.data;
    }
    
    // Si aucune image n'est trouvée, on vérifie si du texte a été retourné pour donner une erreur plus claire.
    const textPart = candidate.content.parts.find(part => part.text);
    if (textPart && textPart.text) {
        console.warn("L'IA a répondu avec du texte au lieu d'une image:", textPart.text);
        throw new Error(`L'IA a répondu avec du texte au lieu d'une image. Cela peut arriver si le modèle utilisé n'est pas adapté à l'édition d'images.`);
    }
    
    throw new Error("Aucune donnée d'image trouvée dans la réponse de l'IA. Le format de la réponse est inattendu.");

  } catch (error) {
    console.error("Erreur détaillée de l'API Gemini:", error);
    
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error('Clé API invalide. Vérifiez la configuration de votre projet.');
        }
        if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
            throw new Error("Votre quota pour le modèle 'gemini-2.5-flash-image' est épuisé ou le modèle est surchargé. Pour continuer, assurez-vous que la facturation est activée ET liée à ce projet sur la console Google Cloud.");
        }
        if (error.message.includes('Deadline Exceeded') || error.message.includes('503')) {
            throw new Error("Le service est temporairement surchargé. Veuillez réessayer dans quelques instants.");
        }
        // Pas besoin de re-throw les erreurs déjà formatées
        if (error.message.startsWith("Retouche bloquée") || error.message.startsWith("La réponse de l'IA est vide") || error.message.startsWith("L'IA a répondu avec du texte") || error.message.startsWith("Aucune donnée d'image trouvée")) {
          throw error;
        }
        // Pour toute autre erreur, affichez le message réel de l'API pour un meilleur débogage.
        throw new Error(`Échec de la retouche: ${error.message}`);
    }
    
    // Fallback générique
    throw new Error("Échec de la retouche de l'image. Une erreur inconnue est survenue.");
  }
};