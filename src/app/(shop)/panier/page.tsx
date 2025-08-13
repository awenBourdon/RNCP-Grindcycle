import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { CartPageClient } from './components/CartPageClient';

export default async function CartPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  let userPoints = 0;
  let isAuthenticated = false;

  if (session) {
    isAuthenticated = true;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { points: true },
    });

    userPoints = user?.points || 0;
  }

  return (
    <CartPageClient userPoints={userPoints} isAuthenticated={isAuthenticated} />
  );
}
