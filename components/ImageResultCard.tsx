import React from 'react';
import type { ProcessedImage } from '../types';
import Loader from './Loader';

interface ImageResultCardProps {
  image: ProcessedImage;
  onUnlock: (id: string) => void;
  creditBalance: number;
  onRegenerate: (id:string) => void;
}

const ImageResultCard: React.FC<ImageResultCardProps> = ({ image, onUnlock, creditBalance, onRegenerate }) => {
  const handleDownload = () => {
    if (image.retouchedUrl && image.isUnlocked) {
      const link = document.createElement('a');
      link.href = `data:${image.originalFile.type};base64,${image.retouchedUrl}`;
      const fileName = `retouched_${image.originalFile.name}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getButton = () => {
    if (image.isUnlocked) {
      return (
        <button
          onClick={handleDownload}
          className="w-full px-4 py-2 mt-2 font-bold text-white transition-colors rounded-md bg-green-500 hover:bg-green-600"
        >
          Télécharger l'Image
        </button>
      );
    }

    return (
      <button
        onClick={() => onUnlock(image.id)}
        disabled={creditBalance < 1}
        className="w-full px-4 py-2 mt-2 font-bold text-white transition-colors rounded-md bg-brand-primary hover:bg-brand-secondary disabled:bg-brand-gray disabled:cursor-not-allowed"
      >
        {creditBalance < 1 ? "Crédits insuffisants" : "Utiliser 1 Crédit pour Débloquer"}
      </button>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div>
          <h3 className="text-lg font-semibold text-center mb-2">Avant</h3>
          <img src={image.originalUrl} alt="Original" className="object-cover w-full h-auto rounded-md" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-center mb-2">Après (Home Staging IA)</h3>
          <div className="relative w-full h-full min-h-[200px] flex items-center justify-center bg-gray-700 rounded-md">
            {image.status === 'processing' && <Loader />}
            {image.status === 'error' && <p className="text-red-400 p-4 text-center">{image.error}</p>}
            {image.status === 'completed' && image.retouchedUrl && (
              <div className="relative w-full group">
                <img
                  src={`data:${image.originalFile.type};base64,${image.retouchedUrl}`}
                  alt="Retouched"
                  className="object-cover w-full h-auto rounded-md"
                />
                {!image.isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 pointer-events-none">
                    <span className="text-white text-3xl font-bold opacity-70 transform -rotate-12 select-none">FILIGRANE</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {image.status === 'completed' && (
        <div className="p-4 border-t border-gray-700">
          {!image.isUnlocked && (
             <button
              onClick={() => onRegenerate(image.id)}
              className="w-full px-4 py-2 font-semibold text-white transition-colors rounded-md bg-gray-600 hover:bg-gray-500"
            >
              Regénérer cette image
            </button>
          )}
          {getButton()}
        </div>
      )}
    </div>
  );
};

export default ImageResultCard;