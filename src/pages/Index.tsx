import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
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
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        <div className="container relative px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text Content */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Campus Laundry Made Easy
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 leading-tight">
                Laundry made easy
                <br />
                <span className="text-primary">for campus life.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-4 leading-relaxed">
                <span className="font-semibold text-foreground">Wash. Dry. Fold. Done.</span>
              </p>
              
              <p className="text-muted-foreground mb-8">
                Drop your clothes. Pay instantly. Get notified when it's ready.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/order">
                  <Button 
                    size="lg" 
                    className="gap-2 bg-primary hover:bg-primary/90 px-8 h-14 text-base font-semibold rounded-full shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                  >
                    Start Laundry
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="px-8 h-14 text-base font-semibold rounded-full border-2"
                  >
                    How It Works
                  </Button>
                </a>
              </div>
            </div>

            {/* Right - Phone Mockup / Illustration */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Phone Frame */}
                <div className="w-72 h-[580px] bg-foreground rounded-[3rem] p-3 shadow-2xl">
                  <div className="w-full h-full bg-background rounded-[2.5rem] overflow-hidden flex flex-col">
                    {/* Phone Screen Content */}
                    <div className="bg-primary px-6 py-8 text-primary-foreground">
                      <p className="text-sm opacity-80">Order Ready!</p>
                      <p className="text-2xl font-bold mt-1">WL-4921</p>
                    </div>
                    
                    <div className="flex-1 p-6 space-y-4">
                      {/* WhatsApp Notification Preview */}
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                            <Bell className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-semibold text-emerald-800 text-sm">WashLab</span>
                        </div>
                        <p className="text-sm text-emerald-700">Your order is ready for pickup! Bag #10</p>
                      </div>
                      
                      {/* Order Summary Card */}
                      <div className="bg-muted/50 rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Service</span>
                          <span className="font-medium">Wash & Dry</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Items</span>
                          <span className="font-medium">12 pieces</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total</span>
                          <span className="font-bold text-primary">₵50.00</span>
                        </div>
                      </div>
                      
                      {/* Folded Clothes Illustration */}
                      <div className="flex justify-center pt-4">
                        <div className="w-32 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
                          <span className="text-4xl">👕</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-accent/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Steps, Big Icons */}
      <section id="how-it-works" className="py-20 md:py-28 bg-muted/30">
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
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4 md:px-6">
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
