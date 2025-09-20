import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { AddProductForm } from '../components/AddProductForm';

export default async function AjouterProduitPage() {
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/authentification/connexion');
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  try {
    const response = await fetch(
      `${baseUrl}/api/usedboards?available=true&admin=true`,
      {
        headers: {
          ...Object.fromEntries(headersList.entries()),
        },
        cache: 'default',
      }
    );

    const data = await response.json();
    const usedBoards = data.success ? data.data : [];

    return <AddProductForm usedBoards={usedBoards} />;
  } catch {
    return <AddProductForm usedBoards={[]} />;
  }
}
