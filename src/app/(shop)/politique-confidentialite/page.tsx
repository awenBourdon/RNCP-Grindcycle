import { ReturnButton } from '@/app/(shop)/components/ReturnButton';
import {
  Shield,
  User,
  Lock,
  Eye,
  Mail,
  Clock,
  Database,
  UserCheck,
} from 'lucide-react';

export default function PrivacyPolicyPage() {
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
                <Shield size={32} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-normal text-black mb-6">
              Politique de Confidentialité
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Protection de vos données personnelles conforme au RGPD
            </p>
          </div>

          {/* Contenu */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-[#f8f7f4] rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6 flex items-center">
                <Shield size={24} className="mr-3 text-[#0a3d3f]" />
                Introduction et engagement
              </h2>

              <div className="space-y-4">
                <p className="text-gray-700">
                  Dans le cadre de mon projet Grindcycle, projet étudiant
                  réalisé pour une formation RNCP, je m&apos;engage à protéger
                  et respecter votre vie privée conformément au Règlement
                  Général sur la Protection des Données (RGPD) et à la loi
                  française.
                </p>

                <p className="text-gray-700">
                  Cette politique de confidentialité vous informe sur la manière
                  dont je collecte, utilise, stocke et protége vos données
                  personnelles lorsque vous utilisez mon site web.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Important :</strong> Ce site est un projet
                    pédagogique. Toutes les données collectées le sont
                    uniquement à des fins d&apos;apprentissage et seront
                    supprimées à l&apos;issue de la formation.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6 flex items-center">
                <User size={24} className="mr-3 text-[#0a3d3f]" />
                Responsable du traitement
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-2">
                    Identité
                  </h3>
                  <p className="text-gray-700">
                    <strong>Nom :</strong> Awen Bourdon
                    <br />
                    <strong>Qualité :</strong> Étudiant RNCP Concepteur
                    Développeur d&apos;Applications
                    <br />
                    <strong>Établissement :</strong> Ada Tech School
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-2">
                    Contact
                  </h3>
                  <p className="text-gray-700 flex items-center">
                    <Mail size={16} className="mr-2 text-[#0a3d3f]" />
                    <strong>Email :</strong> hellogrindcycle@gmail.com
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-2">
                    Délégué à la protection des données
                  </h3>
                  <p className="text-gray-700">
                    Pour ce projet étudiant, vous pouvez contacter directement
                    le responsable du traitement à l&apos;adresse email
                    ci-dessus pour toute question relative à vos données
                    personnelles.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#f8f7f4] rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6 flex items-center">
                <Database size={24} className="mr-3 text-[#0a3d3f]" />
                Données personnelles collectées
              </h2>

              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6">
                  <h3 className="text-lg font-medium text-[#010101] mb-4 flex items-center">
                    <UserCheck size={20} className="mr-2 text-[#0a3d3f]" />
                    Lors de l&apos;inscription
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Données collectées :
                      </h4>
                      <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                        <li>Nom d&apos;utilisateur</li>
                        <li>Adresse email</li>
                        <li>Mot de passe (chiffré avec argon2)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Base légale :
                      </h4>
                      <p className="text-gray-700">
                        Consentement (Article 6.1.a du RGPD)
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Finalité :</h4>
                      <p className="text-gray-700">
                        Création et gestion de votre compte utilisateur sur la
                        plateforme
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6">
                  <h3 className="text-lg font-medium text-[#010101] mb-4 flex items-center">
                    <Eye size={20} className="mr-2 text-[#0a3d3f]" />
                    Lors de l&apos;utilisation du service
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Données collectées :
                      </h4>
                      <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                        <li>Historique des commandes</li>
                        <li>
                          Planches recyclées soumises (photos, descriptions)
                        </li>
                        <li>Points accumulés et utilisés</li>
                        <li>Adresses de livraison (temporaires)</li>
                        <li>Favoris (produits aimés)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Base légale :
                      </h4>
                      <p className="text-gray-700">
                        Exécution du contrat (Article 6.1.b du RGPD)
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Finalité :</h4>
                      <p className="text-gray-700">
                        Fonctionnement du service de recyclage et de vente de
                        planches
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6">
                  <h3 className="text-lg font-medium text-[#010101] mb-4 flex items-center">
                    <Lock size={20} className="mr-2 text-[#0a3d3f]" />
                    Données techniques
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Données stockées temporairement :
                      </h4>
                      <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                        <li>
                          Session utilisateur (authentification via cookies)
                        </li>
                        <li>
                          Contenu du panier (stocké en mémoire, non persistant)
                        </li>
                        <li>État de l&apos;interface (temporaire)</li>
                        <li>Protection CSRF (via cookies de session)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Base légale :
                      </h4>
                      <p className="text-gray-700">
                        Intérêt légitime (Article 6.1.f du RGPD)
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Finalité :</h4>
                      <p className="text-gray-700">
                        Fonctionnement technique et sécurité du site web
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6">
                Cookies et stockage des données
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    Cookies utilisés
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">
                      Cookies techniques (strictement nécessaires)
                    </h4>
                    <p className="text-green-700 text-sm mb-2">
                      Ces cookies sont indispensables au fonctionnement du site
                      et ne peuvent pas être désactivés :
                    </p>
                    <ul className="list-disc list-inside text-green-700 text-sm space-y-1">
                      <li>
                        <strong>Session d&apos;authentification</strong> : Vous
                        maintient connecté (durée : session)
                      </li>
                      <li>
                        <strong>Protection CSRF</strong> : Sécurise vos actions
                        contre les attaques (durée : session)
                      </li>
                      <li>
                        <strong>Préférences de sécurité</strong> : Configuration
                        de sécurité (durée : session)
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    Stockage local (non-cookies)
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">
                      Données stockées temporairement
                    </h4>
                    <p className="text-blue-700 text-sm mb-2">
                      Ces données sont stockées temporairement dans votre
                      navigateur sans utiliser de cookies :
                    </p>
                    <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
                      <li>
                        <strong>Panier d&apos;achat</strong> : Stocké localement
                        dans votre navigateur (localStorage)
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    Ce que je n&apos;utilise PAS
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">
                      Aucun cookie de traçage
                    </h4>
                    <p className="text-red-700 text-sm">
                      Ce site n&apos;utilise <strong>aucun</strong> cookie de
                      traçage, de publicité, d&apos;analyse ou de marketing. Je
                      ne collecte aucune donnée à des fins de profilage
                      publicitaire.
                    </p>
                    <ul className="list-disc list-inside text-red-700 text-sm mt-2 space-y-1">
                      <li>❌ Google Analytics</li>
                      <li>❌ Facebook Pixel</li>
                      <li>❌ Cookies publicitaires</li>
                      <li>❌ Stockage persistant non autorisé</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#f8f7f4] rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6 flex items-center">
                <Clock size={24} className="mr-3 text-[#0a3d3f]" />
                Durée de conservation des données
              </h2>

              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-[#010101] mb-2">
                    Spécificité du projet étudiant
                  </h3>
                  <p className="text-gray-700">
                    En tant que projet pédagogique, toutes les données
                    personnelles seront automatiquement supprimées de nos
                    serveurs à l&apos;issue de la période de formation, soit au
                    maximum
                    <strong> 12 mois après la fin du projet</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Comptes utilisateurs
                    </h4>
                    <p className="text-sm text-gray-700">
                      Durée du projet + 6 mois maximum
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Sessions et cookies
                    </h4>
                    <p className="text-sm text-gray-700">
                      Fin de session navigateur
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Historique commandes
                    </h4>
                    <p className="text-sm text-gray-700">
                      Durée du projet uniquement
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Images uploadées
                    </h4>
                    <p className="text-sm text-gray-700">
                      Suppression immédiate sur demande
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Panier d&apos;achat
                    </h4>
                    <p className="text-sm text-gray-700">
                      Perdu à la fermeture du navigateur
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Favoris</h4>
                    <p className="text-sm text-gray-700">
                      Liés au compte (supprimés avec le compte)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6 flex items-center">
                <UserCheck size={24} className="mr-3 text-[#0a3d3f]" />
                Vos droits selon le RGPD
              </h2>

              <div className="space-y-6">
                <p className="text-gray-700">
                  Conformément au RGPD, vous disposez des droits suivants
                  concernant vos données personnelles :
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-[#010101] mb-3">
                      Droit d&apos;accès
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Connaître quelles données personnelles je détiens sur vous
                      et comment elles sont utilisées.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-[#010101] mb-3">
                      Droit de rectification
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Corriger ou mettre à jour vos données personnelles si
                      elles sont inexactes ou incomplètes.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-[#010101] mb-3">
                      Droit à l&apos;effacement
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Demander la suppression de votre compte et de toutes vos
                      données personnelles.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-[#010101] mb-3">
                      Bientôt : Droit à la portabilité
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Récupérer vos données dans un format structuré et lisible
                      par machine.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-[#010101] mb-3">
                      Droit d&apos;opposition
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Vous opposer au traitement de vos données pour des motifs
                      légitimes.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-[#010101] mb-3">
                      Droit de limitation
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Demander la limitation du traitement de vos données dans
                      certaines circonstances.
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    Comment exercer vos droits ?
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <strong>Par email :</strong> hellogrindcycle@gmail.com
                    </p>
                    <p className="text-gray-700">
                      <strong>Délai de réponse :</strong> 30 jours maximum après
                      réception de votre demande
                    </p>
                    <p className="text-gray-700">
                      <strong>Pièces justificatives :</strong> Une copie de
                      votre pièce d&apos;identité peut être demandée pour
                      vérifier votre identité
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#f8f7f4] rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6 flex items-center">
                <Lock size={24} className="mr-3 text-[#0a3d3f]" />
                Sécurité des données
              </h2>

              <div className="space-y-6">
                <p className="text-gray-700">
                  Je mets en œuvre des mesures techniques et organisationnelles
                  appropriées pour protéger vos données personnelles contre la
                  destruction, la perte, l&apos;altération, la divulgation ou
                  l&apos;accès non autorisés.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="text-lg font-medium text-[#010101] mb-3">
                      Chiffrement des mots de passe
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Tous les mots de passe sont chiffrés avec
                      l&apos;algorithme bcrypt avant stockage. Je ne peux pas
                      voir votre mot de passe en clair.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="text-lg font-medium text-[#010101] mb-3">
                      Connexion HTTPS
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Toutes les communications entre votre navigateur et nos
                      serveurs sont chiffrées via le protocole HTTPS/TLS.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="text-lg font-medium text-[#010101] mb-3">
                      Base de données sécurisée
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Notre base de données est hébergée sur des serveurs
                      sécurisés avec accès restreint et surveillance continue.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="text-lg font-medium text-[#010101] mb-3">
                      Protection CSRF
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Chaque formulaire est protégé contre les attaques CSRF via
                      des tokens sécurisés.
                    </p>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-[#010101] mb-2">
                    En cas de violation de données
                  </h3>
                  <p className="text-gray-700 text-sm">
                    En cas de violation de sécurité susceptible
                    d&lsquo;engendrer un risque élevé pour vos droits et
                    libertés, je vous en informerai dans les 72 heures
                    conformément au RGPD.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6">
                Transferts de données et sous-traitants
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    Sous-traitants
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Hébergement web
                      </h4>
                      <p className="text-sm text-gray-700">
                        <strong>A REMPLIR</strong> (RENSEIGNER PAYS)
                        <br />
                        Hébergement du site web et base de données
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Authentification
                      </h4>
                      <p className="text-sm text-gray-700">
                        <strong>Better Auth</strong> (Bibliothèque)
                        <br />
                        Gestion de l&apos;authentification (traitement local)
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Paiements (fictifs)
                      </h4>
                      <p className="text-sm text-gray-700">
                        <strong>Stripe</strong> (Mode test uniquement)
                        <br />
                        Simulation de paiements (aucune transaction réelle)
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Stockage images
                      </h4>
                      <p className="text-sm text-gray-700">
                        <strong>Supabase</strong>
                        <br />
                        Stockage des images uploadées
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    Garanties de protection
                  </h3>
                  <p className="text-gray-700">
                    Tous nos sous-traitants s&apos;engagent à respecter le RGPD
                    et offrent des garanties appropriées en matière de
                    protection des données personnelles.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#f8f7f4] rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6 flex items-center">
                <Mail size={24} className="mr-3 text-[#0a3d3f]" />
                Contact et réclamations
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    Questions sur vos données
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Pour toute question concernant cette politique de
                    confidentialité ou le traitement de vos données personnelles
                    :
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-700">
                      <strong>Email :</strong> hellogrindcycle@gmail.com
                      <br />
                      <strong>Objet :</strong> &quot;Protection des données -
                      Grindcycle&quot;
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    Réclamation auprès de la CNIL
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Si vous estimez que vos droits ne sont pas respectés, vous
                    avez le droit d&apos;introduire une réclamation auprès de
                    l&apos;autorité de contrôle compétente :
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-700">
                      <strong>
                        CNIL (Commission Nationale de l&apos;Informatique et des
                        Libertés)
                      </strong>
                      <br />
                      3 Place de Fontenoy - TSA 80715
                      <br />
                      75334 PARIS CEDEX 07
                      <br />
                      <strong>Site web :</strong>{' '}
                      <a
                        href="https://www.cnil.fr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0a3d3f] hover:underline"
                      >
                        www.cnil.fr
                      </a>
                      <br />
                      <strong>Téléphone :</strong> 01 53 73 22 22
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h2 className="text-2xl font-medium text-[#010101] mb-6">
                Modifications et informations complémentaires
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    Modifications de cette politique
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Je me réserve le droit de modifier cette politique de
                    confidentialité à tout moment. Les modifications seront
                    publiées sur cette page avec la date de mise à jour.
                  </p>
                  <p className="text-gray-700">
                    En cas de modification substantielle affectant vos droits,
                    je vous en informerai par email ou via une notification sur
                    le site web au moins 30 jours avant l&apos;entrée en
                    vigueur.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    Cadre légal de référence
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Cette politique de confidentialité est établie en conformité
                    avec :
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>
                      Le Règlement Général sur la Protection des Données (RGPD)
                      - UE 2016/679
                    </li>
                    <li>La Loi Informatique et Libertés modifiée</li>
                    <li>Le Code de la consommation français</li>
                    <li>La directive ePrivacy 2002/58/CE</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    Spécificités du projet pédagogique
                  </h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm">
                      <strong>Rappel important :</strong> Ce site web est
                      réalisé dans un contexte pédagogique. Bien que je respecte
                      scrupuleusement les règles de protection des données,
                      aucune activité commerciale réelle n&apos;est exercée.
                      Toutes les transactions sont fictives et aucun paiement
                      réel n&apos;est effectué.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#010101] mb-3">
                    Langue et interprétation
                  </h3>
                  <p className="text-gray-700">
                    Cette politique de confidentialité est rédigée en français.
                    En cas de traduction dans une autre langue, la version
                    française prévaudra en cas de divergence
                    d&apos;interprétation.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">
                <strong>Dernière mise à jour :</strong> 07/09/2025
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Version 1.0 - Cette politique peut être mise à jour
                régulièrement
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="/mentions-legales"
                  className="text-[#0a3d3f] hover:underline text-sm font-medium"
                >
                  Consulter les mentions légales
                </a>
                <span className="hidden sm:inline text-gray-400">•</span>
                <a
                  href="mailto:[votre-email@example.com]?subject=Question sur la politique de confidentialité"
                  className="text-[#0a3d3f] hover:underline text-sm font-medium"
                >
                  Me contacter
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
