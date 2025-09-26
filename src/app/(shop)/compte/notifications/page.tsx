import { auth } from '@/lib/utils/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserNotifications } from '../components/UserNotifications';
import { Session } from '@/lib/utils/types/types';

export default async function NotificationsPage() {
  const headersList = await headers();
  const session = (await auth.api.getSession({
    headers: headersList,
  })) as Session | null;

  if (!session) redirect('/authentification/connexion');

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  try {
    const response = await fetch(
      `${baseUrl}/api/notifications?userId=${session.user.id}`,
      {
        headers: {
          ...Object.fromEntries(headersList.entries()),
        },
        cache: 'default',
      }
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des notifications');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Erreur inconnue');
    }

    const notifications = data.data;

    return (
      <UserNotifications
        notifications={notifications}
        userId={session.user.id}
      />
    );
  } catch (error) {
    console.error('Erreur SSR notifications utilisateur:', error);
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">
          Erreur lors du chargement des notifications
        </p>
        <p className="text-sm text-gray-500 mt-2">Actualise la page</p>
      </div>
    );
  }
}
