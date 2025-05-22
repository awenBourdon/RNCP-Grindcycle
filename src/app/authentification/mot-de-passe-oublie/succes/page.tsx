import ReturnButton from "@/components/ui/ReturnButton";


export default function SuccessPage() {
  return (
    <div className="px-8 py-40 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-4">
        <ReturnButton href="/authentification/connexio" label="Se connecter" />

        <h1 className="text-3xl font-bold">C&apos;est tout bon !</h1>

        <p className="text-muted-foreground">
        Le lien de réinitialisation t’a été envoyé. Va jeter un œil à ta boîte mail.
        </p>
      </div>
    </div>
  );
}