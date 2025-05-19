import LoginForm from "../components/LoginForm";
import ReturnButton from "../../../components/ui/ReturnButton";
import Link from "next/link";
import { SignInOauthButton } from "../components/SignInOauthButton";

const LoginPage = async () => {

  return (
    <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-8">
        <ReturnButton href="/" label="Accueil"/>
        <h1 className="text-3xl font bold">Se connecter</h1>
      </div>

      <div className="space-y-4">
        <LoginForm/>

      <p className="text-muted-foreground text-sm">
        Tu n&apos;as pas de compte ?{" "}
        <Link href="/authentification/inscription">
        S&apos;inscrire
        </Link>
      </p>
      </div>

      <hr className="max-w-sm" />

      <div className="flex flex-col max-w-sm gap-4">
        <SignInOauthButton />
      </div>
    </div>
  )
}
 
export default LoginPage
