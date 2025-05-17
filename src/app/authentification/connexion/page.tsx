import LoginForm from "../components/LoginForm"
import ReturnButton from "../../../components/ui/ReturnButton"
import Link from "next/link"

const Page = () => {
  return (
    <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-8">
        <ReturnButton href="/" label="Accueil"/>
        <h1 className="text-3xl font bold">Se connecter</h1>
      </div>

      <LoginForm/>

      <p className="text-muted-foreground text-sm">
        Tu n&apos;as pas de compte ?{" "}
        <Link href="/authentification/inscription">
        S&apos;inscrire
        </Link>
      </p>
    </div>
  )
}
 
export default Page
