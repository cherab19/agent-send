import { Search, UserCheck, SendHorizontal, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Find an Agent",
    description: "Search for Telebirr agents by location or agent code.",
    color: "bg-telebirr-light text-telebirr",
  },
  {
    icon: UserCheck,
    title: "Verify & Connect",
    description: "View agent ratings, reviews, and verification badges before connecting.",
    color: "bg-telebirr-light text-telebirr",
  },
  {
    icon: SendHorizontal,
    title: "Send Money",
    description: "Transfer money directly to your chosen agent — no physical visit required.",
    color: "bg-mpesa-light text-mpesa",
  },
  {
    icon: CheckCircle2,
    title: "Get Confirmation",
    description: "Receive instant confirmation with a reference code for your transaction.",
    color: "bg-telebirr-light text-telebirr",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-mpesa mb-2">How It Works</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
            Simple. Secure. Seamless.
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.title} className="text-center group">
              <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <step.icon className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-muted-foreground mb-2">STEP {i + 1}</div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
