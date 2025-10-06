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

  return <PointsHistoryComponent userId={session.user.id} />;
}
