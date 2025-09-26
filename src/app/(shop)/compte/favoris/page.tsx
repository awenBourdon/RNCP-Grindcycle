import { auth } from '@/lib/utils/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { BoardType } from '@/generated/prisma';
import { ProductType } from '@/lib/types/types';

const getBoardTypeText = (type: BoardType) => {
  switch (type) {
    case 'SKATE':
      return 'Skateboard';
    case 'CRUISER':
      return 'Cruiser';
    case 'LONG':
      return 'Longboard';
    default:
      return type;
  }
};

export default async function FavorisPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) redirect('/authentification/connexion');

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/favorites`, {
      headers: {
        ...Object.fromEntries(headersList.entries()),
      },
      cache: 'default',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des favoris');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Erreur inconnue');
    }

    const favorites = data.data;

    return (
      <div className="bg-[#f8f7f4] rounded-xl p-8">
        <div className="flex items-center mb-8">
          <Heart size={24} className="text-[#0a3d3f] mr-3" />
          <h2 className="text-2xl font-normal text-[#010101]">Mes favoris</h2>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-[#010101] mb-2">
              Aucun favori
            </h3>
            <p className="text-gray-600 mb-6">
              Tu n&apos;as pas encore ajouté de produits en favoris
            </p>
            <Link href="/catalogue" className="text-[#0a3d3f] hover:underline">
              Découvrir nos planches
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(({ product }: { product: ProductType }) => (
              <Link
                key={product.id}
                href={`/produit/${product.id}`}
                className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-[3/4] relative">
                  <Image
                    src={product.imageUrl[0] || '/placeholder.webp'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {getBoardTypeText(product.type)}
                  </p>
                  <p className="text-[#0a3d3f] font-medium">
                    {product.priceEuro}€
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Erreur SSR favoris:', error);
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Erreur lors du chargement des favoris</p>
        <p className="text-sm text-gray-500 mt-2">Actualise la page</p>
      </div>
    );
  }
}
