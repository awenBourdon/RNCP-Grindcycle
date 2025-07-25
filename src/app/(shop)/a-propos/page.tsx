import { Mission } from './components/Mission';
import { Process } from './components/Process';
import { Team } from './components/Team';
import { Impact } from './components/Impact';
import { Faq } from './components/Faq';
import { ContactUs } from '../components/ContactUs';
import { ToTop } from '../../../components/ui/ToTop';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="pt-40 pb-16 px-6 text-center bg-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-normal text-[#010101]">
            À propos
          </h1>
        </div>
      </div>
      <Mission />
      <Process />
      <Team />
      <Impact />
      <Faq />
      <ContactUs />
      <ToTop />
    </div>
  );
}
