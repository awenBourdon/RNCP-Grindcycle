import { User } from "lucide-react"
import { UpdateUserForm } from "../UpdateUserForm"

interface ProfileSectionProps {
  name: string
}

export const ProfileSection = ({ name }: ProfileSectionProps) => {
  return (
    <div className="bg-[#f8f7f4] rounded-xl p-8">
      <div className="flex items-center mb-8">
        <User size={24} className="text-[#0a3d3f] mr-3" />
        <h2 className="text-2xl font-normal text-[#010101]">Informations personnelles</h2>
      </div>
      <div className="max-w-md">
        <UpdateUserForm name={name} />
      </div>
    </div>
  )
}
