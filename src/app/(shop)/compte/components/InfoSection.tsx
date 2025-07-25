import { Session } from '@/lib/types';
import { Settings } from 'lucide-react';

interface InfoSectionProps {
  session: Session;
}

export const InfoSection = ({ session }: InfoSectionProps) => {
  return (
    <div className="bg-[#f8f7f4] rounded-xl p-8">
      <div className="flex items-center mb-8">
        <Settings size={24} className="text-[#0a3d3f] mr-3" />
        <h2 className="text-2xl font-normal text-[#010101]">
          Informations du compte
        </h2>
      </div>
      <div className="space-y-6">
        <div className="flex justify-between items-center py-4 border-b border-gray-200">
          <span className="text-gray-600 font-medium">Rôle</span>
          <span className="text-[#010101] font-medium">
            {session.user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
          </span>
        </div>
        <div className="flex justify-between items-center py-4 border-b border-gray-200">
          <span className="text-gray-600 font-medium">Membre depuis</span>
          <span className="text-[#010101] font-medium">
            {new Date(session.user.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <div className="flex justify-between items-center py-4">
          <span className="text-gray-600 font-medium">Email</span>
          <span className="text-[#010101] font-medium">
            {session.user.email}
          </span>
        </div>
      </div>
    </div>
  );
};
