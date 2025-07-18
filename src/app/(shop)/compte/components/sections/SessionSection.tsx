import { Database } from "lucide-react"

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: Date
}

interface Session {
  user: User
}

interface SessionSectionProps {
  session: Session
}

export const SessionSection = ({ session }: SessionSectionProps) => {
  return (
    <div className="bg-[#f8f7f4] rounded-xl p-8">
      <div className="flex items-center mb-8">
        <Database size={24} className="text-[#0a3d3f] mr-3" />
        <h2 className="text-2xl font-normal text-[#010101]">Données de session</h2>
      </div>
      <div className="bg-white rounded-lg p-6">
        <pre className="text-sm overflow-auto text-[#010101] whitespace-pre-wrap max-h-96">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  )
}
