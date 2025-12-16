import { Link } from 'react-router-dom';
import { HeroSlideshow } from '@/components/HeroSlideshow';
import { AnimatedBackground } from '@/components/AnimatedBackground';
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
  Droplets
} from 'lucide-react';

const stats = [
  { value: '10K', suffix: '+', label: 'Happy Students', color: 'text-muted-foreground' },
  { value: '50K', suffix: '+', label: 'Loads Washed', color: 'text-wash-orange' },
  { value: '99', suffix: '%', label: 'Satisfaction', color: 'text-muted-foreground' },
  { value: '24', suffix: 'hr', label: 'Avg Turnaround', color: 'text-muted-foreground' },
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <HeroSlideshow />
        <AnimatedBackground />
        
        <div className="container relative z-10 px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-fade-in border border-primary/20">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Campus Laundry Made Easy</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 animate-slide-up">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-wash-blue via-wash-orange to-wash-yellow">
                Life Made
              </span>
              <br />
              <span className="text-foreground">Simple</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up stagger-2">
              The smartest way to handle your laundry on campus. Order online, drop off your clothes, 
              and pick them up fresh and folded. It's that simple.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up stagger-3">
              <Link to="/order">
                <Button size="lg" className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base rounded-full shadow-lg">
                  Place Order
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/track">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-6 text-base rounded-full border-2">
                  Track Order
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 animate-fade-in stagger-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className={`text-3xl md:text-4xl font-display font-bold ${stat.color}`}>
                    {stat.value}<span className="text-2xl md:text-3xl">{stat.suffix}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-soft">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32 bg-secondary/30">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get your laundry done in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, icon: Smartphone, title: 'Order Online', desc: 'Choose your service and enter your details' },
              { step: 2, icon: MapPin, title: 'Drop Off', desc: 'Bring your clothes to our WashStation' },
              { step: 3, icon: Droplets, title: 'We Clean', desc: 'Professional wash, dry, and fold' },
              { step: 4, icon: Star, title: 'Pickup/Delivery', desc: 'Collect your fresh, clean laundry' },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center">
                <div className="relative z-10 mx-auto w-fit">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-wash-orange flex items-center justify-center mb-4 shadow-lg">
                    <item.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-wash-orange text-foreground font-bold flex items-center justify-center text-sm shadow-md">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
                
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 md:py-32">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Our <span className="text-gradient">Services</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional laundry services tailored for campus life
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { title: 'Wash', price: '₵25', unit: '/load', desc: 'Professional washing with quality detergents' },
              { title: 'Dry', price: '₵25', unit: '/load', desc: 'Gentle tumble drying for all fabrics' },
              { title: 'Wash & Dry', price: '₵50', unit: '/load', desc: 'Complete service with folding included', featured: true },
            ].map((service) => (
              <div
                key={service.title}
                className={`p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                  service.featured 
                    ? 'bg-gradient-to-br from-primary/10 to-wash-orange/10 border-primary/30 shadow-lg' 
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                <h3 className="font-display font-bold text-xl mb-2">{service.title}</h3>
                <div className="text-3xl font-display font-bold text-gradient mb-2">
                  {service.price}<span className="text-lg text-muted-foreground">{service.unit}</span>
                </div>
                <p className="text-muted-foreground text-sm mb-4">{service.desc}</p>
                <p className="text-xs text-muted-foreground">1 load = 8kg of clothes</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Final price calculated after weighing • Pay at counter - Cash or Mobile Money
            </p>
            <p className="text-primary font-medium">
              Loyalty rewards - 10 washes = 1 free!
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-secondary/30">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Why Choose <span className="text-gradient">WashLab</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've reimagined campus laundry to fit your busy student life
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-wash-orange flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Ready to <span className="text-gradient">Start</span>?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of students who've made the switch to WashLab
            </p>
            <Link to="/order">
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base rounded-full shadow-lg">
                Place Your Order
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size="sm" />
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
