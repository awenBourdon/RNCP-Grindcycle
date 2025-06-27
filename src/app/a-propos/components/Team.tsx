import Image from 'next/image'

const Team = () => (
  <section className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <h2 className="text-3xl font-normal mb-16">Notre Équipe</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="relative aspect-square mb-4 overflow-hidden rounded-xl bg-gray-500">
            <Image
              src="/placeholder.svg?height=400&width=400"
              alt="Alex Dupont"
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-lg font-medium">Alex Dupont</h3>
          <p className="text-gray-600">Fondateur</p>
        </div>
        <div>
          <div className="relative aspect-square mb-4 overflow-hidden rounded-xl bg-gray-500">
            <Image
              src="/placeholder.svg?height=400&width=400"
              alt="Marie Leroy"
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-lg font-medium">Marie Leroy</h3>
          <p className="text-gray-600">Designer</p>
        </div>
        <div>
          <div className="relative aspect-square mb-4 overflow-hidden rounded-xl bg-gray-500">
            <Image
              src="/placeholder.svg?height=400&width=400"
              alt="Thomas Martin"
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-lg font-medium">Thomas Martin</h3>
          <p className="text-gray-600">Artisan</p>
        </div>
        <div>
          <div className="relative aspect-square mb-4 overflow-hidden rounded-xl bg-gray-500">
            <Image
              src="/placeholder.svg?height=400&width=400"
              alt="Julie Moreau"
              fill
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

export default Team
