import React, { useState, useCallback, useEffect } from 'react';
// CORRECTIF DÉFINITIF: Utiliser les imports de compatibilité Firebase v8.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { auth } from './firebase';
import type { ProcessedImage, User } from './types';
import { retouchImage } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import ImageResultCard from './components/ImageResultCard';
import PricingPage from './components/PricingPage';
import AuthPage from './components/AuthPage';
import Modal from './components/Modal';
import AccountModal from './components/AccountModal';
import FAQ from './components/FAQ';
import Carousel from './components/Carousel';

const faqData = [
  {
    question: "Qu'est-ce que l'AI Home Staging ?",
    answer:
      "L’AI Home Staging est une technologie innovante qui utilise l’intelligence artificielle pour redécorer virtuellement vos photos immobilières. Elle vide l’espace existant, supprime les éléments encombrants et le remeuble dans un style moderne et attractif. Le résultat : une mise en valeur instantanée qui aide les acheteurs ou locataires potentiels à se projeter facilement dans leur futur espace."
  },
  {
    question: "Quels sont les avantages d'utiliser l'AI Home Staging ?",
    answer:
      "L’AI Home Staging révèle tout le potentiel d’un bien immobilier en quelques secondes. Grâce à l’intelligence artificielle, vos photos sont sublimées : les objets indésirables disparaissent, les imperfections visuelles sont corrigées et la pièce profite d’un cadrage, d’une luminosité et d’une décoration optimisés. Résultat : des images percutantes qui suscitent le coup de cœur, attirent plus de visiteurs et permettent de vendre ou louer plus vite, et au meilleur prix. Une solution rapide, économique et professionnelle adaptée aussi bien aux agences, artisans qu’aux particuliers."
  },
  {
    question: "Comment utiliser l'application ?",
    answer:
      "C’est très simple ! 1️⃣ Téléversez une ou plusieurs photos de vos pièces. 2️⃣ L’intelligence artificielle génère automatiquement une version redécorée en quelques secondes. 3️⃣ Si le résultat vous plaît, utilisez un Token pour débloquer l’image, retirer le filigrane et la télécharger en haute qualité. Facile, rapide et 100 % digital !"
  },
  {
    question: "Que sont les Tokens ?",
    answer:
      "Les Tokens sont la monnaie virtuelle de l’application. Chaque Token vous permet de débloquer et télécharger une image retouchée sans filigrane. Vous recevez un Token gratuit à l’inscription pour tester le service complet et découvrir la puissance du Home Staging virtuel."
  },
  {
    question: "Mes photos sont-elles confidentielles ?",
    answer:
      "Absolument. La confidentialité de vos images est notre priorité. Vos photos sont transférées de manière sécurisée via l’API de Google et ne sont ni conservées sur nos serveurs, ni utilisées à d’autres fins. Vous gardez le contrôle total sur vos contenus."
  },
  {
    question: "Quels types de photos offrent les meilleurs résultats ?",
    answer:
      "Pour un rendu optimal, privilégiez des photos bien éclairées, prises à hauteur d’œil, avec un angle large permettant de bien voir la pièce. Les espaces vides ou légèrement meublés offrent les transformations les plus spectaculaires."
  },
  {
    question: "Et si je n’aime pas le résultat ?",
    answer:
      "Pas de souci ! L’IA peut proposer différents styles selon la photo. Si le premier rendu ne vous convient pas, vous pouvez simplement cliquer sur “Régénérer cette image” pour obtenir une nouvelle version — sans coût supplémentaire."
  },
  {
    question: "À qui s’adresse l’AI Home Staging ?",
    answer:
      "Notre service s’adresse aussi bien aux agences immobilières souhaitant valoriser leurs annonces, qu’aux artisans ou décorateurs désirant présenter leurs réalisations sous leur meilleur jour. Les particuliers peuvent également l’utiliser pour moderniser leurs photos avant une vente ou une location. En bref, l’AI Home Staging s’adapte à tous ceux qui veulent créer un effet “waouh” dès le premier regard."
  },
  {
    question: "En combien de temps puis-je obtenir mes images ?",
    answer:
      "En seulement quelques secondes ! Une fois vos photos téléchargées, notre intelligence artificielle les transforme instantanément. Vous obtenez des visuels professionnels prêts à être partagés ou publiés sur vos annonces sans attendre. Plus besoin de passer par un photographe ou un décorateur : tout se fait en ligne, rapidement et avec un rendu spectaculaire."
  },
  {
    question: "Faut-il des compétences techniques pour utiliser l’AI Home Staging ?",
    answer:
      "Pas du tout ! L’interface est intuitive et pensée pour tous. Il suffit de quelques clics pour télécharger vos photos et obtenir vos rendus. Aucun logiciel à installer, aucune compétence technique requise."
  },
  {
    question: "Puis-je utiliser ces images dans mes annonces ou sur mes réseaux sociaux ?",
    answer:
      "Oui, bien sûr ! Une fois votre image débloquée, vous pouvez l’utiliser librement sur vos annonces immobilières, vos brochures, vos réseaux sociaux ou votre site web. Les visuels sont utilisables à des fins commerciales."
  },
  {
    question: "Quelle est la différence entre l’AI Home Staging et le home staging traditionnel ?",
    answer:
      "Le home staging traditionnel nécessite du temps, du mobilier et un budget conséquent. L’AI Home Staging, lui, offre un impact visuel comparable à une fraction du coût et en quelques secondes. C’est idéal pour tester plusieurs ambiances, accélérer la mise sur le marché et réduire la logistique."
  }
];


