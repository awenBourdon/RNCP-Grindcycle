import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { AddProductForm } from '../components/AddProductForm';

export default async function AjouterProduitPage() {
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/authentification/connexion');
  }

  const usedBoards = await prisma.usedBoard.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return <AddProductForm usedBoards={usedBoards} />;
}
