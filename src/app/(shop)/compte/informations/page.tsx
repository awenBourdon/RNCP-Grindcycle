import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Session } from '@/lib/types'
import { InfoSection } from '../components/InfoSection'

export default async function InformationsPage() {
  const headersList = await headers()
  const session = (await auth.api.getSession({
    headers: headersList,
  })) as Session | null

  if (!session) redirect('/authentification/connexion')

  return <InfoSection session={session} />
}
