import { Key } from "lucide-react"
import { ChangePasswordForm } from "../ChangePasswordForm"

export const SecuritySection = () => {
  return (
    <div className="bg-[#f8f7f4] rounded-xl p-8">
      <div className="flex items-center mb-8">
        <Key size={24} className="text-[#0a3d3f] mr-3" />
        <h2 className="text-2xl font-normal text-[#010101]">Sécurité</h2>
      </div>
      <div className="max-w-md">
        <ChangePasswordForm />
      </div>
    </div>
  )
}
