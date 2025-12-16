import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { HeroSlideshow } from '@/components/HeroSlideshow';
import { 
  Sparkles, 
  Clock, 
  Shield, 
  Truck, 
  Star,
  Smartphone,
  MapPin,
  Droplets,
  ArrowRight,
  Check
} from 'lucide-react';

const stats = [
  { value: '10K', suffix: '+', label: 'Happy Students' },
  { value: '50K', suffix: '+', label: 'Loads Washed' },
  { value: '99', suffix: '%', label: 'Satisfaction' },
  { value: '24', suffix: 'hr', label: 'Turnaround' },
];

const features = [
  {
    icon: Sparkles,
    title: 'Professional Care',
    description: 'Expert handling of all fabric types with premium detergents',
  },
  {
    icon: Clock,
    title: 'Quick Turnaround',
    description: 'Same-day service available for urgent needs',
  },
  {
    icon: Shield,
    title: 'Secure & Trackable',
    description: 'Bag card system ensures your clothes are always accounted for',
  },
  {
    icon: Truck,
    title: 'Delivery Available',
    description: 'We bring your fresh laundry right to your door',
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      
      {/* Hero Section - Solid Blue Background */}
      <section className="relative min-h-[85vh] bg-primary overflow-hidden">
        {/* Decorative curved shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/2 h-full">
            <svg className="absolute right-0 top-0 h-full w-auto" viewBox="0 0 400 800" fill="none" preserveAspectRatio="xMaxYMid slice">
              <ellipse cx="450" cy="400" rx="350" ry="500" fill="hsl(220 50% 55% / 0.4)" />
              <ellipse cx="500" cy="350" rx="280" ry="400" fill="hsl(220 50% 60% / 0.3)" />
            </svg>
          </div>
        </div>

        {/* Slideshow images behind content */}
        <HeroSlideshow />
        
        <div className="container relative z-10 px-4 pt-32 pb-20 md:pt-40 md:pb-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
              Campus Laundry Made Simple
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-lg leading-relaxed">
              Drop off your clothes, we handle the rest. Professional wash & dry service for students across Ghana.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link to="/order">
                <Button 
                  size="lg" 
                  className="gap-2 bg-white text-primary hover:bg-white/90 px-8 py-6 text-base font-semibold rounded-lg transition-all"
                >
                  Place Order
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/track">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 py-6 text-base font-semibold rounded-lg border-2 border-white/30 text-white bg-white/10 hover:bg-white/20 hover:border-white/50 transition-all"
                >
                  Track Order
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background border-b border-border">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-display font-bold text-primary">
                  {stat.value}<span className="text-2xl md:text-3xl">{stat.suffix}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Get your laundry done in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { step: 1, icon: Smartphone, title: 'Order Online', desc: 'Choose your service and enter your details' },
              { step: 2, icon: MapPin, title: 'Drop Off', desc: 'Bring your clothes to our WashStation' },
              { step: 3, icon: Droplets, title: 'We Clean', desc: 'Professional wash, dry, and fold' },
              { step: 4, icon: Star, title: 'Pickup', desc: 'Collect your fresh, clean laundry' },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center group">
                <div className="relative z-10 mx-auto w-fit">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-primary flex items-center justify-center mb-5 shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent text-foreground font-bold flex items-center justify-center text-sm">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
                
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-primary/20" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 md:py-28">
        <div className="container px-4">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Our Services
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
              Professional Services
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Tailored for campus life
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { title: 'Wash Only', price: '₵25', unit: '/load', desc: 'Professional washing with quality detergents', features: ['Quality detergent', 'Color separation', 'Gentle care'] },
              { title: 'Wash & Dry', price: '₵50', unit: '/load', desc: 'Complete service with folding included', featured: true, features: ['Everything in Wash', 'Tumble drying', 'Neatly folded'] },
              { title: 'Dry Only', price: '₵25', unit: '/load', desc: 'Gentle tumble drying for all fabrics', features: ['Quick dry', 'All fabrics', 'Ready to wear'] },
            ].map((service) => (
              <div
                key={service.title}
                className={`relative p-7 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                  service.featured 
                    ? 'bg-primary/5 border-primary/30 shadow-lg' 
                    : 'bg-card border-border hover:border-primary/20 hover:shadow-md'
                }`}
              >
                {service.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-xs font-medium">
                    Popular
                  </div>
                )}
                <h3 className="font-display font-semibold text-xl mb-2">{service.title}</h3>
                <div className="text-3xl font-display font-bold text-primary mb-3">
                  {service.price}<span className="text-base text-muted-foreground font-normal">{service.unit}</span>
                </div>
                <p className="text-muted-foreground text-sm mb-5">{service.desc}</p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-muted-foreground text-sm mb-1">
              1 load = 8kg • Final price calculated after weighing
            </p>
            <p className="text-primary font-medium">
              10 washes = 1 free wash!
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Why WashLab
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
              Why Choose WashLab?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We've reimagined campus laundry to fit your busy student life
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-primary">
        <div className="container px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-5">
              Ready to Get Started?
            </h2>
            <p className="text-white/80 mb-8 text-lg">
              Join thousands of students who've made the switch to WashLab
            </p>
            <Link to="/order">
              <Button 
                size="lg" 
                className="gap-2 bg-white text-primary hover:bg-white/90 px-10 py-6 text-base font-semibold rounded-lg transition-all"
              >
                Place Your First Order
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border bg-background">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo size="sm" />
            <nav className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/order" className="hover:text-primary transition-colors">Place Order</Link>
              <Link to="/track" className="hover:text-primary transition-colors">Track Order</Link>
              <Link to="/account" className="hover:text-primary transition-colors">Account</Link>
            </nav>
            <p className="text-sm text-muted-foreground">
              © 2025 WashLab. Life made simple.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;