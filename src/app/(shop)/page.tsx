import { AboutUs } from '@/app/(shop)/components/AboutUs'
import { Concept } from '@/app/(shop)/components/Concept'
import { ContactUs } from '@/app/(shop)/components/ContactUs'
import { Hero } from '@/app/(shop)/components/Hero'
import { JoinMovement } from '@/app/(shop)/components/JoinMouvement'
import { NewProducts } from '@/app/(shop)/components/NewProducts'
import { ToTop } from '@/components/ui/ToTop'

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Concept />
      <NewProducts />
      <AboutUs />
      <ContactUs />
      <JoinMovement />
      <ToTop />
    </div>
  )
}
