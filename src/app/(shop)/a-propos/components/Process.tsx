import { Recycle, Axe, Sparkle } from 'lucide-react';

export const Process = () => (
  <section className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <h2 className="text-3xl font-normal mb-16">Notre Processus</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#0a3d3f] text-white rounded-full">
              <Recycle size={24} />
            </div>
            <div>
              <p className="text-xl font-medium mb-3">Collecte</p>
              <p className="text-gray-600">
                Remplit le formulaire d&apos;envoi avec des photos et la
                description de ta planche. Si on valide, on te recontacte par
                email avec un bon d&apos;envoi gratuit.
              </p>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#0a3d3f] text-white rounded-full">
              <Axe size={24} />
            </div>
            <div>
              <p className="text-xl font-medium mb-3">Transformation</p>
              <p className="text-gray-600">
                Chaque planche est soigneusement nettoyée, poncée, taillée et
                préparée pour sa nouvelle vie dans notre atelier.
              </p>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#0a3d3f] text-white rounded-full">
              <Sparkle size={24} />
            </div>
            <div>
              <p className="text-xl font-medium mb-3">Création</p>
              <p className="text-gray-600">
                Notre équipe transforme les transforme ainsi en nouvelles
                planches uniques, prêtes à rider à nouveau.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
