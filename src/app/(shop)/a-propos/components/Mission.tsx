import Image from 'next/image'

export const Mission = () => (
  <section className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl font-normal mb-16">Notre Mission</h2>
          <p className="text-lg text-gray-600 mb-6">
            Chez GRINDCYCLE, nous sommes passionnés par le skateboard et
            déterminés à réduire son impact environnemental.
          </p>
          <p className="text-lg text-gray-600 mb-6">
            Notre mission est simple : donner une seconde vie aux planches usées
            en les transformant en nouvelles créations uniques et durables.
          </p>
          <p className="text-lg text-gray-600">
            Fondée en 2025 par un groupe de skateurs engagés, notre entreprise
            s&apos;est développée autour d&apos;une vision commune : allier
            passion et responsabilité environnementale.
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-500">
          <Image
            src="/placeholder.svg?height=800&width=600"
            alt="Atelier GRINDCYCLE"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  </section>
)
