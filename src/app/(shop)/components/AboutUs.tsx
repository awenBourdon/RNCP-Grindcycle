export const AboutUs = () => {
  return (
    <section className="py-24 bg-[#f8f7f4] text-[#010101]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-normal mb-16">Notre mission</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <p className="text-2xl font-light leading-relaxed">
              Chez Grindcycle, nous croyons que chaque planche mérite une
              seconde chance. Notre mission est de réduire les déchets et de
              promouvoir un mode de vie durable dans la communauté du
              skateboard.
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-normal mb-2">
                Réduction des déchets
              </h3>
              <p className="text-gray-600">
                Nous avons déjà sauvé plus de 500 planches de la décharge,
                contribuant à réduire significativement les déchets dans
                l&apos;industrie du skateboard.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-normal mb-2">
                Qualité professionnelle
              </h3>
              <p className="text-gray-600">
                Chaque planche est restaurée par des experts passionnés qui
                apportent un soin particulier à chaque détail pour garantir
                performance et durabilité.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-normal mb-2">Communauté engagée</h3>
              <p className="text-gray-600">
                Rejoins des milliers de skateurs qui roulent de façon
                responsable et participent activement à la préservation de notre
                environnement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
