import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceBadge from "@/components/ServiceBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, BadgeCheck, MapPin, Phone, Star, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AgentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [amount, setAmount] = useState("");
  const [serviceType, setServiceType] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAgent = async () => {
      if (!id) return;
      const { data } = await supabase.from("agents").select("*").eq("id", id).single();
      setAgent(data);
      if (data) {
        setServiceType("telebirr");
      }
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    fetchAgent();
  }, [id]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !agent) return;
    setSubmitting(true);

    const refCode = `AP${Date.now().toString(36).toUpperCase()}`;
    const { error } = await supabase.from("transactions").insert({
      agent_id: agent.id,
      customer_id: user.id,
      amount: parseFloat(amount),
      service_type: serviceType as any,
      reference_code: refCode,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Transfer failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Transfer initiated!", description: `Reference: ${refCode}` });
      setShowTransfer(false);
      setAmount("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-mpesa" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 text-center">
          <p className="text-muted-foreground text-lg">Agent not found.</p>
          <Link to="/agents" className="text-mpesa hover:underline mt-4 inline-block">← Back to agents</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/agents" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to agents
          </Link>

          <Card className="p-8 shadow-card">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center text-primary-foreground font-display font-bold text-2xl shrink-0">
                {agent.business_name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-display font-bold text-2xl text-foreground">{agent.business_name}</h1>
                  {agent.is_verified && <BadgeCheck className="w-5 h-5 text-mpesa" />}
                </div>
                <p className="text-sm text-muted-foreground">Agent Code: {agent.agent_code}</p>
              </div>
              <ServiceBadge type={agent.service_type} />
            </div>

            {/* Details grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{agent.city}, {agent.region}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{agent.phone}</span>
              </div>
              {agent.rating !== null && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Star className="w-4 h-4 fill-telebirr text-telebirr" />
                  <span>{agent.rating} rating ({agent.total_reviews} reviews)</span>
                </div>
              )}
              {agent.address && (
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">Address:</span> {agent.address}
                </div>
              )}
            </div>

            {agent.description && (
              <div className="mb-6">
                <h3 className="font-display font-semibold text-sm text-foreground mb-1">About</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{agent.description}</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
              <span className={`w-2 h-2 rounded-full ${agent.status === "approved" ? "bg-mpesa" : "bg-telebirr"}`} />
              <span className="capitalize">{agent.status}</span>
            </div>

            {/* Transfer button */}
            {user ? (
              <Button className="gap-2" onClick={() => setShowTransfer(true)}>
                <Send className="w-4 h-4" /> Send Money to Agent
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button>Login to Send Money</Button>
                </Link>
                <span className="text-xs text-muted-foreground">Sign in to initiate a transfer</span>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Transfer Dialog */}
      <Dialog open={showTransfer} onOpenChange={setShowTransfer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Money to {agent.business_name}</DialogTitle>
            <DialogDescription>Enter the amount and select the service to initiate a transfer.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTransfer} className="space-y-4 mt-2">
            <div>
              <Label>Amount (ETB)</Label>
              <Input
                type="number"
                min="1"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm Transfer
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AgentDetail;
