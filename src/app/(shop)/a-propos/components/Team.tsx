import Image from 'next/image'

export const Team = () => (
  <section className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <h2 className="text-3xl font-normal mb-16">Notre Équipe</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="relative aspect-square mb-4 overflow-hidden rounded-xl">
            <Image
              src="/placeholder.webp"
              alt="Alex Dupont"
              width={400}
              height={400}
              className="object-cover"
            />
          </div>
          <h3 className="text-lg font-medium">Alex Dupont</h3>
          <p className="text-gray-600">Fondateur</p>
        </div>
        <div>
          <div className="relative aspect-square mb-4 overflow-hidden rounded-xl">
            <Image
              src="/placeholder.webp"
              alt="Marie Leroy"
              width={400}
              height={400}
              className="object-cover"
            />
          </div>
          <h3 className="text-lg font-medium">Marie Leroy</h3>
          <p className="text-gray-600">Designer</p>
        </div>
        <div>
          <div className="relative aspect-square mb-4 overflow-hidden rounded-xl">
            <Image
              src="/placeholder.webp"
              alt="Thomas Martin"
              width={400}
              height={400}
              className="object-cover"
            />
          </div>
          <h3 className="text-lg font-medium">Thomas Martin</h3>
          <p className="text-gray-600">Artisan</p>
        </div>
        <div>
          <div className="relative aspect-square mb-4 overflow-hidden rounded-xl">
            <Image
              src="/placeholder.webp"
              alt="Julie Moreau"
              width={400}
              height={400}
              className="object-cover"
            />
          </div>
          <h3 className="text-lg font-medium">Julie Moreau</h3>
          <p className="text-gray-600">Responsable Collecte</p>
        </div>
      </div>
    </div>
  </section>
)
