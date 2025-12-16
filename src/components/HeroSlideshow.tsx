import { useState, useEffect } from 'react';
import heroImage from '@/assets/hero-laundry.jpg';

const slides = [
  {
    title: "Fresh & Clean",
    subtitle: "Every Time",
    gradient: "from-primary/30 via-accent/20 to-wash-purple/20"
  },
  {
    title: "Professional Care",
    subtitle: "For Your Clothes",
    gradient: "from-wash-teal/30 via-primary/20 to-wash-pink/20"
  },
  {
    title: "Quick Turnaround",
    subtitle: "Same Day Service",
    gradient: "from-wash-orange/30 via-warning/20 to-wash-pink/20"
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
        className="absolute inset-0 bg-cover bg-center opacity-20"
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
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/10 animate-float"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
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
        <div className="relative w-64 h-64">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-spin-slow" />
          <div className="absolute inset-4 rounded-full border-2 border-dashed border-accent/30 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '15s' }} />
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 animate-pulse-soft" />
          <div className="absolute inset-0 flex items-center justify-center text-6xl animate-bounce-soft">
            🧺
          </div>
        </div>
      </div>

      {/* Floating clothes on the left */}
      <div className="absolute left-10 top-1/3 hidden lg:block opacity-60">
        <div className="text-6xl animate-float" style={{ animationDelay: '0s' }}>👕</div>
      </div>
      <div className="absolute left-20 bottom-1/3 hidden lg:block opacity-60">
        <div className="text-5xl animate-float-slow" style={{ animationDelay: '1s' }}>👖</div>
      </div>
      <div className="absolute left-32 top-1/2 hidden lg:block opacity-60">
        <div className="text-4xl animate-float" style={{ animationDelay: '2s' }}>🧦</div>
      </div>
    </div>
  );
};
