import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-2xl">
        <div className="flex justify-center mb-8"></div>
        <h1 className="text-4xl md:text-6xl font-normal text-[#010101] mb-6">
          Oups, tu as roulé beaucoup trop loin.
        </h1>
        <p className="text-gray-600 text-lg mb-10">
          Cette page n&apos;existe pas.
        </p>
        <Link
          href="/"
          className="inline-flex items-center bg-[#0a3d3f] text-white px-6 py-3 rounded-full hover:bg-[#0a4d4f] transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
