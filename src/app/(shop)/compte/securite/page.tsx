import { auth } from '@/lib/utils/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ChangePasswordForm } from '../components/ChangePasswordForm';
import { Session } from '@/lib/utils/types/types';
import { DeleteAccountModal } from '../components/DeleteAccountModal';

export default async function ChangePasswordPage() {
  const headersList = await headers();
  const session = (await auth.api.getSession({
    headers: headersList,
  })) as Session | null;

  if (!session) redirect('/authentification/connexion');
  return (
    <div className="space-y-8">
      <ChangePasswordForm />
      <DeleteAccountModal userId={session.user.id} />
    </div>
  );
}
