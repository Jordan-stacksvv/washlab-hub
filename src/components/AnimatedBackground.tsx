import { useEffect, useState } from 'react';

const laundryIcons = [
  '👕', '👖', '🧦', '🧥', '👗', '🩳', '🧺', '🫧', '💧', '✨'
];

interface FloatingItem {
  id: number;
  icon: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export const AnimatedBackground = () => {
  const [items, setItems] = useState<FloatingItem[]>([]);

  useEffect(() => {
    const newItems: FloatingItem[] = [];
    for (let i = 0; i < 20; i++) {
      newItems.push({
        id: i,
        icon: laundryIcons[Math.floor(Math.random() * laundryIcons.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 30 + 20,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5,
      });
    }
    setItems(newItems);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      {/* Animated circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-wash-purple/5 rounded-full blur-3xl animate-spin-slow" />

      {/* Floating laundry items */}
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute opacity-20"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: `${item.size}px`,
            animation: `float ${item.duration}s ease-in-out infinite`,
            animationDelay: `${item.delay}s`,
          }}
        >
          {item.icon}
        </div>
      ))}

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
};
