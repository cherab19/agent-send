import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Clock, Globe } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Verified & Trusted",
    description: "Every agent is verified before listing. Your money is always safe.",
    color: "bg-mpesa-light text-mpesa",
  },
  {
    icon: Clock,
    title: "Instant Transfers",
    description: "No waiting in line. Send money to your agent in seconds.",
    color: "bg-telebirr-light text-telebirr",
  },
  {
    icon: Globe,
    title: "Nationwide Coverage",
    description: "Find agents across Ethiopia and Kenya — urban and rural areas.",
    color: "bg-mpesa-light text-mpesa",
  },
];

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <Hero />
    <HowItWorks />

    {/* Features */}
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-telebirr mb-2">Why AgentPay</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
            Built for Trust & Speed
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl bg-card p-8 shadow-card hover:shadow-card-hover transition-all duration-300 text-center">
              <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mx-auto mb-5`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="gradient-hero rounded-3xl p-12 md:p-16 text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-primary-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-md mx-auto">
            Join thousands of agents and customers already using AgentPay.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="text-base px-8">
                Register as Agent
              </Button>
            </Link>
            <Link to="/agents">
              <Button size="lg" variant="outline" className="text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Find an Agent
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Index;
