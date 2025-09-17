import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserOrdersList } from '../components/UserOrdersList';

export default async function UserOrdersPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) redirect('/authentification/connexion');

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/orders`, {
      headers: {
        ...Object.fromEntries(headersList.entries()),
      },
      cache: 'default',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des commandes');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Erreur inconnue');
    }

    return <UserOrdersList orders={data.data} />;
  } catch (error) {
    console.error('Erreur SSR commandes utilisateur:', error);
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">
          Erreur lors du chargement de tes commandes
        </p>
        <p className="text-sm text-gray-500 mt-2">Actualise la page</p>
      </div>
    );
  }
}
