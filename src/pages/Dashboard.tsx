import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, UserCircle, Store, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ServiceBadge from "@/components/ServiceBadge";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customerTxns, setCustomerTxns] = useState<any[]>([]);
  const [agentTxns, setAgentTxns] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Agent form state
  const [businessName, setBusinessName] = useState("");
  const [serviceType, setServiceType] = useState<string>("telebirr");
  const [agentCode, setAgentCode] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }
      setUser(session.user);

      const { data: profileData } = await supabase.from("profiles").select("*").eq("user_id", session.user.id).single();
      setProfile(profileData);

      const { data: agentData } = await supabase.from("agents").select("*").eq("user_id", session.user.id).maybeSingle();
      setAgent(agentData);

      // Fetch customer transactions
      const { data: custTxns } = await supabase
        .from("transactions")
        .select("*, agents(business_name)")
        .eq("customer_id", session.user.id)
        .order("created_at", { ascending: false });
      setCustomerTxns(custTxns || []);

      // Fetch agent transactions if user is an agent
      if (agentData) {
        const { data: agTxns } = await supabase
          .from("transactions")
          .select("*")
          .eq("agent_id", agentData.id)
          .order("created_at", { ascending: false });
        setAgentTxns(agTxns || []);
      }

      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleRegisterAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    const { error } = await supabase.from("agents").insert({
      user_id: user.id,
      business_name: businessName,
      service_type: serviceType as any,
      agent_code: agentCode,
      phone,
      city,
      region,
      address: address || null,
      description: description || null,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Application submitted!", description: "Your agent profile is pending review." });
      const { data } = await supabase.from("agents").select("*").eq("user_id", user.id).maybeSingle();
      setAgent(data);
      setShowAgentForm(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-mpesa" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-display font-bold text-3xl text-foreground mb-8">Dashboard</h1>

          {/* Profile Card */}
          <Card className="p-6 shadow-card mb-6">
            <div className="flex items-center gap-4 mb-4">
              <UserCircle className="w-12 h-12 text-muted-foreground" />
              <div>
                <h2 className="font-display font-semibold text-lg text-foreground">{profile?.full_name || "User"}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </Card>

          {/* Agent Section */}
          {agent ? (
            <Card className="p-6 shadow-card mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Store className="w-6 h-6 text-mpesa" />
                <h2 className="font-display font-semibold text-lg text-foreground">Agent Profile</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Business:</span> <span className="font-medium text-foreground">{agent.business_name}</span></div>
                <div><span className="text-muted-foreground">Code:</span> <span className="font-medium text-foreground">{agent.agent_code}</span></div>
                <div><span className="text-muted-foreground">Service:</span> <span className="font-medium text-foreground capitalize">{agent.service_type}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <span className={`font-medium capitalize ${agent.status === "approved" ? "text-mpesa" : agent.status === "pending" ? "text-telebirr" : "text-destructive"}`}>{agent.status}</span></div>
                <div><span className="text-muted-foreground">Location:</span> <span className="font-medium text-foreground">{agent.city}, {agent.region}</span></div>
                <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium text-foreground">{agent.phone}</span></div>
              </div>
            </Card>
          ) : showAgentForm ? (
            <Card className="p-6 shadow-card mb-6">
              <h2 className="font-display font-semibold text-lg text-foreground mb-4">Register as Agent</h2>
              <form onSubmit={handleRegisterAgent} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label>Business Name</Label><Input required value={businessName} onChange={(e) => setBusinessName(e.target.value)} /></div>
                  <div><Label>Agent Code</Label><Input required value={agentCode} onChange={(e) => setAgentCode(e.target.value)} placeholder="e.g. AG12345" /></div>
                  <div><Label>Phone</Label><Input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+251..." /></div>
                  <div>
                    <Label>Service Type</Label>
                    <Select value={serviceType} onValueChange={setServiceType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="telebirr">Telebirr</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>City</Label><Input required value={city} onChange={(e) => setCity(e.target.value)} /></div>
                  <div><Label>Region</Label><Input required value={region} onChange={(e) => setRegion(e.target.value)} /></div>
                </div>
                <div><Label>Address (Optional)</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
                <div><Label>Description (Optional)</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Submit Application
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowAgentForm(false)}>Cancel</Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card className="p-8 shadow-card text-center mb-6">
              <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display font-semibold text-lg text-foreground mb-2">Become an Agent</h2>
              <p className="text-sm text-muted-foreground mb-6">Register your M-Pesa or Telebirr agent business to start receiving customer transfers.</p>
              <Button onClick={() => setShowAgentForm(true)}>Register as Agent</Button>
            </Card>
          )}

          {/* Transaction History */}
          <Card className="p-6 shadow-card">
            <h2 className="font-display font-semibold text-lg text-foreground mb-4">Transaction History</h2>
            <Tabs defaultValue="sent">
              <TabsList className="mb-4">
                <TabsTrigger value="sent" className="gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Sent ({customerTxns.length})
                </TabsTrigger>
                {agent && (
                  <TabsTrigger value="received" className="gap-1.5">
                    <ArrowDownLeft className="w-3.5 h-3.5" /> Received ({agentTxns.length})
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="sent">
                {customerTxns.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No sent transactions yet. <Link to="/agents" className="text-mpesa hover:underline">Find an agent</Link> to send money.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Agent</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customerTxns.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell className="text-xs">{formatDate(tx.created_at)}</TableCell>
                            <TableCell className="font-medium">{(tx.agents as any)?.business_name || "—"}</TableCell>
                            <TableCell><ServiceBadge type={tx.service_type} /></TableCell>
                            <TableCell className="font-semibold">{tx.amount.toLocaleString()} ETB</TableCell>
                            <TableCell className="text-xs font-mono text-muted-foreground">{tx.reference_code}</TableCell>
                            <TableCell>
                              <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${tx.status === "completed" ? "bg-mpesa-light text-mpesa" : tx.status === "pending" ? "bg-telebirr-light text-telebirr" : "bg-destructive/10 text-destructive"}`}>
                                {tx.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {agent && (
                <TabsContent value="received">
                  {agentTxns.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No received transactions yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Reference</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {agentTxns.map((tx) => (
                            <TableRow key={tx.id}>
                              <TableCell className="text-xs">{formatDate(tx.created_at)}</TableCell>
                              <TableCell><ServiceBadge type={tx.service_type} /></TableCell>
                              <TableCell className="font-semibold">{tx.amount.toLocaleString()} ETB</TableCell>
                              <TableCell className="text-xs font-mono text-muted-foreground">{tx.reference_code}</TableCell>
                              <TableCell>
                                <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${tx.status === "completed" ? "bg-mpesa-light text-mpesa" : tx.status === "pending" ? "bg-telebirr-light text-telebirr" : "bg-destructive/10 text-destructive"}`}>
                                  {tx.status}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
