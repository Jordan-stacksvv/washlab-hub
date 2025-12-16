import { useState, useEffect } from 'react';
import stackedClothes from '@/assets/stacked-clothes.jpg';
import heroLaundry from '@/assets/hero-laundry.jpg';
import laundryHero1 from '@/assets/laundry-hero-1.jpg';
import laundryHero2 from '@/assets/laundry-hero-2.jpg';

const images = [heroLaundry, laundryHero1, laundryHero2, stackedClothes];

export const HeroSlideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Full-screen slideshow images */}
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img 
            src={img} 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-primary/20" />
    </div>
  );
};
