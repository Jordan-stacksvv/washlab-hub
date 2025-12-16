import { useState, useEffect } from 'react';
import heroImage from '@/assets/hero-laundry.jpg';

const slides = [
  {
    title: "Fresh & Clean",
    subtitle: "Every Time",
    gradient: "from-wash-blue/30 via-wash-orange/20 to-wash-blue-light/20"
  },
  {
    title: "Professional Care",
    subtitle: "For Your Clothes",
    gradient: "from-wash-orange/20 via-wash-blue/30 to-wash-yellow/20"
  },
  {
    title: "Quick Turnaround",
    subtitle: "Same Day Service",
    gradient: "from-wash-blue-light/30 via-wash-orange/20 to-wash-blue/20"
  }
];

export const HeroSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-15"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Gradient overlays */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-br ${slide.gradient} ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      
      {/* Animated bubbles */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-wash-blue/10 animate-float"
            style={{
              width: `${Math.random() * 80 + 40}px`,
              height: `${Math.random() * 80 + 40}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>

      {/* Washing machine spinner effect */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:block">
        <div className="relative w-56 h-56">
          <div className="absolute inset-0 rounded-full border-4 border-wash-blue/20 animate-spin-slow" />
          <div className="absolute inset-4 rounded-full border-2 border-dashed border-wash-orange/30 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '15s' }} />
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-wash-blue/10 to-wash-orange/10 animate-pulse-soft" />
          <div className="absolute inset-0 flex items-center justify-center text-5xl animate-bounce-soft">
            🧺
          </div>
        </div>
      </div>

      {/* Floating clothes on the left */}
      <div className="absolute left-10 top-1/3 hidden lg:block opacity-50">
        <div className="text-5xl animate-float" style={{ animationDelay: '0s' }}>👕</div>
      </div>
      <div className="absolute left-20 bottom-1/3 hidden lg:block opacity-50">
        <div className="text-4xl animate-float-slow" style={{ animationDelay: '1s' }}>👖</div>
      </div>
      <div className="absolute left-32 top-1/2 hidden lg:block opacity-50">
        <div className="text-3xl animate-float" style={{ animationDelay: '2s' }}>🧦</div>
      </div>
    </div>
  );
};
