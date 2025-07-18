import { Shield } from "lucide-react"

interface PermissionsSectionProps {
  fullPostAccess: boolean
}

export const PermissionsSection = ({ fullPostAccess }: PermissionsSectionProps) => {
  return (
    <div className="bg-[#f8f7f4] rounded-xl p-8">
      <div className="flex items-center mb-8">
        <Shield size={24} className="text-[#0a3d3f] mr-3" />
        <h2 className="text-2xl font-normal text-[#010101]">Permissions</h2>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-6 bg-white rounded-lg">
          <span className="text-[#010101] font-medium">Modifier mes posts</span>
          <span className="px-4 py-2 bg-[#0a3d3f] text-white rounded-full text-sm font-medium">Autorisé</span>
        </div>
        <div className="flex items-center justify-between p-6 bg-white rounded-lg">
          <span className="text-[#010101] font-medium">Modifier tous les posts</span>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              fullPostAccess ? "bg-[#0a3d3f] text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            {fullPostAccess ? "Autorisé" : "Refusé"}
          </span>
        </div>
      </div>
    </div>
  )
}
