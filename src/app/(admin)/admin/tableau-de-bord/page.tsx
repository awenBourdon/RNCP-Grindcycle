import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { DashboardStats } from '../components/DashboardStats';
import type { Notification } from '@/lib/types';

export default async function DashboardPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/authentification/connexion');
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  const [users, usedBoards, products, notificationsResponse] =
    await Promise.all([
      prisma.user.findMany(),
      prisma.usedBoard.findMany(),
      prisma.product.findMany(),
      fetch(`${baseUrl}/api/notifications?type=admin`, {
        headers: {
          ...Object.fromEntries(headersList.entries()),
        },
        cache: 'no-store',
      }),
    ]);

  let adminNotifications = [];
  try {
    const notifData = await notificationsResponse.json();
    adminNotifications = notifData.success ? notifData.data : [];
  } catch (error) {
    console.error(error);
  }

  const stats = {
    totalUsers: users.length,
    totalBoards: usedBoards.length,
    pendingBoards: usedBoards.filter(
      board => board.status === 'PENDING_VALIDATION'
    ).length,
    receivedBoards: usedBoards.filter(board => board.status === 'RECEIVED')
      .length,
    totalProducts: products.length,
    catalogProducts: products.filter(product => product.status === 'CATALOG')
      .length,
    purchasedProducts: products.filter(product => product.status === 'SOLD')
      .length,
    unreadNotifications: adminNotifications.filter(
      (notif: Notification) => !notif.isRead
    ).length,
  };

  return <DashboardStats stats={stats} />;
}
