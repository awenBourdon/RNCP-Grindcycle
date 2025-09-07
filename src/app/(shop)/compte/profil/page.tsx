import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Session } from '@/lib/types';
import { UpdateUserForm } from '../components/UpdateUserForm';

export default async function ProfilPage() {
  const headersList = await headers();
  const session = (await auth.api.getSession({
    headers: headersList,
  })) as Session | null;

  if (!session) redirect('/authentification/connexion');

  return (
    <div className="space-y-8">
      <UpdateUserForm
        name={session.user.name || ''}
        email={session.user.email}
      />
    </div>
  );
}