const carouselData = [
    {
        before: 'https://i.postimg.cc/HsxCZsZ9/cuisine-without-home-staging.png',
        after: 'https://i.postimg.cc/zB0cKTr8/cuisine-with-home-staging.jpg',
        description: 'Une cuisine vieillotte devient le cœur lumineux et fonctionnel de la maison.'
    },
    {
        before: 'https://i.postimg.cc/8k3jm3wy/salledebain-without-home-staging.png',
        after: 'https://i.postimg.cc/y8hxBNK2/salledebain-with-home-staging.png',
        description: 'D’une salle de bain dépassée à un espace raffiné où chaque détail invite à la détente.'
    },
    {
        before: 'https://i.postimg.cc/VsHYcCCw/salon-without-home-staging.png',
        after: 'https://i.postimg.cc/g0qchc2k/Salon-with-home-staging2.png',
        description: 'Le salon terne se transforme en un espace chaleureux et accueillant, parfait pour recevoir et se détendre.'
    },

    {
        before: 'https://i.postimg.cc/pV8t36Rs/chambre-without-home-staging.png',
        after: 'https://i.postimg.cc/2yNgzCrZ/chambre-with-home-staging.png',
        description: 'D’une chambre banale à une suite parentale raffinée et apaisante, un véritable havre de paix.'
    },

    
];


