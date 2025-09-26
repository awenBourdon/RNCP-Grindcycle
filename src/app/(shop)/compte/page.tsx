import { redirect } from 'next/navigation';
import { auth } from '@/lib/utils/auth';
import { headers } from 'next/headers';

export default async function ProfilePage() {
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    redirect('/authentification/connexion');
  }

  redirect('/compte/profil');
}
