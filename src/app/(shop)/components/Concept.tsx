import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';

export const Concept = () => {
  return (
    <section className="py-24 bg-[#f8f7f4] text-[#010101]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-3xl font-normal mb-6">Comment ça fonctionne</h2>
          <p className="text-lg text-gray-600 max-w-3xl">
            Découvre les étapes simples pour acheter ou échanger tes planches de
            skate pour qu&apos;elles se fassent recycler.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 mb-32 items-center">
          <div className="space-y-12">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#0a3d3f] text-white rounded-full">
              <span className="font-medium">ACHAT DIRECT</span>
            </div>

            <h3 className="text-3xl font-normal">Trouve ta future planche</h3>

            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#0a3d3f] text-white text-xl font-medium rounded-full">
                  1
                </div>
                <div>
                  <p className="text-xl font-medium">Choisis ta planche</p>
                  <p className="text-gray-600 mt-2">
                    Parcours notre collection de modèles uniques et recyclés
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#0a3d3f] text-white text-xl font-medium rounded-full">
                  2
                </div>
                <div>
                  <p className="text-xl font-medium">Commande et va rouler</p>
                  <p className="text-gray-600 mt-2">
                    Livraison rapide et satisfaction garantie
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Link
                href="/catalogue"
                className="inline-flex items-center group"
              >
                <span className="border-b border-black pb-1 group-hover:border-[#0a3d3f] transition-colors">
                  Voir nos planches
                </span>
                <ArrowRight
                  size={16}
                  className="ml-2 transform group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden aspect-[4/3] rounded-xl">
              <Image
                src="/placeholder.webp"
                alt="Achat de planches recyclées"
                width={800}
                height={600}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg max-w-[250px] shadow-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 flex items-center justify-center bg-[#0a3d3f] rounded-full text-white text-sm">
                  €
                </div>
                <span className="font-medium">Paiement sécurisé</span>
              </div>
              <p className="text-sm text-gray-600">On gère, tu roules</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="relative overflow-hidden aspect-[4/3] rounded-xl">
              <Image
                src="/placeholder.webp"
                alt="Recyclage de skate"
                width={800}
                height={600}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg max-w-[250px] shadow-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 flex items-center justify-center bg-[#0a3d3f] rounded-full text-white text-sm">
                  <Package size={16} />
                </div>
                <span className="font-medium">Expédition gratuite</span>
              </div>
              <p className="text-sm text-gray-600">
                À partir de 100€ d&apos;achat
              </p>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-12">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#0a3d3f] text-white rounded-full">
              <span className="font-medium">ÉCHANGER MA PLANCHE</span>
            </div>

            <h3 className="text-3xl font-normal">
              Donne une seconde vie à ta planche
            </h3>

            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#0a3d3f] text-white text-xl font-medium rounded-full">
                  1
                </div>
                <div>
                  <p className="text-xl font-medium">Envoie ta planche usée</p>
                  <p className="text-gray-600 mt-2">
                    On te la récupère gratuitement
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#0a3d3f] text-white text-xl font-medium rounded-full">
                  2
                </div>
                <div>
                  <p className="text-xl font-medium">Réhabilitation</p>
                  <p className="text-gray-600 mt-2">
                    On la réhabilite pour lui donner une seconde vie
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#0a3d3f] text-white text-xl font-medium rounded-full">
                  3
                </div>
                <div>
                  <p className="text-xl font-medium">Gagne des points</p>
                  <p className="text-gray-600 mt-2">
                    Dès qu&apos;on reçoit ta planche !
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#0a3d3f] text-white text-xl font-medium rounded-full">
                  4
                </div>
                <div>
                  <p className="text-xl font-medium">Échange tes points</p>
                  <p className="text-gray-600 mt-2">
                    Contre une planche recyclée et va rouler !
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Link
                href="/recycler-planche"
                className="inline-flex items-center group"
              >
                <span className="border-b border-black pb-1 group-hover:border-[#0a3d3f] transition-colors">
                  Recycler ma planche
                </span>
                <ArrowRight
                  size={16}
                  className="ml-2 transform group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
