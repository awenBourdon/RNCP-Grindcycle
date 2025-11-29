import Link from 'next/link';

export const Footer = () => {
  return (
    <footer
      className="bg-[#f8f7f4] text-[#010101] py-12"
      aria-label="Pied de page"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col">
            <h4 className="mb-4 font-bold text-xl uppercase border-b border-black/30 pb-2">
              Plan du site
            </h4>
            <ul className="space-y-3" aria-label="Navigation du plan du site">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogue"
                  className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all"
                >
                  Catalogue
                </Link>
              </li>
              <li>
                <Link
                  href="/a-propos"
                  className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  href="/panier"
                  className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all"
                >
                  Panier
                </Link>
              </li>
              <li>
                <Link
                  href="/compte"
                  className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all"
                >
                  Compte
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="mb-4 font-bold text-xl uppercase border-b border-black/30 pb-2">
              Juridique
            </h4>
            <ul className="space-y-3" aria-label="Navigation juridique">
              <li>
                <Link
                  href="/mentions-legales"
                  className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  href="/politique-confidentialite"
                  className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/conditions-generales-vente"
                  className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all"
                >
                  Conditions générales de vente
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="mb-4 font-bold text-xl uppercase border-b border-black/30 pb-2">
              Réseaux sociaux
            </h4>
            <ul
              className="space-y-3"
              aria-label="Suivez-nous sur les réseaux sociaux"
            >
              <li>
                <Link
                  href="https://linkedin.com"
                  className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all"
                  aria-label="Grindcycle sur LinkedIn"
                >
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link
                  href="https://instagram.com"
                  className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all"
                  aria-label="Grindcycle sur Instagram"
                >
                  Instagram
                </Link>
              </li>
              <li>
                <Link
                  href="https://facebook.com"
                  className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all"
                  aria-label="Grindcycle sur Facebook"
                >
                  Facebook
                </Link>
              </li>
              <li>
                <Link
                  href="https://x.com"
                  className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all"
                  aria-label="Grindcycle sur X (anciennement Twitter)"
                >
                  X
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="mb-4 font-bold text-xl uppercase border-b border-black/30 pb-2">
              Nous contacter
            </h4>
            <ul className="space-y-3">
              <li className="text-gray-600">
                <a
                  href="mailto:hellogrindcycle@gmail.com"
                  aria-label="Envoyer un email à hellogrindcycle@gmail.com"
                >
                  hellogrindcycle@gmail.com
                </a>
              </li>
              <li className="text-gray-600">
                <a
                  href="tel:+33240414243"
                  aria-label="Appeler au 02 40 41 42 43"
                >
                  02 40 41 42 43
                </a>
              </li>
              <li className="text-gray-600" aria-label="Horaires : 9h à 18h">
                9h - 18h
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-black/30 mt-12 pt-6 text-sm text-center text-gray-600">
          © {new Date().getFullYear()} GRINDCYCLE. Tous droits réservés.
        </div>

        <div className="w-full mt-8 text-center">
          <h1
            className="text-[10vw] md:text-[8vw] font-bold tracking-tight uppercase leading-none text-[#010101]"
            aria-label="Grindcycle"
          >
            GRINDCYCLE
          </h1>
        </div>
      </div>
    </footer>
  );
};
