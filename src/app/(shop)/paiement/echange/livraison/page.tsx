import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ExchangePointsShipping } from '../../components/ExchangePointsShipping';

export default async function ExchangePointsShippingPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    redirect('/authentification/connexion');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { points: true },
  });

  const userPoints = user?.points || 0;

  return (
    <ExchangePointsShipping userPoints={userPoints} isAuthenticated={true} />
  );
}
