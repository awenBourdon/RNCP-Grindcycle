import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[#f8f7f4] text-[#010101] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col">
            <h4 className="mb-4 font-bold text-xl uppercase border-b border-black/30 pb-2">Plan du site</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/catalogue" className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all">
                  Catalogue
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/panier" className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all">
                  Panier
                </Link>
              </li>
              <li>
                <Link href="/compte" className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all">
                  Compte
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="mb-4 font-bold text-xl uppercase border-b border-black/30 pb-2">Juridique</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/mentions-legales" className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/donnees-personnelles" className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all">
                  Données personnelles
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all">
                  Gestion des cookies
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="mb-4 font-bold text-xl uppercase border-b border-black/30 pb-2">Réseaux sociaux</h4>
            <ul className="space-y-3">
              <li>
                <Link href="https://linkedin.com" className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all">
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link href="https://instagram.com" className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all">
                  Instagram
                </Link>
              </li>
              <li>
                <Link href="https://facebook.com" className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all">
                  Facebook
                </Link>
              </li>
              <li>
                <Link href="https://x.com" className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all">
                  X
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="mb-4 font-bold text-xl uppercase border-b border-black/30 pb-2">Nous contacter</h4>
            <ul className="space-y-3">
              <li className="text-gray-600">contact@grindcycle.com</li>
              <li className="text-gray-600">02 40 41 42 43</li>
              <li className="text-gray-600">9h - 18h</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-black/30 mt-12 pt-6 text-sm text-center text-gray-600">
          © {new Date().getFullYear()} GRINDCYCLE. Tous droits réservés.
        </div>

        <div className="w-full mt-8 text-center">
          <h1 className="text-[10vw] md:text-[8vw] font-bold tracking-tight uppercase leading-none text-[#010101]">
            GRINDCYCLE
          </h1>
        </div>
      </div>
    </footer>
  )
}

export default Footer