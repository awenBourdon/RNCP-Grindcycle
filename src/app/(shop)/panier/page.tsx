import { auth } from '@/lib/utils/auth';
import { headers } from 'next/headers';
import { CartPageClient } from './components/CartPageClient';

export default async function CartPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  let userPoints = 0;
  let isAuthenticated = false;

  if (session) {
    isAuthenticated = true;

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    try {
      const response = await fetch(
        `${baseUrl}/api/users?id=${session.user.id}`,
        {
          headers: {
            ...Object.fromEntries(headersList.entries()),
          },
          cache: 'default',
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          userPoints = data.data.points || 0;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des points:', error);
    }
  }

  return (
    <CartPageClient userPoints={userPoints} isAuthenticated={isAuthenticated} />
  );
}
