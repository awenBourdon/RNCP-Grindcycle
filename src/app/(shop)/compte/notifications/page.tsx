import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserNotifications } from '../components/UserNotifications';
import { Session } from '@/lib/types';

export default async function NotificationsPage() {
  const headersList = await headers();
  const session = (await auth.api.getSession({
    headers: headersList,
  })) as Session | null;

  if (!session) redirect('/authentification/connexion');

  return <UserNotifications userId={session.user.id} />;
}
