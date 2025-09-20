import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { AdminNotifications } from '../components/AdminNotifications';

export default async function AdminNotificationsPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/authentification/connexion');
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/notifications?type=admin`, {
      headers: {
        ...Object.fromEntries(headersList.entries()),
      },
      cache: 'default',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des notifications');
    }

    const data = await response.json();
    const adminNotifications = data.success ? data.data : [];

    return <AdminNotifications notifications={adminNotifications} />;
  } catch (error) {
    console.error(error);
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">
          Erreur lors du chargement des notifications
        </p>
      </div>
    );
  }
}
