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

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/users?admin=true`, {
      headers: {
        ...Object.fromEntries(headersList.entries()),
      },
      cache: 'default',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des utilisateurs');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Erreur inconnue');
    }

    return <UsersTable users={data.data} />;
  } catch {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">
          Erreur lors du chargement des utilisateurs
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Actualise la page ou contacte l&apos;administrateur
        </p>
      </div>
    );
  }
}
