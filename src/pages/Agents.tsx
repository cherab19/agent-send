import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AgentCard from "@/components/AgentCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const Agents = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [regions, setRegions] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  // Fetch distinct regions and cities for filter dropdowns
  useEffect(() => {
    const fetchFilterOptions = async () => {
      const { data: regionData } = await supabase
        .from("agents")
        .select("region")
        .eq("status", "approved");
      const { data: cityData } = await supabase
        .from("agents")
        .select("city")
        .eq("status", "approved");

      if (regionData) {
        const unique = [...new Set(regionData.map((r) => r.region))].sort();
        setRegions(unique);
      }
      if (cityData) {
        const unique = [...new Set(cityData.map((c) => c.city))].sort();
        setCities(unique);
      }
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      let query = supabase.from("agents").select("*").eq("status", "approved");

      if (regionFilter !== "all") {
        query = query.eq("region", regionFilter);
      }
      if (cityFilter !== "all") {
        query = query.eq("city", cityFilter);
      }
      if (minRating > 0) {
        query = query.gte("rating", minRating);
      }
      if (search) {
        query = query.or(
          `business_name.ilike.%${search}%,city.ilike.%${search}%,agent_code.ilike.%${search}%`
        );
      }

      const { data } = await query.order("rating", { ascending: false });
      setAgents(data || []);
      setLoading(false);
    };

    fetchAgents();
  }, [search, regionFilter, cityFilter, minRating]);

  const clearFilters = () => {
    setSearch("");
    setRegionFilter("all");
    setCityFilter("all");
    setMinRating(0);
  };

  const hasActiveFilters =
    regionFilter !== "all" || cityFilter !== "all" || minRating > 0 || search !== "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
              Find Trusted Agents
            </h1>
            <p className="text-muted-foreground">
              Search Telebirr agents near you across Ethiopia
            </p>
          </div>

          {/* Search + Toggle Filters */}
          <div className="flex flex-col gap-3 max-w-3xl mx-auto mb-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, city, or agent code..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="bg-card border border-border rounded-lg p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Region
                    </label>
                    <Select value={regionFilter} onValueChange={setRegionFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Regions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        {regions.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      City
                    </label>
                    <Select value={cityFilter} onValueChange={setCityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Cities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {cities.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Min Rating: {minRating > 0 ? `${minRating}+` : "Any"}
                    </label>
                    <Slider
                      value={[minRating]}
                      onValueChange={([v]) => setMinRating(v)}
                      min={0}
                      max={5}
                      step={0.5}
                      className="mt-3"
                    />
                  </div>
                </div>
                {hasActiveFilters && (
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active filter count */}
          {hasActiveFilters && !showFilters && (
            <div className="text-center mb-6">
              <Button variant="link" size="sm" onClick={() => setShowFilters(true)} className="text-muted-foreground">
                Filters active · Click to edit
              </Button>
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No agents found. Try adjusting your search.
              </p>
              {hasActiveFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <p className="text-center text-sm text-muted-foreground mb-6">
                {agents.length} agent{agents.length !== 1 ? "s" : ""} found
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
                {agents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Agents;
