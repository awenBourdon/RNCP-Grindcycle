import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogIn, ShoppingCart, ArrowRight, User, Zap } from 'lucide-react';
import { ReturnButton } from '@/components/ui/ReturnButton';

export default async function RedirectPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (session) {
    redirect('/paiement/livraison');
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-40">
        <div className="mb-8">
          <ReturnButton href="/panier" label="Panier" />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-normal text-black mb-6">
              Finalise ta commande
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Comment souhaites-tu continuer ? Tu peux te connecter à ton compte
              ou procéder directement au paiement.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-[#f8f7f4] rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-[#0a3d3f] rounded-full flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
              </div>

              <h3 className="text-2xl font-medium text-black mb-4">
                Se connecter
              </h3>
              <p className="text-gray-600 mb-8">
                Accède à ton compte GRINDCYCLE pour continuer
              </p>

              <Link
                href="/authentification/connexion?redirect=/paiement/livraison"
                className="group w-full inline-flex items-center justify-center rounded-full text-lg font-medium px-8 py-4 bg-[#0a3d3f] text-white hover:bg-[#0a4d4f] transition-colors"
              >
                <LogIn size={20} className="mr-2" />
                Se connecter
                <ArrowRight
                  size={16}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </Link>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Pas de compte ?{' '}
                <Link
                  href="/authentification/inscription"
                  className="text-[#0a3d3f] hover:underline"
                >
                  Créer un compte
                </Link>
              </p>
            </div>

            <div className="bg-[#f8f7f4] rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-[#0a3d3f] rounded-full flex items-center justify-center">
                  <Zap size={24} className="text-white" />
                </div>
              </div>

              <h3 className="text-2xl font-medium text-black mb-4">
                Continuer en invité
              </h3>
              <p className="text-gray-600 mb-8">
                Procède directement au paiement sans compte
              </p>

              <Link
                href="/paiement/livraison"
                className="group w-full inline-flex items-center justify-center rounded-full text-lg font-medium px-8 py-4 border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <ShoppingCart size={20} className="mr-2" />
                Continuer en invité
                <ArrowRight
                  size={16}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </Link>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Aucune inscription requise
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">🔒 Paiement sécurisé</p>
          </div>
        </div>
      </div>
    </div>
  );
}
