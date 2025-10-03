import { auth } from '@/lib/utils/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { FavoritesList } from '../components/FavoritesList';

export default async function FavorisPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) redirect('/authentification/connexion');

  return <FavoritesList />;
}
