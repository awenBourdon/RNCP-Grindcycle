import { ReturnButton } from '@/components/ui/ReturnButton';
import { AuthContainer } from '../components/AuthContainer';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-40">
        <div className="mb-12">
          <ReturnButton href="/" label="Accueil" />
        </div>
        <AuthContainer />
      </div>
    </div>
  );
}