const App: React.FC = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [view, setView] = useState<'main' | 'pricing' | 'auth'>('main');
  const [user, setUser] = useState<User | null>(null);
  const [authRedirect, setAuthRedirect] = useState<'pricing' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeModal, setActiveModal] = useState<'legal' | 'info' | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser: firebase.User | null) => {
      if (currentUser) {
        const appUser: User = { uid: currentUser.uid, email: currentUser.email };
        setUser(appUser);
        const storedTokens = localStorage.getItem(`tokens_${appUser.uid}`);
        setTokenBalance(storedTokens ? parseInt(storedTokens, 10) : 0);
      } else {
        setUser(null);
        setTokenBalance(0);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const processFile = useCallback(async (imageToProcess: ProcessedImage) => {
    try {
      const retouchedData = await retouchImage(imageToProcess.originalFile);
      setImages(prev =>
        prev.map(img =>
          img.id === imageToProcess.id
            ? { ...img, status: 'completed', retouchedUrl: retouchedData }
            : img
        )
      );
    } catch (error) {
      console.error("Error processing file:", error instanceof Error ? error.message : String(error));
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setImages(prev =>
        prev.map(img =>
          img.id === imageToProcess.id
            ? { ...img, status: 'error', error: errorMessage }
            : img
        )
      );
    }
  }, []);

  const handleUpload = useCallback((files: File[]) => {
    setIsProcessing(true);
    const newImages: ProcessedImage[] = files.map(file => ({
      id: `${file.name}-${Date.now()}`,
      originalFile: file,
      originalUrl: URL.createObjectURL(file),
      retouchedUrl: null,
      status: 'processing',
      isUnlocked: false,
      error: null,
    }));

    setImages(prev => [...prev, ...newImages]);

    Promise.all(newImages.map(img => processFile(img))).finally(() => {
      setIsProcessing(false);
    });
  }, [processFile]);
  
  const handleRegenerate = useCallback(async (id: string) => {
    const imageToRegenerate = images.find(img => img.id === id);
    if (!imageToRegenerate) return;

    setImages(prev =>
      prev.map(img =>
        img.id === id
          ? { ...img, status: 'processing', retouchedUrl: null, error: null }
          : img
      )
    );
    
    await processFile(imageToRegenerate);
  }, [images, processFile]);


  const handleUnlockImage = async (id: string) => {
    if (!user) {
      setAuthRedirect('pricing');
      setView('auth');
      return;
    }
    if (tokenBalance < 1) {
      alert("Vous n'avez pas assez de tokens. Veuillez en acheter.");
      setView('pricing');
      return;
    }
    
    const newBalance = tokenBalance - 1;
    localStorage.setItem(`tokens_${user.uid}`, String(newBalance));
    setTokenBalance(newBalance);
    setImages(prev =>
      prev.map(img => (img.id === id ? { ...img, isUnlocked: true } : img))
    );
  };

  const handlePurchase = async (tokens: number) => {
    if (!user) {
        console.error("User not logged in, cannot process purchase.");
        setView('auth');
        return;
    }
    
    const newBalance = tokenBalance + tokens;
    localStorage.setItem(`tokens_${user.uid}`, String(newBalance));
    setTokenBalance(newBalance);
    setView('main');
  };
  
  const handleLoginSuccess = (loggedInUser: User, isNewUser: boolean) => {
    if (isNewUser) {
      localStorage.setItem(`tokens_${loggedInUser.uid}`, '1'); // Welcome token
      setTokenBalance(1);
    }
    
    if (authRedirect === 'pricing') {
      setView('pricing');
      setAuthRedirect(null);
    } else {
      setView('main');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setImages([]); 
      setView('main');
    } catch (error) {
      console.error("Error signing out: ", error);
      alert("Une erreur est survenue lors de la déconnexion.");
    }
  };

  const handleDeleteAccount = async () => {
    if (user) {
      localStorage.removeItem(`tokens_${user.uid}`);
      setIsAccountModalOpen(false);
    }
  };

  const handleBuyTokensClick = () => {
    if (user) {
      setView('pricing');
    } else {
      setAuthRedirect('pricing');
      setView('auth');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (view === 'auth') {
    return <AuthPage onLoginSuccess={handleLoginSuccess} onBack={() => setView('main')} />;
  }

  if (view === 'pricing') {
    return <PricingPage onPurchase={handlePurchase} onBack={() => setView('main')} />;
  }

  return (
    <div className="min-h-screen bg-brand-dark text-brand-light font-sans flex flex-col">
      <header className="py-4 bg-gray-900 shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <button onClick={() => setView('main')} className="focus:outline-none focus:ring-2 focus:ring-brand-primary rounded-lg transition-opacity hover:opacity-90">
            <svg className="h-10 w-auto text-brand-light" viewBox="0 0 250 50" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M25.5 26H4.5C4.22386 26 4 25.7761 4 25.5V11.8858C4 11.6097 4.22386 11.3858 4.5 11.3858H14.809C15.0851 11.3858 15.309 11.6097 15.309 11.8858V14.5C15.309 14.7761 15.5329 15 15.809 15H24.191C24.4671 15 24.691 14.7761 24.691 14.5V11.8858C24.691 11.6097 24.915 11.3858 25.191 11.3858H35.5C35.7761 11.3858 36 11.6097 36 11.8858V25.5C36 25.7761 35.7761 26 35.5 26H31.5C31.2239 26 31 25.7761 31 25.5V19.5C31 19.2239 30.7761 19 30.5 19H9.5C9.22386 19 9 19.2239 9 19.5V25.5C9 25.7761 8.77614 26 8.5 26H4.5L25.5 26Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M20 2L2 14.2857V38H38V14.2857L20 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M38 12.5L43.5 10L46 4.5L48.5 10L54 12.5L48.5 15L46 20.5L43.5 15L38 12.5Z" className="fill-current text-brand-gold"/>
              <text x="65" y="33" fontFamily="sans-serif" fontSize="24" fontWeight="normal">
                <tspan className="font-bold fill-current text-brand-gold">AI</tspan>
                <tspan> Home Staging</tspan>
              </text>
            </svg>
          </button>
          {user ? (
            <div className="flex items-center space-x-2 md:space-x-4">
               <div className="hidden sm:flex items-center space-x-2">
                 <span className="text-sm text-gray-400">{user.email}</span>
                 <span className="text-gray-600">|</span>
               </div>
              <div className="text-center">
                <span className="font-bold text-lg text-brand-secondary">{tokenBalance}</span>
                <span className="text-sm text-gray-400"> Token(s)</span>
              </div>
              <button 
                onClick={() => setIsAccountModalOpen(true)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md transition-colors text-sm"
              >
                Mon Compte
              </button>
              <button 
                onClick={handleBuyTokensClick}
                className="px-3 py-2 bg-brand-primary hover:bg-brand-secondary text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 text-sm"
              >
                Acheter
              </button>
              <button 
                onClick={handleLogout}
                className="px-3 py-2 bg-brand-gray hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md transition-colors text-sm"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setView('auth')}
              className="px-3 py-2 text-sm bg-brand-primary hover:bg-brand-secondary text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
              Connexion / Inscription
            </button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow">
        {!user && (
          <div className="text-center bg-gray-800 p-8 rounded-lg shadow-lg my-8">
            <h2 className="text-2xl font-bold mb-4">Bienvenue sur AI Home Staging !</h2>
            <p className="text-gray-400 mb-6">Connectez-vous pour commencer à transformer vos photos immobilières et sauvegarder vos crédits.</p>
            <button 
              onClick={() => setView('auth')}
              className="px-6 py-3 bg-brand-primary hover:bg-brand-secondary text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
              Commencer
            </button>
          </div>
        )}

        {user && !images.length && <ImageUploader onUpload={handleUpload} isProcessing={isProcessing} />}
        
        {user && images.length > 0 && (
          <div className="text-center mb-8">
            <button
              onClick={() => setImages([])}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
              Nouveau
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {images.map(image => (
            <ImageResultCard key={image.id} image={image} onUnlock={handleUnlockImage} tokenBalance={tokenBalance} onRegenerate={handleRegenerate} />
          ))}
        </div>
        
        <section className="mt-16 mb-12">
            <h2 className="text-3xl font-bold text-center text-white mb-8">Découvrez la Magie de IAHomeStaging</h2>
             <Carousel items={carouselData} />
        </section>

        <section className="mt-16">
            <FAQ items={faqData} />
        </section>

      </main>
      
      <footer className="text-center py-4 mt-8 text-gray-500 text-sm">
        <p>Propulsé par AiHomeStaging - 2025.</p>
        <div className="flex justify-center items-center gap-x-4 mt-2">
            <button onClick={() => setActiveModal('legal')} className="text-gray-400 hover:text-brand-secondary underline text-xs">
                Mentions Légales
            </button>
            <span className="text-gray-600">|</span>
            <button onClick={() => setActiveModal('info')} className="text-gray-400 hover:text-brand-secondary underline text-xs">
                Informations
            </button>
        </div>
      </footer>

      <Modal isOpen={activeModal === 'legal'} onClose={() => setActiveModal(null)} title="Mentions Légales">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-white mb-1">Éditeur de l'application</h3>
            <p>Cette application est une démonstration technique. <br/>Nom de l'entreprise (fictif) : AI Home Staging Services</p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-1">Contact</h3>
            <p>Pour toute question, veuillez nous contacter à l'adresse e-mail suivante (fictive) : <a href="mailto:contact@aihomestaging.example.com" className="text-brand-secondary">contact@aihomestaging.example.com</a></p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-1">Hébergement</h3>
            <p>Cette application est hébergée sur une infrastructure cloud moderne. Hébergeur (fictif) : Cloud Services Provider, Dublin, Ireland.</p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-1">Propriété Intellectuelle</h3>
            <p>Vous conservez tous les droits sur les photos originales que vous téléchargez. En utilisant notre service, vous nous accordez une licence limitée pour traiter vos images afin de générer les versions retouchées. Les images générées et débloquées sont pour votre usage personnel ou commercial.</p>
          </div>
           <div>
            <h3 className="font-bold text-white mb-1">Données Personnelles</h3>
            <p>Cette application utilise Firebase Authentication pour la gestion des comptes utilisateurs. Les images sont envoyées à l'API de Google pour traitement et ne sont pas conservées par notre service.</p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-1">Limitation de Responsabilité</h3>
            <p>Le service est fourni "en l'état". Bien que nous nous efforçons de fournir des résultats de haute qualité, nous ne pouvons garantir que les images générées par l'IA seront exemptes d'erreurs ou d'artefacts. Il est de votre responsabilité de vérifier que les images conviennent à votre usage.</p>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'info'} onClose={() => setActiveModal(null)} title="Informations sur l'Application">
         <div className="space-y-4">
          <div>
            <h3 className="font-bold text-white mb-1">Comment ça marche ?</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li><span className="font-semibold">Téléchargez vos photos :</span> Glissez-déposez ou sélectionnez des images de pièces à redécorer.</li>
              <li><span className="font-semibold">L'IA transforme vos espaces :</span> Notre IA analyse votre photo et génère une version moderne et épurée en quelques instants.</li>
              <li><span className="font-semibold">Débloquez et téléchargez :</span> Utilisez un "Token" pour retirer le filigrane et télécharger votre nouvelle image en haute qualité, prête pour vos annonces.</li>
            </ol>
          </div>
          <div>
            <h3 className="font-bold text-white mb-1">À propos des Tokens</h3>
            <p>Les tokens sont la monnaie de l'application. Chaque token vous permet de débloquer une image. Un token de bienvenue est offert à chaque nouvelle inscription pour vous permettre de tester le service complet. Vous pouvez acheter des tokens supplémentaires via la page "Acheter".</p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-1">Confidentialité de vos images</h3>
            <p>Nous prenons la confidentialité au sérieux. Vos images originales sont envoyées de manière sécurisée à l'API de Google Gemini pour être traitées. Elles ne sont ni stockées sur nos serveurs, ni utilisées à d'autres fins que la génération de votre image retouchée.</p>
          </div>
        </div>
      </Modal>

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        user={user}
        onDeleteAccount={handleDeleteAccount}
      />
    </div>
  );
};

export default App;