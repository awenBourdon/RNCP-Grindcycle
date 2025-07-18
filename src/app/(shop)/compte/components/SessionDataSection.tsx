import { Database } from "lucide-react"

interface SessionDataSectionProps {
  session: any
}

export const SessionDataSection = ({ session }: SessionDataSectionProps) => {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm">
      <div className="flex items-center mb-8">
        <Database size={24} className="text-[#0a3d3f] mr-3" />
        <h2 className="text-2xl font-normal text-[#010101]">Données de session</h2>
      </div>
      <div className="bg-[#f8f7f4] rounded-lg p-6">
        <pre className="text-sm overflow-auto text-[#010101] whitespace-pre-wrap">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  )
}
