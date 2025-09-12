'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, X } from 'lucide-react';
import { deleteUserAction } from '@/actions/auth/delete-user.action';

export function DeleteAccountModal({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteUserAction({ userId });

      if (result.success) {
        toast.success('Ton compte a été supprimé avec succès');

        if (result.shouldRedirect) {
          setTimeout(() => {
            window.location.href = '/authentification/connexion';
          }, 1500);
          return;
        }
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur lors de la suppression du compte');
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className="bg-[#f8f7f4] rounded-xl p-8 mt-8">
        <div className="flex items-center mb-6">
          <AlertTriangle size={24} className="text-[#0a3d3f] mr-3" />
          <h2 className="text-2xl font-normal text-[#010101]">
            Supprimer mon compte
          </h2>
        </div>

        <p className="text-gray-700 mb-4">
          Si tu souhaites définitivement supprimer ton compte et toutes tes
          données, tu peux{' '}
          <button
            onClick={() => setIsOpen(true)}
            className="text-red-600 hover:text-red-700 underline font-medium transition-colors cursor-pointer"
          >
            supprimer ton compte ici
          </button>
          . Cette action est irréversible.
        </p>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-red-900 flex items-center">
                <AlertTriangle size={20} className="mr-2" />
                Supprimer ton compte
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">
                  <strong>Attention :</strong> Cette action supprimera
                  définitivement :
                </p>
                <ul className="text-red-700 text-sm mt-2 space-y-1">
                  <li>• Tes points Grindcycle</li>
                  <li>• Tes planches en cours de traitement</li>
                  <li>• Ton historique de commandes</li>
                  <li>• Toutes tes données personnelles</li>
                </ul>
              </div>

              <p className="text-gray-600 text-sm">
                Cette action est <strong>irréversible</strong>. Es-tu sûr de
                vouloir continuer ?
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 text-red-500 px-4 py-3 font-medium cursor-pointer hover:underline"
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                className="flex-1 text-gray-700 px-4 py-3 font-medium cursor-pointer hover:underline"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
