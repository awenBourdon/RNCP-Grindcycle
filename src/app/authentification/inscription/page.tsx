import Link from "next/link";
import ReturnButton from "@/components/ui/ReturnButton";
import RegisterForm from "../components/RegisterForm";
import { SignInOauthButton } from "../components/SignInOauthButton";

const RegisterPage = async () => {

  return (
    <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-8">
      <ReturnButton href="/" label="Accueil"/>
        <h1 className="text-3xl font bold">S&apos;inscrire</h1>
      </div>

      <div className="space-y-4">
      <RegisterForm/>

      <p className="text-muted-foreground text-sm">
        Tu as déjà un compte ?{" "}
        <Link href="/authentification/connexion">
         Se connecter
         </Link>
      </p>

      </div>

        <hr className="max-w-sm" />
    
        <div className="flex flex-col max-w-sm gap-4">
          <SignInOauthButton signUp/>
        </div>
      </div>
  )
}

export default RegisterPage
