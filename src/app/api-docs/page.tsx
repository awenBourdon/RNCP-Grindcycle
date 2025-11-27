import { auth } from '@/lib/utils/auth';
import { UserRole } from '@/lib/utils/enums/enums';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import ApiDocs from './ApiDocs';

export default async function ApiDocsPage() {
  const headerList = await headers();
  const session = await auth.api.getSession({
    headers: new Headers(Object.fromEntries(headerList.entries())),
  });

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect('/authentification/connexion');
  }

  return <ApiDocs />;
}
