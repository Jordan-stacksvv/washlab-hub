import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Clock, 
  Shield, 
  Truck, 
  Star,
  ChevronRight,
  Smartphone,
  MapPin,
  Droplets,
  Play,
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
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-wash-orange/5" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-wash-orange/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-wash-orange/20 backdrop-blur-sm border border-white/10"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
                animation: 'float 6s ease-in-out infinite',
              }}
            >
              <div className="w-full h-full flex items-center justify-center text-2xl">
                {['👕', '🧺', '✨', '🌀', '🧼', '👖'][i]}
              </div>
            </div>
          ))}
        </div>
        
        <div className="container relative z-10 px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary mb-8 animate-fade-in border border-primary/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Campus Laundry Made Easy</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-8 animate-slide-up leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-wash-orange to-wash-yellow">
                Life Made
              </span>
              <br />
              <span className="text-foreground">Simple</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up stagger-2 leading-relaxed">
              The smartest way to handle your laundry on campus. Order online, drop off your clothes, 
              and pick them up fresh and folded.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up stagger-3 mb-16">
              <Link to="/order">
                <Button size="lg" className="w-full sm:w-auto gap-3 bg-gradient-to-r from-primary to-wash-orange hover:opacity-90 text-white px-8 py-7 text-lg rounded-2xl shadow-2xl shadow-primary/25 transition-all hover:scale-105 hover:shadow-primary/40">
                  Place Order
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/track">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-7 text-lg rounded-2xl border-2 hover:bg-muted/50 transition-all hover:scale-105">
                  Track Order
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 animate-fade-in stagger-4">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label} 
                  className="relative p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-4xl md:text-5xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-wash-orange">
                    {stat.value}<span className="text-3xl md:text-4xl">{stat.suffix}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Simple Process
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              How It <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-wash-orange">Works</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
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
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary to-wash-orange flex items-center justify-center mb-6 shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-foreground text-background font-bold flex items-center justify-center text-sm shadow-lg">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-display font-bold text-xl mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
                
                {index < 3 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 md:py-32">
        <div className="container px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Our Services
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Professional <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-wash-orange">Services</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Tailored for campus life
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { title: 'Wash Only', price: '₵25', unit: '/load', desc: 'Professional washing with quality detergents', features: ['Quality detergent', 'Color separation', 'Gentle care'] },
              { title: 'Wash & Dry', price: '₵50', unit: '/load', desc: 'Complete service with folding included', featured: true, features: ['Everything in Wash', 'Tumble drying', 'Neatly folded'] },
              { title: 'Dry Only', price: '₵25', unit: '/load', desc: 'Gentle tumble drying for all fabrics', features: ['Quick dry', 'All fabrics', 'Ready to wear'] },
            ].map((service) => (
              <div
                key={service.title}
                className={`relative p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 ${
                  service.featured 
                    ? 'bg-gradient-to-br from-primary/10 to-wash-orange/10 border-primary/30 shadow-2xl shadow-primary/10' 
                    : 'bg-card border-border hover:border-primary/30 hover:shadow-xl'
                }`}
              >
                {service.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-wash-orange text-white text-sm font-medium">
                    Popular
                  </div>
                )}
                <h3 className="font-display font-bold text-2xl mb-2">{service.title}</h3>
                <div className="text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-wash-orange mb-4">
                  {service.price}<span className="text-lg text-muted-foreground">{service.unit}</span>
                </div>
                <p className="text-muted-foreground mb-6">{service.desc}</p>
                <ul className="space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-5 h-5 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-2">
              1 load = 8kg • Final price calculated after weighing
            </p>
            <p className="text-primary font-semibold text-lg">
              🎁 10 washes = 1 free wash!
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Why WashLab
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Why Choose <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-wash-orange">WashLab</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We've reimagined campus laundry to fit your busy student life
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-8 rounded-3xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-wash-orange flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display font-bold text-xl mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-wash-orange/10" />
        <div className="container px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Ready to Get <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-wash-orange">Started</span>?
            </h2>
            <p className="text-muted-foreground mb-10 text-lg">
              Join thousands of students who've made the switch to WashLab
            </p>
            <Link to="/order">
              <Button size="lg" className="gap-3 bg-gradient-to-r from-primary to-wash-orange hover:opacity-90 text-white px-10 py-7 text-lg rounded-2xl shadow-2xl shadow-primary/25 transition-all hover:scale-105">
                Place Your First Order
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-muted/30">
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
