import { GetStartedButton } from "@/components/ui/GetStartedButton"

const Page = () => {
  return (
    <div className="flex items-center justify-center h-dvh">
      <div className="flex justify-center gap-6 flex-col items-center">
          <h1 className="text-6xl font-bod">Hello</h1>

          <GetStartedButton/>
      </div>
    </div>
  )
}

export default Page
