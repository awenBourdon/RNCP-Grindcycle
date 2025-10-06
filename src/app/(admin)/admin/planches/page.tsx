import { redirect } from 'next/navigation';
import { auth } from '@/lib/utils/auth';
import { headers } from 'next/headers';
import { UsedBoardsTable } from '../components/UsedBoardsTable';

export default async function UsedBoardsPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/authentification/connexion');
  }

  return <UsedBoardsTable />;
}
