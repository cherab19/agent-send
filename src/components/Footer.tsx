import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-foreground text-background py-16">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">AgentPay</span>
          </div>
          <p className="text-sm opacity-60 leading-relaxed">
            Bridging the gap between mobile money agents and customers across East Africa.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3">Platform</h4>
          <div className="space-y-2 text-sm opacity-60">
            <Link to="/agents" className="block hover:opacity-100 transition-opacity">Find Agents</Link>
            <Link to="/register" className="block hover:opacity-100 transition-opacity">Become an Agent</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3">Services</h4>
          <div className="space-y-2 text-sm opacity-60">
            <p>M-Pesa Transfers</p>
            <p>Telebirr Transfers</p>
            <p>Agent Verification</p>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3">Support</h4>
          <div className="space-y-2 text-sm opacity-60">
            <p>Help Center</p>
            <p>Contact Us</p>
            <p>Terms & Privacy</p>
          </div>
        </div>
      </div>
      <div className="border-t border-background/10 mt-12 pt-6 text-center text-xs opacity-40">
        © 2026 AgentPay. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
