import stackedClothes from '@/assets/stacked-clothes.jpg';

export const HeroSlideshow = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Light warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/50 to-sky-50/30" />
      
      {/* Center stacked clothes image */}
      <div className="absolute inset-0 flex items-end justify-center pb-0">
        <div className="relative w-full max-w-md md:max-w-lg lg:max-w-xl">
          <img 
            src={stackedClothes} 
            alt="Stacked clean laundry" 
            className="w-full h-auto object-contain drop-shadow-2xl"
            style={{ 
              maskImage: 'linear-gradient(to top, transparent 0%, black 20%)',
              WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 20%)'
            }}
          />
        </div>
      </div>

      {/* Laundry basket on the right */}
      <div className="absolute right-4 md:right-12 lg:right-20 top-1/3 hidden md:block z-20">
        <div className="relative w-28 h-28 lg:w-36 lg:h-36">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 shadow-2xl border-4 border-white" />
          <div className="absolute inset-0 flex items-center justify-center text-4xl lg:text-5xl">
            🧺
          </div>
        </div>
      </div>
    </div>
  );
};
