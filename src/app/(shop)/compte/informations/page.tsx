import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AccountInfoSection } from "../components/sections/AccountInfoSection"

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: Date
}

interface Session {
  user: User
}

export default async function InformationsPage() {
  const headersList = await headers()
  const session = (await auth.api.getSession({
    headers: headersList,
  })) as Session | null

  if (!session) redirect("/authentification/connexion")

  return <AccountInfoSection session={session} />
}
