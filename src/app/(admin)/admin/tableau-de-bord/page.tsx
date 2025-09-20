import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { DashboardStats } from '../components/DashboardStats';
import type { Notification, UsedBoard } from '@/lib/types';
import { Product } from '@/generated/prisma';

export default async function DashboardPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/authentification/connexion');
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const fetchHeaders = {
    ...Object.fromEntries(headersList.entries()),
  };

  try {
    const [
      usersResponse,
      usedBoardsResponse,
      productsResponse,
      notificationsResponse,
    ] = await Promise.all([
      fetch(`${baseUrl}/api/users?admin=true`, {
        headers: fetchHeaders,
        cache: 'default',
      }),
      fetch(`${baseUrl}/api/usedboards?admin=true`, {
        headers: fetchHeaders,
        cache: 'default',
      }),
      fetch(`${baseUrl}/api/products?admin=true`, {
        headers: fetchHeaders,
        cache: 'default',
      }),
      fetch(`${baseUrl}/api/notifications?type=admin`, {
        headers: fetchHeaders,
        cache: 'default',
      }),
    ]);

    if (
      !usersResponse.ok ||
      !usedBoardsResponse.ok ||
      !productsResponse.ok ||
      !notificationsResponse.ok
    ) {
      throw new Error('Erreur lors de la récupération des données');
    }

    const [usersData, usedBoardsData, productsData, notificationsData] =
      await Promise.all([
        usersResponse.json(),
        usedBoardsResponse.json(),
        productsResponse.json(),
        notificationsResponse.json(),
      ]);

    if (
      !usersData.success ||
      !usedBoardsData.success ||
      !productsData.success ||
      !notificationsData.success
    ) {
      throw new Error('Erreur dans les réponses API');
    }

    const users = usersData.data;
    const usedBoards = usedBoardsData.data;
    const products = productsData.data;
    const adminNotifications = notificationsData.data;

    const stats = {
      totalUsers: users.length,
      totalBoards: usedBoards.length,
      pendingBoards: usedBoards.filter(
        (board: UsedBoard) => board.status === 'PENDING_VALIDATION'
      ).length,
      receivedBoards: usedBoards.filter(
        (board: UsedBoard) => board.status === 'RECEIVED'
      ).length,
      totalProducts: products.length,
      catalogProducts: products.filter(
        (product: Product) => product.status === 'CATALOG'
      ).length,
      purchasedProducts: products.filter(
        (product: Product) => product.status === 'SOLD'
      ).length,
      unreadNotifications: adminNotifications.filter(
        (notif: Notification) => !notif.isRead
      ).length,
    };

    return <DashboardStats stats={stats} />;
  } catch {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Erreur lors du chargement du dashboard</p>
        <p className="text-sm text-gray-500 mt-2">
          Actualise la page ou contacte l&apos;administrateur
        </p>
      </div>
    );
  }
}
