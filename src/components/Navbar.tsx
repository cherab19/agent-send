import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap } from "lucide-react";
import AgentNotifications from "@/components/AgentNotifications";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">AgentPay</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link to="/agents" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Find Agents</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              <AgentNotifications />
              <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link to="/register"><Button size="sm">Get Started</Button></Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 pb-4 space-y-2">
          <Link to="/" className="block py-2 text-sm text-muted-foreground" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/agents" className="block py-2 text-sm text-muted-foreground" onClick={() => setIsOpen(false)}>Find Agents</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block py-2 text-sm text-muted-foreground" onClick={() => setIsOpen(false)}>Dashboard</Link>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { handleLogout(); setIsOpen(false); }}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login" className="block" onClick={() => setIsOpen(false)}><Button variant="ghost" size="sm" className="w-full">Login</Button></Link>
              <Link to="/register" className="block" onClick={() => setIsOpen(false)}><Button size="sm" className="w-full">Get Started</Button></Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
