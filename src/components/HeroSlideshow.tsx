import { useState, useEffect } from 'react';
import stackedClothes from '@/assets/stacked-clothes.jpg';
import heroLaundry from '@/assets/hero-laundry.jpg';

const images = [stackedClothes, heroLaundry];

export const HeroSlideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Slideshow images */}
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-20' : 'opacity-0'
          }`}
        >
          <img 
            src={img} 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/80" />
    </div>
  );
};
