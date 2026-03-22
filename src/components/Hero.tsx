import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Smartphone, MapPin } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 gradient-hero opacity-[0.04]" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-mpesa/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-telebirr/10 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-8 animate-fade-up">
            <div className="w-2 h-2 rounded-full bg-mpesa animate-pulse" />
            M-Pesa & Telebirr — One Platform
          </div>

          <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-foreground leading-[1.1] mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Send Money to
            <span className="block bg-clip-text text-transparent gradient-hero">
              Your Agent, Anywhere
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            No need to visit the shop. Find trusted M-Pesa and Telebirr agents near you and transfer money instantly — secure, fast, reliable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Link to="/agents">
              <Button size="lg" className="text-base px-8 gap-2">
                Find an Agent <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="text-base px-8">
                Become an Agent
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto animate-fade-up" style={{ animationDelay: "0.4s" }}>
            {[
              { icon: Shield, label: "Verified Agents", value: "100%" },
              { icon: Smartphone, label: "Mobile First", value: "24/7" },
              { icon: MapPin, label: "Cities Covered", value: "50+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-5 h-5 mx-auto mb-2 text-mpesa" />
                <p className="font-display font-bold text-xl text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
