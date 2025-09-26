import { auth } from '@/lib/utils/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Session } from '@/lib/utils/types/types';
import { PointsHistoryComponent } from '../components/PointsHistory';

export default async function PointsPage() {
  const headersList = await headers();
  const session = (await auth.api.getSession({
    headers: headersList,
  })) as Session | null;

  if (!session) redirect('/authentification/connexion');

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  try {
    const pointsResponse = await fetch(
      `${baseUrl}/api/pointshistory?userId=${session.user.id}`,
      {
        headers: {
          ...Object.fromEntries(headersList.entries()),
        },
        cache: 'default',
      }
    );

    if (!pointsResponse.ok) {
      throw new Error(
        "Erreur lors de la récupération de l'historique des points"
      );
    }

    const pointsData = await pointsResponse.json();

    if (!pointsData.success) {
      throw new Error(pointsData.error || 'Erreur inconnue');
    }

    const userResponse = await fetch(
      `${baseUrl}/api/users?id=${session.user.id}`,
      {
        headers: {
          ...Object.fromEntries(headersList.entries()),
        },
        cache: 'default',
      }
    );

    if (!userResponse.ok) {
      throw new Error(
        'Erreur lors de la récupération des informations utilisateur'
      );
    }

    const userData = await userResponse.json();

    if (!userData.success) {
      throw new Error(userData.error || 'Erreur inconnue');
    }

    const currentPoints = userData.data.points || 0;
    const pointsHistory = pointsData.data || [];

    return (
      <PointsHistoryComponent
        pointsHistory={pointsHistory}
        currentPoints={currentPoints}
      />
    );
  } catch (error) {
    console.error('Erreur SSR points history:', error);
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">
          Erreur lors du chargement de l&apos;historique des points
        </p>
        <p className="text-sm text-gray-500 mt-2">Actualise la page</p>
      </div>
    );
  }
}
