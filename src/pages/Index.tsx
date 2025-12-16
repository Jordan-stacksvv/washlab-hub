import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { PhoneSlideshow } from '@/components/PhoneSlideshow';
import heroImage1 from '@/assets/laundry-hero-1.jpg';
import heroImage2 from '@/assets/laundry-hero-2.jpg';
import stackedClothes from '@/assets/stacked-clothes.jpg';
import { 
  Smartphone,
  MapPin,
  Bell,
  ArrowRight,
  Check,
  Star,
  Zap,
  CreditCard,
  Gift,
  Clock,
  Building2
} from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section - Clean, Bold, Friendly */}
      <section className="relative pt-20 pb-12 md:pt-32 md:pb-24 overflow-hidden min-h-[90vh] md:min-h-[85vh] flex items-center">
        {/* Background laundry imagery with overlay */}
        <div className="absolute inset-0">
          <img 
            src={heroImage1} 
            alt="" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/60" />
        </div>
        
        {/* Floating laundry images - hidden on mobile */}
        <div className="absolute top-1/4 right-10 w-32 h-32 rounded-2xl overflow-hidden shadow-2xl rotate-6 opacity-60 hidden lg:block">
          <img src={heroImage2} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-xl overflow-hidden shadow-xl -rotate-12 opacity-50 hidden lg:block">
          <img src={stackedClothes} alt="" className="w-full h-full object-cover" />
        </div>
        
        {/* Subtle accent gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        
        <div className="container relative px-4 md:px-6 z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left - Text Content */}
            <div className="max-w-xl order-2 lg:order-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 md:mb-6 backdrop-blur-sm">
                <Zap className="w-4 h-4" />
                Campus Laundry Made Easy
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4 md:mb-6 leading-tight">
                Laundry made easy
                <br />
                <span className="text-primary">for campus life.</span>
              </h1>
              
              <p className="text-base md:text-xl text-muted-foreground mb-3 md:mb-4 leading-relaxed">
                <span className="font-semibold text-foreground">Wash. Dry. Fold. Done.</span>
              </p>
              
              <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
                Drop your clothes. Pay instantly. Get notified when it's ready.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link to="/order" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="gap-2 bg-primary hover:bg-primary/90 px-6 sm:px-8 h-12 sm:h-14 text-base font-semibold rounded-full shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 w-full"
                  >
                    Start Laundry
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <a href="#how-it-works" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="px-6 sm:px-8 h-12 sm:h-14 text-base font-semibold rounded-full border-2 bg-background/50 backdrop-blur-sm w-full"
                  >
                    How It Works
                  </Button>
                </a>
              </div>
            </div>

            {/* Right - Phone Mockup Slideshow */}
            <div className="relative flex justify-center lg:justify-end order-1 lg:order-2 mb-6 lg:mb-0">
              <div className="relative scale-90 sm:scale-100">
                <PhoneSlideshow />
                
                {/* Decorative elements */}
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-accent/30 rounded-full blur-2xl" />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/30 rounded-full blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Steps, Big Icons */}
      <section id="how-it-works" className="py-20 md:py-28 bg-muted/30 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Simple, fast, and hassle-free
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: 1, icon: Smartphone, title: 'Place order online', desc: 'Select your service and enter your details' },
              { step: 2, icon: MapPin, title: 'Drop clothes at WashLab', desc: 'Bring your laundry to any campus location' },
              { step: 3, icon: Bell, title: 'Get notified & pick up', desc: 'We text you when your clothes are ready' },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="relative mx-auto w-fit mb-6">
                  <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                    <item.icon className="w-12 h-12 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-foreground font-bold flex items-center justify-center text-sm shadow-md">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-display font-semibold text-xl mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Students Love WashLab - Card Layout */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Why Students Love WashLab
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Clock, title: 'No queues', desc: 'Skip the laundry room lines' },
              { icon: CreditCard, title: 'Pay with MoMo', desc: 'Mobile Money & USSD payments' },
              { icon: Gift, title: 'Loyalty rewards', desc: '10 washes = 1 free wash' },
              { icon: MapPin, title: 'Campus-based', desc: 'Locations in every hostel' },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-28 bg-muted/30 relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=1920&q=80" 
            alt="" 
            className="w-full h-full object-cover opacity-5"
          />
        </div>
        <div className="container px-4 md:px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Simple Pricing
            </h2>
            <p className="text-muted-foreground">1 load = 8kg • Final price after weighing</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { title: 'Wash Only', price: '₵25', unit: '/load', features: ['Quality detergent', 'Color separation', 'Gentle care'] },
              { title: 'Wash & Dry', price: '₵50', unit: '/load', featured: true, features: ['Everything in Wash', 'Tumble drying', 'Neatly folded'] },
              { title: 'Dry Only', price: '₵25', unit: '/load', features: ['Quick dry', 'All fabrics', 'Ready to wear'] },
            ].map((service) => (
              <div
                key={service.title}
                className={`relative p-8 rounded-3xl transition-all ${
                  service.featured 
                    ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-105' 
                    : 'bg-card border border-border'
                }`}
              >
                {service.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-accent text-foreground text-sm font-semibold shadow-lg">
                    Most Popular
                  </div>
                )}
                <h3 className="font-display font-semibold text-xl mb-2">{service.title}</h3>
                <div className={`text-4xl font-display font-bold mb-6 ${service.featured ? '' : 'text-primary'}`}>
                  {service.price}<span className={`text-lg font-normal ${service.featured ? 'opacity-70' : 'text-muted-foreground'}`}>{service.unit}</span>
                </div>
                <ul className="space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className={`w-5 h-5 flex-shrink-0 ${service.featured ? '' : 'text-primary'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/order" className="block mt-8">
                  <Button 
                    className={`w-full rounded-full h-12 font-semibold ${
                      service.featured 
                        ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90' 
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-primary font-semibold flex items-center justify-center gap-2">
              <Star className="w-5 h-5 fill-primary" />
              10 washes = 1 free wash!
            </p>
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Our Locations
            </h2>
            <p className="text-muted-foreground">Find us on your campus</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Legon Campus', location: 'Main Gate', isOpen: true },
              { name: 'UPSA', location: 'Hostel Area', isOpen: true },
              { name: 'KNUST', location: 'Unity Hall', isOpen: false, comingSoon: true },
            ].map((branch) => (
              <div
                key={branch.name}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  {branch.comingSoon ? (
                    <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                      Coming Soon
                    </span>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      branch.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
                    }`}>
                      {branch.isOpen ? 'Open Now' : 'Closed'}
                    </span>
                  )}
                </div>
                <h3 className="font-display font-semibold text-lg mb-1">{branch.name}</h3>
                <p className="text-muted-foreground text-sm">{branch.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-primary">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-6">
              Ready to wash smarter?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-10">
              Join thousands of students who've made the switch to WashLab.
            </p>
            <Link to="/order">
              <Button 
                size="lg" 
                className="gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-10 h-14 text-lg font-semibold rounded-full shadow-xl transition-all hover:scale-105"
              >
                Start Now
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
              © 2025 WashLab
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
