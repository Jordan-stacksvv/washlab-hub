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
  Check,
  Zap,
  Heart,
  Users
} from 'lucide-react';

const stats = [
  { value: '10K+', label: 'Happy Students' },
  { value: '50K+', label: 'Loads Washed' },
  { value: '99%', label: 'Satisfaction' },
  { value: '24hr', label: 'Turnaround' },
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
    title: 'Secure Tracking',
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
      
      {/* Hero Section - Full Screen with Image Background */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <HeroSlideshow />
        
        <div className="container relative z-10 px-4 md:px-6 py-32">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-6 animate-fade-in">
              <Zap className="w-4 h-4" />
              Campus-first laundry service
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 leading-[1.1] animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Fresh Clothes,
              <br />
              <span className="text-white/90">Zero Stress</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-xl leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Drop off your laundry and focus on what matters. We'll handle the rest with care.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link to="/order">
                <Button 
                  size="lg" 
                  className="gap-2 bg-white text-primary hover:bg-white/90 px-8 h-14 text-base font-semibold rounded-full shadow-xl transition-all hover:scale-105"
                >
                  Place Order
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/track">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 h-14 text-base font-semibold rounded-full border-2 border-white/40 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all"
                >
                  Track Order
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 mt-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex -space-x-3">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur border-2 border-white flex items-center justify-center text-white font-semibold text-sm">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-white/80">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm mt-0.5">Loved by 10,000+ students</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 rounded-full bg-white/60" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-display font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-white/70 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              <Droplets className="w-4 h-4" />
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Clean Clothes in 4 Steps
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Simple, fast, and hassle-free laundry service designed for busy students
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { step: 1, icon: Smartphone, title: 'Order Online', desc: 'Select your service and enter delivery details' },
              { step: 2, icon: MapPin, title: 'Drop Off', desc: 'Bring your clothes to our WashStation' },
              { step: 3, icon: Droplets, title: 'We Clean', desc: 'Professional wash, dry, and careful folding' },
              { step: 4, icon: Heart, title: 'Enjoy', desc: 'Collect your fresh, clean laundry' },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center group">
                <div className="relative z-10 mx-auto w-fit">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-foreground font-bold flex items-center justify-center text-sm shadow-md">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-display font-semibold text-xl mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
                
                {index < 3 && (
                  <div className="hidden md:block absolute top-10 left-[65%] w-[70%] h-0.5 bg-gradient-to-r from-primary/40 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              Our Services
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Choose Your Service
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Flexible options to fit your lifestyle and budget
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { title: 'Wash Only', price: '₵25', unit: '/load', desc: 'Professional washing with quality detergents', features: ['Quality detergent', 'Color separation', 'Gentle care'] },
              { title: 'Wash & Dry', price: '₵50', unit: '/load', desc: 'Complete service with expert folding', featured: true, features: ['Everything in Wash', 'Tumble drying', 'Neatly folded'] },
              { title: 'Dry Only', price: '₵25', unit: '/load', desc: 'Gentle tumble drying for all fabrics', features: ['Quick dry', 'All fabrics', 'Ready to wear'] },
            ].map((service) => (
              <div
                key={service.title}
                className={`relative p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 ${
                  service.featured 
                    ? 'bg-primary text-white shadow-2xl shadow-primary/30 scale-105' 
                    : 'bg-card border border-border hover:border-primary/30 hover:shadow-lg'
                }`}
              >
                {service.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-accent text-foreground text-sm font-semibold shadow-lg">
                    Most Popular
                  </div>
                )}
                <h3 className="font-display font-semibold text-2xl mb-2">{service.title}</h3>
                <div className={`text-4xl font-display font-bold mb-4 ${service.featured ? '' : 'text-primary'}`}>
                  {service.price}<span className={`text-lg font-normal ${service.featured ? 'text-white/70' : 'text-muted-foreground'}`}>{service.unit}</span>
                </div>
                <p className={`mb-6 ${service.featured ? 'text-white/80' : 'text-muted-foreground'}`}>{service.desc}</p>
                <ul className="space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 ${service.featured ? 'text-white' : 'text-primary'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/order" className="block mt-8">
                  <Button 
                    className={`w-full rounded-full h-12 font-semibold ${
                      service.featured 
                        ? 'bg-white text-primary hover:bg-white/90' 
                        : 'bg-primary text-white hover:bg-primary/90'
                    }`}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              1 load = 8kg • Final price calculated after weighing
            </p>
            <p className="text-primary font-semibold mt-2 flex items-center justify-center gap-2">
              <Star className="w-5 h-5 fill-primary" />
              10 washes = 1 free wash!
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                <Shield className="w-4 h-4" />
                Why WashLab
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                Built for Campus Life
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We understand student life. That's why we've created a laundry service that's fast, affordable, and reliable.
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 flex items-center justify-center">
                <div className="text-center text-white">
                  <Users className="w-20 h-20 mx-auto mb-6 opacity-90" />
                  <div className="text-6xl font-display font-bold mb-2">10K+</div>
                  <p className="text-xl text-white/80">Happy Students</p>
                  <p className="text-white/60 mt-4">Across 5 campuses in Ghana</p>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-2xl bg-accent/20 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-primary/20 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-primary relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white" />
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/80 mb-10">
              Join thousands of students who've made the switch to WashLab. Your first wash is just a click away.
            </p>
            <Link to="/order">
              <Button 
                size="lg" 
                className="gap-2 bg-white text-primary hover:bg-white/90 px-10 h-14 text-lg font-semibold rounded-full shadow-xl transition-all hover:scale-105"
              >
                Place Your First Order
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo size="sm" />
            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
              <Link to="/order" className="hover:text-primary transition-colors">Place Order</Link>
              <Link to="/track" className="hover:text-primary transition-colors">Track Order</Link>
              <Link to="/account" className="hover:text-primary transition-colors">Account</Link>
              <Link to="/staff" className="hover:text-primary transition-colors">Staff Portal</Link>
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
