import { redirect } from 'next/navigation';
import { auth } from '@/lib/utils/auth';
import { headers } from 'next/headers';
import { UsersTable } from '../components/UsersTable';

export default async function UsersPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/authentification/connexion');
  }

  return <UsersTable />;
}
