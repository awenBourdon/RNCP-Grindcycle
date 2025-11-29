import { ArrowRight } from 'lucide-react';

export const ContactUs = () => {
  return (
    <section className="py-24 bg-white" aria-label="Nous contacter">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h2 className="text-3xl font-normal mb-8 md:mb-0 max-w-xl">
            Tu veux en savoir plus ?
          </h2>
          <a
            href="mailto:contact@tondomaine.com"
            className="flex items-center group"
            aria-label="Contactez-nous par email"
          >
            <span className="mr-2 border-b border-black pb-1 group-hover:border-[#0a3d3f] transition-colors">
              Contacte-nous
            </span>
            <div
              className="w-8 h-8 bg-[#0a3d3f] rounded-full flex items-center justify-center"
              aria-hidden="true"
            >
              <ArrowRight size={16} className="text-white" />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};
