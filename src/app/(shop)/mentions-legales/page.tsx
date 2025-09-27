import { ReturnButton } from '@/app/(shop)/components/ReturnButton';
import { Scale, Shield, Globe, Mail } from 'lucide-react';

export default function LegalNoticesPage() {
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
              Mentions Légales
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Informations légales relatives au site Grindcycle, projet étudiant
              RNCP
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-[#f8f7f4] rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6 flex items-center">
                <Globe size={24} className="mr-3 text-[#0a3d3f]" />
                Éditeur du site
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-2">
                    Nom du site
                  </h3>
                  <p className="text-gray-700">Grindcycle</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-2">
                    Propriétaire
                  </h3>
                  <p className="text-gray-700">Awen Bourdon</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-2">
                    Statut
                  </h3>
                  <p className="text-gray-700">
                    Projet étudiant réalisé dans le cadre d&apos;une formation
                    RNCP Concepteur Développeur d&apos;Applications
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-2">
                    Établissement
                  </h3>
                  <p className="text-gray-700">Ada Tech School</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-2">
                    Adresse
                  </h3>
                  <p className="text-gray-700">
                    3 Bd de Stalingrad, 44000 Nantes
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-2">
                    Contact
                  </h3>
                  <p className="text-gray-700 flex items-center">
                    <Mail size={16} className="mr-2 text-[#0a3d3f]" />
                    hellogrindcycle@gmail.com
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6 flex items-center">
                <Shield size={24} className="mr-3 text-[#0a3d3f]" />
                Hébergement
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-2">
                    Hébergeur
                  </h3>
                  <p className="text-gray-700">A REMPLIR</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-2">
                    Adresse
                  </h3>
                  <p className="text-gray-700">
                    A REMPLIR
                    <br />A REMPLIR
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-2">
                    Site web
                  </h3>
                  <p className="text-gray-700">
                    <a
                      href="https://bonjour.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0a3d3f] hover:underline"
                    >
                      A REMPLIR
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#f8f7f4] rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6">
                Propriété intellectuelle
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    Nature du projet
                  </h3>
                  <p className="text-gray-700">
                    Ce site web est un projet réalisé dans le cadre d&apos;une
                    formation RNCP à des fins pédagogiques uniquement. Il ne
                    constitue pas une activité commerciale réelle et n&apos;a
                    pas vocation à être exploité commercialement.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    Contenus utilisés
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Tous les contenus présents sur ce site sont utilisés à des
                    fins pédagogiques :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>
                      Les textes sont des créations originales ou des contenus
                      fictifs
                    </li>
                    <li>
                      Les images proviennent de banques d&apos;images libres de
                      droits (A REMPLIR)
                    </li>
                    <li>
                      Les icônes proviennent de la bibliothèque Lucide React
                      (licence MIT)
                    </li>
                    <li>
                      Le design et l&apos;interface sont des créations
                      originales
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    Crédits photos
                  </h3>
                  <p className="text-gray-700">
                    Photos de skateboard : A REMPLIR
                    <br />
                    Icônes : Lucide React (lucide.dev)
                    <br />
                    Illustrations : A REMPLIR
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6">
                Données personnelles et cookies
              </h2>

              <div className="space-y-4">
                <p className="text-gray-700">
                  Pour toutes les informations concernant la collecte, le
                  traitement et la protection de vos données personnelles,
                  veuillez consulter notre{' '}
                  <a
                    href="/politique-confidentialite"
                    className="text-[#0a3d3f] hover:underline font-medium"
                  >
                    Politique de confidentialité
                  </a>
                  .
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-[#010101] mb-2">
                    Cookies techniques
                  </h3>
                  <p className="text-gray-700">
                    Ce site utilise uniquement des cookies nécessaires pour les
                    fonctionnalités liées à l&apos;authentification . Aucun
                    cookie de traçage publicitaire ou analytique n&apos;est
                    utilisé.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#f8f7f4] rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6">
                Limitation de responsabilité
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    Projet pédagogique
                  </h3>
                  <p className="text-gray-700">
                    Ce site web est un projet étudiant réalisé à des fins
                    pédagogiques dans le cadre d&apos;une formation RNCP. Les
                    informations présentées, les produits affichés et les
                    services décrits sont fictifs et ne constituent pas une
                    offre commerciale réelle.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    Disponibilité du service
                  </h3>
                  <p className="text-gray-700">
                    L&apos;éditeur s&apos;efforce d&apos;assurer la
                    disponibilité du site, mais ne peut garantir une
                    accessibilité permanente. Le site peut être temporairement
                    indisponible pour des raisons de maintenance, de mise à jour
                    ou de problèmes techniques.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    Contenu
                  </h3>
                  <p className="text-gray-700">
                    Les informations diffusées sur ce site sont données à titre
                    indicatif et pédagogique. L&apos;éditeur ne peut être tenu
                    responsable de l&apos;exactitude, de l&apos;exhaustivité ou
                    de l&apos;actualité de ces informations.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6">
                Droit applicable et juridiction
              </h2>

              <div className="space-y-4">
                <p className="text-gray-700">
                  Les présentes mentions légales sont soumises au droit
                  français. En cas de litige, les tribunaux français seront
                  seuls compétents.
                </p>

                <p className="text-gray-700">
                  Pour toute question relative à ces mentions légales, vous
                  pouvez me contacter à l&apos;adresse :
                  <span className="font-medium text-[#0a3d3f]">
                    {' '}
                    hellogrindcycle@gmail.com
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-[#f8f7f4] rounded-xl p-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6">
                Contact et réclamations
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-2">
                    Pour toute question
                  </h3>
                  <p className="text-gray-700">
                    Si vous avez des questions concernant ces mentions légales,
                    le site web ou le projet, vous pouvez me contacter à
                    l&rsquo;adresse électronique suivante :
                  </p>
                  <p className="text-[#0a3d3f] font-medium mt-2">
                    <Mail size={16} className="inline mr-2" />
                    hellogrindcycle@gmail.com
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-2">
                    Délai de réponse
                  </h3>
                  <p className="text-gray-700">
                    Je m&apos;engage à répondre dans les meilleurs délais.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                <strong>Dernière mise à jour :</strong> 07/09/2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
