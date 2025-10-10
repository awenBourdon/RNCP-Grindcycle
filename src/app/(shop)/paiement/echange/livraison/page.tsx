import { headers } from 'next/headers';
import { auth } from '@/lib/utils/auth';
import { redirect } from 'next/navigation';
import { ExchangePointsShipping } from '../../components/ExchangePointsShipping';

export default async function ExchangePointsShippingPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    redirect('/authentification/connexion');
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

  let userPoints = 0;

  try {
    const response = await fetch(`${baseUrl}/api/users?id=${session.user.id}`, {
      headers: {
        ...Object.fromEntries(headersList.entries()),
      },
      cache: 'default',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        userPoints = data.data.points || 0;
      }
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des points:', error);
  }

  return (
    <ExchangePointsShipping userPoints={userPoints} isAuthenticated={true} />
  );
}
