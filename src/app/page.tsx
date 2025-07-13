import { Navbar } from '@/components/ui/Navbar'
import { AboutUs } from '../components/landingPage/AboutUs'
import { Concept } from '../components/landingPage/Concept'
import { ContactUs } from '../components/landingPage/ContactUs'
import { Hero } from '../components/landingPage/Hero'
import { JoinMovement } from '../components/landingPage/JoinMouvement'
import { NewProducts } from '../components/landingPage/NewProducts'
import { ToTop } from '../components/ui/ToTop'
import { Footer } from '@/components/ui/Footer'

export default function HomePage() {
  return (
    <div>
      <Navbar user={null} />
      <Hero />
      <Concept />
      <NewProducts />
      <AboutUs />
      <ContactUs />
      <JoinMovement />
      <ToTop />
      <Footer />
    </div>
  )
}
