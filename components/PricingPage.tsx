import React, { useState } from 'react';

interface PricingPageProps {
  onPurchase: (credits: number) => void;
  onBack: () => void;
}

const pricingTiers = [
  { credits: 1, price: 1, bestValue: false },
  { credits: 5, price: 4.5, bestValue: false, discount: '10%' },
  { credits: 10, price: 8, bestValue: true, discount: '20%' },
  { credits: 25, price: 18, bestValue: false, discount: '28%' },
];

const PricingPage: React.FC<PricingPageProps> = ({ onPurchase, onBack }) => {
  const [processingTier, setProcessingTier] = useState<number | null>(null);

  const handlePurchaseClick = (credits: number) => {
    setProcessingTier(credits);
    onPurchase(credits);
  };
  
  return (
    <div className="min-h-screen bg-brand-dark text-brand-light font-sans p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <button onClick={onBack} className="mb-8 text-brand-secondary hover:text-brand-primary transition-colors">
          &larr; Retour à l'application
        </button>

        <h1 className="text-4xl font-bold text-center mb-2 text-white">Acheter des Crédits</h1>
        <p className="text-center text-gray-400 mb-12">Chaque crédit vous permet de débloquer et télécharger une image en haute qualité.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingTiers.map(tier => (
            <div key={tier.credits} className={`bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col border-2 ${tier.bestValue ? 'border-brand-primary' : 'border-gray-700'} transform hover:-translate-y-2 transition-transform`}>
              {tier.bestValue && (
                  <span className="bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full absolute -top-3 right-3">MEILLEURE OFFRE</span>
              )}
              <h2 className="text-2xl font-bold text-white">{tier.credits} Crédit{tier.credits > 1 ? 's' : ''}</h2>
              <p className="text-gray-400 mb-4 h-6">{tier.discount && `Économisez ${tier.discount} !`}</p>
              
              <div className="my-4">
                <span className="text-5xl font-extrabold text-white">{tier.price}</span>
                <span className="text-xl text-gray-400">€</span>
              </div>
              
              <p className="text-gray-500 text-sm mb-6">
                {(tier.price / tier.credits).toFixed(2)}€ par crédit
              </p>

              <button 
                onClick={() => handlePurchaseClick(tier.credits)}
                disabled={processingTier !== null}
                className={`w-full mt-auto px-4 py-2 font-bold text-white rounded-md transition-colors ${tier.bestValue ? 'bg-brand-primary hover:bg-brand-secondary' : 'bg-gray-600 hover:bg-brand-primary'} disabled:bg-brand-gray disabled:cursor-wait`}
              >
                {processingTier === tier.credits ? 'Traitement...' : 'Acheter maintenant'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;