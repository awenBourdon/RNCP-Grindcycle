import { headers } from 'next/headers'
import { ToTop } from '../../homeComponents/ToTop'
import { RecycleForm } from './components/RecycleForm'
import { FormSteps } from './components/FormSteps'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function RecyclePage() {
  const headersList = await headers()

  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session) redirect('/recycler-planche/redirect')

  return (
    <div className="min-h-screen">
      <div className="pt-40 pb-16 px-6 text-center bg-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-normal text-[#010101]">
            Recycler ma planche
          </h1>
        </div>
      </div>
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pb-16">
        <RecycleForm userId={session.user.id} />
        <div className="mt-16">
          <FormSteps />
        </div>
        <ToTop />
      </div>
    </div>
  )
}
