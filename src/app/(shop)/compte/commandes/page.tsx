import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserOrdersList } from '../components/UserOrdersList';
import { OrderService } from '@/lib/server/services/orders.service';

export default async function UserOrdersPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) redirect('/authentification/connexion');

  const orderService = new OrderService();
  const orders = await orderService.getUserOrders(session.user.id);

  return <UserOrdersList orders={orders} />;
}
