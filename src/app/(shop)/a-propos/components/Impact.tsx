import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const Impact = () => (
  <section className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <h2 className="text-3xl font-normal mb-16">Notre Impact</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
        <div>
          <p className="text-4xl font-normal mb-2 text-[#0a3d3f]">500+</p>
          <p className="text-lg text-gray-600">Planches recyclées</p>
        </div>
        <div>
          <p className="text-4xl font-normal mb-2 text-[#0a3d3f]">2 tonnes</p>
          <p className="text-lg text-gray-600">Déchets évités</p>
        </div>
        <div>
          <p className="text-4xl font-normal mb-2 text-[#0a3d3f]">100%</p>
          <p className="text-lg text-gray-600">Matériaux réutilisés</p>
        </div>
      </div>
      <div>
        <p className="text-lg text-gray-600 max-w-3xl mb-8">
          Chaque planche recyclée représente environ 4kg de déchets évités. En
          choisissant Grindcycle, tu contribues directement à réduire
          l&apos;empreinte écologique du skateboard.
        </p>
        <Link href="/catalogue" className="inline-flex items-center group">
          <span className="border-b border-black pb-1 group-hover:border-[#0a3d3f] transition-colors">
            Découvrir nos produits
          </span>
          <ArrowRight
            size={16}
            className="ml-2 transform group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>
    </div>
  </section>
);
