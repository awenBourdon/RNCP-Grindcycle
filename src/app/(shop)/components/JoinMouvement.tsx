export const JoinMovement = () => {
  return (
    <section className="hidden sm:block py-16 bg-white text-[#010101]">
      <div className="w-full overflow-hidden">
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-content {
            display: flex;
            animation: marquee 30s linear infinite;
            width: fit-content;
          }
          .marquee-item {
            display: flex;
            align-items: center;
            white-space: nowrap;
            margin-right: 3.5rem;
          }
          .marquee-text {
            letter-spacing: 0.125em;
          }
          .marquee-dot {
            width: 1rem;
            height: 1rem;
            background-color: #0a3d3f;
            border-radius: 9999px;
            margin: 0 2.5rem;
          }
        `}</style>

        <div className="py-8 text-3xl sm:text-7xl font-bold uppercase">
          <div className="marquee-content">
            {Array(4)
              .fill(null)
              .map((_, id) => (
                <div key={id} className="flex items-center">
                  <div className="marquee-item">
                    <span className="marquee-text">Recycle</span>
                    <div className="marquee-dot"></div>
                  </div>
                  <div className="marquee-item">
                    <span className="marquee-text">Roule</span>
                    <div className="marquee-dot"></div>
                  </div>
                  <div className="marquee-item">
                    <span className="marquee-text">Recommence</span>
                    <div className="marquee-dot"></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
};
