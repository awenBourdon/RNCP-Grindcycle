import { Navbar } from '@/components/Navbar'
import { AboutUs } from './homeComponents/AboutUs'
import { Concept } from './homeComponents/Concept'
import { ContactUs } from './homeComponents/ContactUs'
import { Hero } from './homeComponents/Hero'
import { JoinMovement } from './homeComponents/JoinMouvement'
import { NewProducts } from './homeComponents/NewProducts'
import { ToTop } from './homeComponents/ToTop'
import { Footer } from '@/components/Footer'

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
