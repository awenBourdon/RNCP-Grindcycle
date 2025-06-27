import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative py-12 md:py-20 w-full bg-[#f8f7f4] text-[#010101] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-12 md:py-24">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl md:text-6xl font-normal leading-tight mb-8">
              Roule avec des planches recyclées & durables
            </h1>

            <p className="text-lg text-gray-600 max-w-xl mb-12">
              Découvre nos planches de skate recyclées et offre-leur une seconde
              vie. Roule avec style tout en préservant l&apos;environnement.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link
                href="/catalogue"
                className="px-8 py-3 bg-[#0a3d3f] text-white rounded-full inline-flex items-center group hover:bg-[#0a4d4f] transition-all duration-300"
              >
                <span>Voir nos planches</span>
                <ArrowRight
                  size={16}
                  className="ml-2 transform group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                href="/a-propos"
                className="px-8 py-3 border border-[#0a3d3f] text-[#0a3d3f] rounded-full inline-flex items-center group hover:bg-[#0a3d3f] hover:text-white transition-all duration-300"
              >
                <span>En savoir plus</span>
                <ArrowRight
                  size={16}
                  className="ml-2 transform group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="relative w-full h-[500px] rounded-xl overflow-hidden border-4 border-white shadow-xl">
              <Image
                src="/placeholder.svg?height=800&width=600"
                alt="Skate recyclé"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
