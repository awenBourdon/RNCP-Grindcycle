import { auth } from "@/lib/auth"
import ReturnButton from "../../../components/ui/ReturnButton"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PlaceholderDeleteUserButton, DeleteUserButton } from "./components/DeleteUserButton"
import { UserRoleSelect } from "./components/UserRoleSelect"
import { UserRole } from "@/generated/prisma"

const Page = async () => {
  const headersList = await headers()

  const session = await auth.api.getSession({
      headers: headersList
  })

    if (!session || session.user.role !== "ADMIN" ) redirect("/authentification/connexion")  // A remplacer par page 404 quand elle sera faite

    const users = await prisma.user.findMany({
      orderBy: {
        name: "asc",
      },
    });

    const sortedUsers = users.sort((a, b) => {
      if (a.role === "ADMIN" && b.role !== "ADMIN") return -1;
      if (a.role !== "ADMIN" && b.role === "ADMIN") return 1;
      return 0;
    });

  return (
    <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-8">
        <ReturnButton href="/compte" label="compte"/>

        <h1 className="text-3xl font bold">Accéder au dashboard</h1>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="table-auto min-w-full whitespace-nowrap">
          <thead>
              <tr className="border-b text-sm text-left">
                <th className="px-2 py-2">Id</th>
                <th className="px-2 py-2">Nom d&apos;utilisateur</th>
                <th className="px-2 py-2">Adresse email</th>
                <th className="px-2 py-2 text-center">Rôle</th>
                <th className="px-2 py-2 text-center">Actions</th>
              </tr>
          </thead>

          <tbody>
              {sortedUsers.map((user) => (
                <tr key={user.id} className="border-b text-sm text-left">
                  <td className="px-4 py-2">{user.id.slice(0,8)}</td>
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2 text-center"> <UserRoleSelect
                    userId={user.id}
                    role={user.role as UserRole}
                  /></td>
                  <td className="px-4 py-2 text-center">
                    {user.role==="ADMIN" || user.id === session.user.id ? 
                    <PlaceholderDeleteUserButton/>
                       :
                    <DeleteUserButton
                    userId={user.id}
                    />}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
 
export default Page
