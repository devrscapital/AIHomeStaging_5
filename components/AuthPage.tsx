import React, { useState } from 'react';
// CORRECTIF DÉFINITIF: Utiliser les imports de compatibilité Firebase v8.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { auth } from '../firebase';
import type { User } from '../types';

interface AuthPageProps {
  onLoginSuccess: (user: User, isNewUser: boolean) => void;
  onBack: () => void;
}

type AuthError = firebase.auth.AuthError;

const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères.";
  }
  if (!/[a-z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une minuscule.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une majuscule.";
  }
  if (!/[0-9]/.test(password)) {
    return "Le mot de passe doit contenir au moins un chiffre.";
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return "Le mot de passe doit contenir au moins un caractère spécial.";
  }
  return null;
};


const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onBack }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const resetState = (clearEmail: boolean = false) => {
    if (clearEmail) setEmail('');
    setPassword('');
    setError(null);
    setMessage(null);
  };
  
  const handleFirebaseError = (err: unknown) => {
    const error = err as AuthError;
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        setError('Adresse e-mail ou mot de passe incorrect.');
        break;
      case 'auth/email-already-in-use':
        setError('Cette adresse e-mail est déjà utilisée.');
        break;
      case 'auth/weak-password':
        setError('Le mot de passe est trop faible. Veuillez suivre les exigences.');
        break;
      case 'auth/invalid-email':
         setError('L\'adresse e-mail n\'est pas valide.');
        break;
      case 'auth/popup-closed-by-user':
        setError('La fenêtre de connexion a été fermée. Veuillez réessayer.');
        break;
      default:
        setError('Une erreur est survenue. Veuillez réessayer.');
        break;
    }
  };

  const handleGoogleSignIn = async () => {
    setIsProcessing(true);
    setError(null);
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      const result = await auth.signInWithPopup(provider);
      const user = result.user;
      if (user) {
        const isNewUser = result.additionalUserInfo?.isNewUser || false;
        onLoginSuccess({ uid: user.uid, email: user.email }, isNewUser);
      }
    } catch (err) {
      handleFirebaseError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleModeChange = (mode: 'login' | 'signup' | 'forgot') => {
    setAuthMode(mode);
    resetState(mode === 'forgot');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Veuillez entrer votre adresse e-mail.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    setMessage(null);
    
    try {
      await auth.sendPasswordResetEmail(email);
      setMessage(`Si un compte est associé à ${email}, un lien de réinitialisation a été envoyé. Pensez à vérifier vos spams.`);
      setTimeout(() => {
        handleModeChange('login');
      }, 5000);
    } catch (err) {
      handleFirebaseError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    setMessage(null);
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      setIsProcessing(false);
      return;
    }

    if (authMode === 'signup') {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        setIsProcessing(false);
        return;
      }
    }
    
    try {
      if (authMode === 'signup') {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        if (userCredential.user) {
          onLoginSuccess({ uid: userCredential.user.uid, email: userCredential.user.email }, true);
        }
      } else { // login
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
         if (userCredential.user) {
          onLoginSuccess({ uid: userCredential.user.uid, email: userCredential.user.email }, false);
        }
      }
    } catch (err) {
      handleFirebaseError(err);
      setIsProcessing(false);
    }
  };

  const renderContent = () => {
    if (authMode === 'forgot') {
      return (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-center text-white">Mot de passe oublié ?</h1>
            <p className="text-center text-gray-400 mt-2">Entrez votre e-mail pour recevoir un lien de réinitialisation.</p>
          </div>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Adresse e-mail</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                placeholder="vous@exemple.com"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            {message && <p className="text-green-400 text-sm text-center">{message}</p>}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 px-4 font-bold text-white bg-brand-primary rounded-md hover:bg-brand-secondary transition-colors disabled:bg-brand-gray disabled:cursor-wait"
            >
              {isProcessing ? 'Envoi...' : 'Envoyer le lien'}
            </button>
          </form>
          <div className="text-center mt-6">
            <button onClick={() => handleModeChange('login')} className="text-sm text-brand-secondary hover:underline">
              Retour à la connexion
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-center text-white">
            {authMode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p className="text-center text-gray-400 mt-2">Pour sauvegarder vos crédits et vos images.</p>
        </div>
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => handleModeChange('login')}
            className={`w-1/2 py-3 font-semibold text-center transition-colors ${authMode === 'login' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-500'}`}
          >
            Se Connecter
          </button>
          <button
            onClick={() => handleModeChange('signup')}
            className={`w-1/2 py-3 font-semibold text-center transition-colors ${authMode === 'signup' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-500'}`}
          >
            S'inscrire
          </button>
        </div>
        {message && <p className="text-green-400 text-sm text-center mb-4">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Adresse e-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              placeholder="vous@exemple.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              placeholder="********"
              required
            />
          </div>
          {authMode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => handleModeChange('forgot')}
                className="text-sm font-medium text-brand-secondary hover:underline focus:outline-none"
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}
          {error && <p className="text-red-400 text-sm text-center break-words">{error}</p>}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 px-4 font-bold text-white bg-brand-primary rounded-md hover:bg-brand-secondary transition-colors disabled:bg-brand-gray disabled:cursor-wait"
          >
            {isProcessing ? 'Traitement...' : (authMode === 'login' ? 'Se connecter' : "S'inscrire")}
          </button>
        </form>

        <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="mx-4 text-gray-500 text-sm">OU</span>
            <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={isProcessing}
          className="w-full flex justify-center items-center gap-x-3 py-3 px-4 font-semibold text-gray-800 bg-white rounded-md hover:bg-gray-200 transition-colors disabled:bg-gray-300 disabled:cursor-wait"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.138,44,30.024,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
          </svg>
          Continuer avec Google
        </button>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-brand-dark text-brand-light font-sans p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="mb-8 text-brand-secondary hover:text-brand-primary transition-colors">
          &larr; Retour à l'accueil
        </button>
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;