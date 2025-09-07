import { ReturnButton } from '@/components/ui/ReturnButton';
import {
  ShoppingCart,
  Shield,
  Scale,
  Package,
  CreditCard,
  Truck,
  Recycle,
  AlertTriangle,
} from 'lucide-react';
export default function CGVPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-40">
        <div className="mb-12">
          <ReturnButton href="/" label="Accueil" />
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#0a3d3f] rounded-full flex items-center justify-center">
                <Scale size={32} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-normal text-black mb-6">
              Conditions Générales de Vente
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Conditions régissant les ventes sur Grindcycle, projet étudiant
              RNCP
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  size={20}
                  className="text-amber-600 mt-0.5 flex-shrink-0"
                />
                <div>
                  <h3 className="text-lg font-medium text-amber-800 mb-2">
                    Avertissement Important
                  </h3>
                  <p className="text-amber-700">
                    Ce site web est un projet étudiant réalisé dans le cadre
                    d&apos;une formation RNCP à des fins pédagogiques
                    uniquement. Il ne constitue pas une activité commerciale
                    réelle et n&apos;a pas vocation à être exploité
                    commercialement. Les présentes CGV sont fictives et rédigées
                    à titre d&apos;exemple.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#f8f7f4] rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6 flex items-center">
                <Shield size={24} className="mr-3 text-[#0a3d3f]" />
                1. Informations générales
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    1.1 Présentation de l&apos;entreprise
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      <strong>Nom du projet :</strong> Grindcycle
                    </p>
                    <p>
                      <strong>Propriétaire :</strong> Awen Bourdon
                    </p>
                    <p>
                      <strong>Statut :</strong> Projet étudiant RNCP
                    </p>
                    <p>
                      <strong>Établissement :</strong> Ada Tech School
                    </p>
                    <p>
                      <strong>Adresse :</strong> 3 Bd de Stalingrad, 44000
                      Nantes
                    </p>
                    <p>
                      <strong>Email :</strong> hellogrindcycle@gmail.com
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    1.2 Objet
                  </h3>
                  <p className="text-gray-700">
                    Les présentes conditions générales de vente (CGV) régissent
                    les relations contractuelles fictives entre Grindcycle et
                    ses utilisateurs dans le cadre de ce projet étudiant
                    simulant la vente de planches de skateboard recyclées.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6 flex items-center">
                <Package size={24} className="mr-3 text-[#0a3d3f]" />
                2. Produits et services
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    2.1 Description des produits
                  </h3>
                  <div className="text-gray-700 space-y-2">
                    <p>Grindcycle propose :</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>
                        Des planches de skateboard recyclées (skateboards,
                        cruisers, longboards)
                      </li>
                      <li>
                        Chaque planche est restaurée selon nos standards de
                        qualité
                      </li>
                      <li>
                        Les produits sont décrits avec le maximum de précision
                        sur le site
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    2.2 Programme de recyclage
                  </h3>
                  <p className="text-gray-700">
                    Grindcycle propose un service de collecte et recyclage de
                    planches usées en échange de points.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#f8f7f4] rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6 flex items-center">
                <ShoppingCart size={24} className="mr-3 text-[#0a3d3f]" />
                3. Processus de commande
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    3.1 Étapes de commande
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Sélection des produits et ajout au panier</li>
                    <li>Vérification du panier et du montant total</li>
                    <li>
                      Choix du mode de paiement (carte bancaire ou points
                      Grindcycle)
                    </li>
                    <li>Saisie des informations de livraison</li>
                    <li>Confirmation de commande</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    3.2 Confirmation de commande
                  </h3>
                  <p className="text-gray-700">
                    Toute commande fait l&apos;objet d&apos;un accusé de
                    réception par email confirmant les détails de la commande et
                    sa prise en compte.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6 flex items-center">
                <CreditCard size={24} className="mr-3 text-[#0a3d3f]" />
                4. Prix et paiement
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    4.1 Prix
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Les prix sont indiqués en euros TTC</li>
                    <li>Les prix incluent la TVA applicable</li>
                    <li>
                      Les frais de livraison sont indiqués avant validation
                    </li>
                    <li>
                      <strong>
                        Livraison gratuite à partir de 100€ d&apos;achat
                      </strong>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    4.2 Modes de paiement
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-[#010101] mb-2">
                        Paiement en euros :
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                        <li>
                          Cartes bancaires via Stripe (CB, Visa, Mastercard)
                        </li>
                        <li>Paiement sécurisé SSL</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-[#010101] mb-2">
                        Paiement en points grindcycle :
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                        <li>
                          Utilisation des points accumulés via le recyclage
                        </li>
                        <li>10 points = 1 euro</li>
                        <li>
                          <strong>
                            Livraison offerte pour les achats en points
                          </strong>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#f8f7f4] rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6 flex items-center">
                <Truck size={24} className="mr-3 text-[#0a3d3f]" />
                5. Livraison
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    5.1 Zone de livraison
                  </h3>
                  <p className="text-gray-700">
                    Livraisons en France métropolitaine et pays limitrophes.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    5.2 Délais de livraison
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>
                      <strong>Traitement de la commande :</strong> 24-48h
                    </li>
                    <li>
                      <strong>Livraison standard :</strong> 3-5 jours ouvrés
                    </li>
                    <li>Les délais sont donnés à titre indicatif</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    5.3 Frais de livraison
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <ul className="space-y-2 text-gray-700">
                      <li>
                        <strong>5,90€</strong> pour les commandes inférieures à
                        100€
                      </li>
                      <li>
                        <strong>Gratuite</strong> à partir de 100€ d&apos;achat
                      </li>
                      <li>
                        <strong>Gratuite</strong> pour les achats en points
                        GRINDCYCLE
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6">
                6. Droit de rétractation et retours
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    6.1 Droit de rétractation
                  </h3>
                  <p className="text-gray-700">
                    Conformément à la législation, le client dispose de{' '}
                    <strong>14 jours</strong> à compter de la réception des
                    produits pour exercer son droit de rétractation.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    6.2 Conditions de retour
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Produits retournés dans leur état d&apos;origine</li>
                    <li>Emballage d&apos;origine conservé</li>
                    <li>Aucune dégradation due à l&apos;utilisation</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    6.3 Frais de retour
                  </h3>
                  <p className="text-gray-700">
                    Les frais de retour sont à la charge du client, sauf en cas
                    de produit défectueux ou d&apos;erreur de GRINDCYCLE.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#f8f7f4] rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6 flex items-center">
                <Recycle size={24} className="mr-3 text-[#0a3d3f]" />
                7. Programme de points GRINDCYCLE
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    7.1 Fonctionnement
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>
                      Obtention de points en envoyant des planches usées à
                      recycler
                    </li>
                    <li>
                      Utilisation des points pour acheter des produits (1€ = 10
                      points)
                    </li>
                    <li>Les points n&apos;ont pas de date d&apos;expiration</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    7.2 Évaluation des planches
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <ul className="space-y-2 text-gray-700">
                      <li>
                        Chaque planche envoyée est évaluée par notre équipe
                      </li>
                      <li>
                        Les points sont attribués selon l&apos;état et la
                        qualité
                      </li>
                      <li>
                        L&apos;évaluation est définitive et non contestable
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    7.3 Conditions d&apos;envoi
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>
                      Le client prend en charge l&apos;expédition de sa planche
                      usée
                    </li>
                    <li>
                      GRINDCYCLE fournit les instructions d&apos;emballage
                    </li>
                    <li>
                      Aucune garantie sur les planches reçues endommagées
                      pendant le transport
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6">
                8. Garanties
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    8.1 Garantie qualité
                  </h3>
                  <p className="text-gray-700">
                    Grindcycle garantit la conformité de ses produits recyclés
                    aux standards de qualité annoncés. Chaque planche est
                    vérifiée avant expédition.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    8.2 Limitation de garantie
                  </h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-700 mb-2">
                      La garantie ne couvre pas :
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                      <li>L&apos;usure normale due à l&apos;utilisation</li>
                      <li>Les dommages dus à une mauvaise utilisation</li>
                      <li>Les modifications apportées par le client</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#f8f7f4] rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6">
                9. Protection des données personnelles
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    9.1 Collecte des données
                  </h3>
                  <p className="text-gray-700">
                    Grindcycle collecte uniquement les données nécessaires au
                    traitement des commandes et à la gestion de la relation
                    client.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    9.2 Utilisation des données
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-700 mb-2">
                      Les données sont utilisées pour :
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                      <li>Traitement et suivi des commandes</li>
                      <li>Gestion du programme de points</li>
                      <li>Communication commerciale (avec consentement)</li>
                      <li>Amélioration des services</li>
                    </ul>
                  </div>
                </div>

                <p className="text-gray-700">
                  Pour plus d&apos;informations, consultez notre{' '}
                  <a
                    href="/politique-confidentialite"
                    className="text-[#0a3d3f] hover:underline font-medium"
                  >
                    Politique de confidentialité
                  </a>
                  .
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6">
                10. Responsabilité et limitation
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    10.1 Projet pédagogique
                  </h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-gray-700">
                      Ce site web est un projet étudiant réalisé à des fins
                      pédagogiques. Les informations présentées, les produits
                      affichés et les services décrits sont fictifs et ne
                      constituent pas une offre commerciale réelle.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    10.2 Limitation de responsabilité
                  </h3>
                  <p className="text-gray-700">
                    La responsabilité de Grindcycle ne peut être engagée que
                    pour des dommages directs. Elle ne peut en aucun cas être
                    engagée pour des dommages indirects.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    10.3 Cas d&apos;exonération
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Force majeure ou cas fortuit</li>
                    <li>Défaillance du transporteur</li>
                    <li>Utilisation incorrecte du produit par le client</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-[#f8f7f4] rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6">
                11. Service client et médiation
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    11.1 Contact
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-700 mb-2">
                      Pour toute question ou réclamation :
                    </p>
                    <p className="text-[#0a3d3f] font-medium">
                      📧 hellogrindcycle@gmail.com
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Délai de réponse : 48h maximum
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    11.2 Médiation
                  </h3>
                  <p className="text-gray-700">
                    En cas de litige non résolu à l&apos;amiable, le client peut
                    saisir le médiateur de la consommation compétent.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6">
                12. Droit applicable
              </h2>

              <div className="space-y-4">
                <p className="text-gray-700">
                  Les présentes CGV sont soumises au droit français. En cas de
                  litige, les tribunaux français sont seuls compétents.
                </p>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    12.1 Nullité partielle
                  </h3>
                  <p className="text-gray-700">
                    Si une clause des présentes CGV était déclarée nulle, les
                    autres clauses resteraient en vigueur.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    12.2 Modification des CGV
                  </h3>
                  <p className="text-gray-700">
                    Grindcycle se réserve le droit de modifier les présentes
                    CGV. Les nouvelles conditions s&apos;appliquent à toute
                    commande postérieure à leur mise en ligne.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                <strong>Dernière mise à jour :</strong>{' '}
                {new Date().toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Ces conditions générales de vente peuvent être modifiées à tout
                moment. Il est conseillé de les consulter régulièrement.
              </p>
            </div>

            <div className="text-center mt-8">
              <div className="inline-flex items-center px-6 py-3 bg-[#0a3d3f] text-white rounded-full">
                <Recycle size={16} className="mr-2" />
                <span className="font-medium">
                  Grindcycle - Roule avec des planches recyclées & durables
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
