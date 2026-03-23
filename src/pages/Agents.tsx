import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AgentCard from "@/components/AgentCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Agents = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      let query = supabase.from("agents").select("*");

      if (serviceFilter !== "all") {
        query = query.eq("service_type", serviceFilter as "mpesa" | "telebirr" | "both");
      }

      if (search) {
        query = query.or(`business_name.ilike.%${search}%,city.ilike.%${search}%,agent_code.ilike.%${search}%`);
      }

      const { data } = await query.order("rating", { ascending: false });
      setAgents(data || []);
      setLoading(false);
    };

    fetchAgents();
  }, [search, serviceFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
              Find Trusted Agents
            </h1>
            <p className="text-muted-foreground">Search Telebirr agents near you across Ethiopia</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, city, or agent code..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="telebirr">Telebirr</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-mpesa" />
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No agents found. Try adjusting your search.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Agents;
