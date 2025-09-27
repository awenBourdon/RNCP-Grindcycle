import { AboutUs } from '@/app/(shop)/components/AboutUs';
import { Concept } from '@/app/(shop)/components/Concept';
import { ContactUs } from '@/app/(shop)/components/ContactUs';
import { Hero } from '@/app/(shop)/components/Hero';
import { JoinMovement } from '@/app/(shop)/components/JoinMouvement';
import { NewProducts } from '@/app/(shop)/components/NewProducts';
import { ToTop } from '@/app/(shop)/components/ToTop';

export default async function HomePage() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  let products = [];

  try {
    const response = await fetch(`${baseUrl}/api/products?latest=6`, {
      cache: 'default',
    });

    if (response.ok) {
      const data = await response.json();
      products = data.success ? data.data : [];
    }
  } catch (error) {
    console.error(error);
  }

  return (
    <div>
      <Hero />
      <Concept />
      <NewProducts products={products} />
      <AboutUs />
      <ContactUs />
      <JoinMovement />
      <ToTop />
    </div>
  );
}
