import { User } from "lucide-react"
import { UpdateUserForm } from "./UpdateUserForm"

interface PersonalInfoSectionProps {
  name: string
}

export const PersonalInfoSection = ({ name }: PersonalInfoSectionProps) => {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm">
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
