import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { ProductsTable } from '../components/ProductsTable';

export default async function ProductsPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/authentification/connexion');
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/products?admin=true`, {
      headers: {
        ...Object.fromEntries(headersList.entries()),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des produits');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Erreur inconnue');
    }

    return <ProductsTable products={data.data} />;
  } catch {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Erreur lors du chargement des produits</p>
        <p className="text-sm text-gray-500 mt-2">
          Actualise la page ou contacte l&apos;administrateur
        </p>
      </div>
    );
  }
}
