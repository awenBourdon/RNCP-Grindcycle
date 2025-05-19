import AboutUs from "./homeComponents/AboutUs";
import Concept from "./homeComponents/Concept";
import ContactUs from "./homeComponents/ContactUs";
import Hero from "./homeComponents/Hero";
import JoinMovement from "./homeComponents/JoinMouvement";
import NewProducts from "./homeComponents/NewProducts";
import ToTop from "./homeComponents/ToTop";

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Concept />
      <NewProducts />
      <AboutUs />
      <ContactUs/>
      <JoinMovement />
      <ToTop />
    </div>
  );
}