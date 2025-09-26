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

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  try {
    const response = await fetch(
      `${baseUrl}/api/usedboards?userId=${session.user.id}`,
      {
        headers: {
          ...Object.fromEntries(headersList.entries()),
        },
        cache: 'default',
      }
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des planches');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Erreur inconnue');
    }

    return <UsedBoardsList usedBoards={data.data} />;
  } catch (error) {
    console.error(error);
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">
          Erreur lors du chargement de tes planches
        </p>
        <p className="text-sm text-gray-500 mt-2">Actualise la page</p>
      </div>
    );
  }
}
