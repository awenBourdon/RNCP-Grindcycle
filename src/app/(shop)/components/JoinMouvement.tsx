'use client';
import Marquee from 'react-fast-marquee';
import { useEffect, useState } from 'react';

export const JoinMovement = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="py-16 bg-white text-[#010101]">
      <div className="w-full overflow-hidden">
        {isMobile ? (
          <div className="py-6 text-4xl font-bold uppercase flex flex-col items-center">
            <span className="tracking-wider">Rejoins le</span>
            <div className="my-2"></div>
            <span className="tracking-wider">Mouvement</span>
          </div>
        ) : (
          <Marquee
            className="py-8 text-3xl sm:text-7xl font-bold uppercase flex items-center"
            speed={80}
            direction="right"
            gradient={false}
          >
            {Array(5)
              .fill(null)
              .map((_, id) => (
                <div className="flex items-center" key={id}>
                  <span className="tracking-wider">Rejoins le Mouvement</span>
                  <div className="mx-10 sm:mx-14 w-4 h-4 bg-[#0a3d3f] rounded-full"></div>
                </div>
              ))}
          </Marquee>
        )}
      </div>
    </section>
  );
};
