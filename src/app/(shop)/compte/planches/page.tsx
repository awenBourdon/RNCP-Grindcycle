import { auth } from '@/lib/utils/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Session } from '@/lib/utils/types/types';
import { UsedBoardsList } from '../components/UsedBoardsList';

export default async function UsedBoardsPage() {
  const headersList = await headers();
  const session = (await auth.api.getSession({
    headers: headersList,
  })) as Session | null;

  if (!session) redirect('/authentification/connexion');

  return <UsedBoardsList userId={session.user.id} />;
}
