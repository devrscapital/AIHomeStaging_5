
import React, { useState } from 'react';
// FIX: Removed unused imports from `firebase/auth` and will use methods on the auth.currentUser object directly.
import { auth } from '../firebase';
import type { User } from '../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onDeleteAccount: () => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, user, onDeleteAccount }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);

  const [invoiceMessage, setInvoiceMessage] = useState<string | null>(null);
  const [isRequestingInvoice, setIsRequestingInvoice] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (!auth.currentUser) {
      setPasswordMessage({ type: 'error', text: 'Utilisateur non trouvé. Veuillez vous reconnecter.' });
      return;
    }
    if (!newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Veuillez remplir tous les champs.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    setIsPasswordChanging(true);
    try {
      // FIX: Use Firebase v8 compat syntax for updatePassword.
      await auth.currentUser.updatePassword(newPassword);
      setPasswordMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès !' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(null), 3000);
    } catch (error) {
       console.error("Password change error:", error);
       setPasswordMessage({ type: 'error', text: 'Erreur. Vous devez peut-être vous reconnecter pour effectuer cette action.' });
    } finally {
      setIsPasswordChanging(false);
    }
  };

  const handleInvoiceRequest = async () => {
    setInvoiceMessage(null);
    setIsRequestingInvoice(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRequestingInvoice(false);
    setInvoiceMessage(`Vos factures ont été envoyées à l'adresse ${user?.email}.`);
    setTimeout(() => setInvoiceMessage(null), 4000);
  };

  const handleDelete = async () => {
    const confirmationText = "Êtes-vous sûr de vouloir supprimer votre compte ?\n\n" +
      "Cette action est irréversible. Toutes vos données, y compris les tokens restants, seront définitivement supprimées.\n\n" +
      "Conformément au RGPD, cette action exercera votre droit à l'oubli.";
      
    if (window.confirm(confirmationText)) {
      if (auth.currentUser) {
        try {
          // FIX: Use Firebase v8 compat syntax for deleting a user. The method is `delete()`.
          await auth.currentUser.delete();
          onDeleteAccount();
          onClose();
        } catch (error) {
          console.error("Account deletion error:", error);
          alert("Une erreur est survenue. Vous devez peut-être vous reconnecter pour effectuer cette action.");
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700 sticky top-0 bg-gray-800">
          <h2 className="text-xl font-bold text-white">Gestion du Compte</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Fermer la modale"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 text-gray-300 space-y-8">
          {/* Change Password Section */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4">Changer le mot de passe</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="new-password"className="block text-sm font-medium text-gray-300">Nouveau mot de passe</label>
                <input
                  type="password"
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                  placeholder="********"
                  required
                />
              </div>
               <div>
                <label htmlFor="confirm-password"className="block text-sm font-medium text-gray-300">Confirmer le mot de passe</label>
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                  placeholder="********"
                  required
                />
              </div>
              {passwordMessage && (
                <p className={`text-sm text-center ${passwordMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {passwordMessage.text}
                </p>
              )}
              <button
                type="submit"
                disabled={isPasswordChanging}
                className="w-full sm:w-auto px-6 py-2 font-bold text-white bg-brand-primary rounded-md hover:bg-brand-secondary transition-colors disabled:bg-brand-gray disabled:cursor-wait"
              >
                {isPasswordChanging ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </form>
          </section>

          <hr className="border-gray-700" />

          {/* Invoice Section */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4">Facturation</h3>
            <p className="text-sm mb-4">Demandez un récapitulatif de vos achats de tokens.</p>
             {invoiceMessage && (
                <p className="text-sm text-center text-green-400 mb-4">{invoiceMessage}</p>
              )}
            <button
              onClick={handleInvoiceRequest}
              disabled={isRequestingInvoice}
              className="w-full sm:w-auto px-6 py-2 font-bold text-white bg-gray-600 rounded-md hover:bg-gray-500 transition-colors disabled:bg-brand-gray disabled:cursor-wait"
            >
              {isRequestingInvoice ? 'Envoi en cours...' : 'Recevoir mes factures'}
            </button>
          </section>

          <hr className="border-gray-700" />

          {/* Delete Account Section */}
          <section className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Zone de Danger</h3>
            <p className="text-sm mb-4">
              La suppression de votre compte est définitive. Toutes vos données, y compris les tokens restants, seront perdues. Cette action est irréversible et conforme au RGPD concernant votre droit à l'oubli.
            </p>
            <button
              onClick={handleDelete}
              className="w-full sm:w-auto px-6 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              Supprimer mon compte
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;
