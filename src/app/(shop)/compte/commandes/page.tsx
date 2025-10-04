import { auth } from '@/lib/utils/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserOrdersList } from '../components/UserOrdersList';

export default async function UserOrdersPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) redirect('/authentification/connexion');

  return <UserOrdersList userId={session.user.id} />;
}
