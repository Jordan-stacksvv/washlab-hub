import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <Logo size="lg" className="justify-center mb-8" />
        <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Search className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-display font-bold mb-4 text-gradient">404</h1>
        <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          Oops! This page got lost in the wash.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/"><Button size="lg"><Home className="w-5 h-5" />Home</Button></Link>
          <Link to="/track"><Button variant="outline" size="lg">Track Order</Button></Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
