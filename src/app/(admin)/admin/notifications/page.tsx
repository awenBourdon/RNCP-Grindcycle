import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getAdminNotifications } from '@/lib/server/services/notificationsService'
import { AdminNotifications } from '../components/AdminNotifications'

export default async function AdminNotificationsPage() {
  const headersList = await headers()

  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/authentification/connexion')
  }

  const adminNotifications = await getAdminNotifications()

  return <AdminNotifications notifications={adminNotifications} />
}
