import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { DashboardStats } from '../components/DashboardStats';
import { getAdminNotifications } from '@/lib/server/services/notificationsService';

export default async function DashboardPage() {
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/authentification/connexion');
  }

  const [users, usedBoards, products, adminNotifications] = await Promise.all([
    prisma.user.findMany(),
    prisma.usedBoard.findMany(),
    prisma.product.findMany(),
    getAdminNotifications(),
  ]);

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
    unreadNotifications: adminNotifications.filter(notif => !notif.isRead)
      .length,
  };

  return <DashboardStats stats={stats} />;
}
