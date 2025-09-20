import { notFound } from 'next/navigation';
import { ProductDisplay } from './components/ProductDisplay';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/products?id=${id}`, {
      cache: 'default',
    });

    if (response.status === 404) {
      notFound();
    }

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du produit');
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      notFound();
    }

    const product = data.data;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-32">
        <ProductDisplay product={product} />
      </div>
    );
  } catch (error) {
    console.error('Erreur SSR produit:', error);

    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">
            Erreur lors du chargement du produit
          </p>
          <p className="text-sm text-gray-500">Actualise la page</p>
        </div>
      </div>
    );
  }
}
