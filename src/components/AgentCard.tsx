import { Star, MapPin, BadgeCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import ServiceBadge from "./ServiceBadge";
import { Link } from "react-router-dom";

interface AgentCardProps {
  agent: {
    id: string;
    business_name: string;
    service_type: "mpesa" | "telebirr" | "both";
    agent_code: string;
    city: string;
    region: string;
    rating: number | null;
    total_reviews: number | null;
    is_verified: boolean;
    phone: string;
  };
}

const AgentCard = ({ agent }: AgentCardProps) => {
  return (
    <Card className="p-5 shadow-card hover:shadow-card-hover transition-all duration-300 group cursor-pointer border-border">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center text-primary-foreground font-display font-bold text-sm">
            {agent.business_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-semibold text-foreground text-sm">{agent.business_name}</h3>
              {agent.is_verified && <BadgeCheck className="w-4 h-4 text-mpesa" />}
            </div>
            <p className="text-xs text-muted-foreground">Code: {agent.agent_code}</p>
          </div>
        </div>
        <ServiceBadge type={agent.service_type} />
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {agent.city}, {agent.region}
        </span>
        {agent.rating !== null && (
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-telebirr text-telebirr" />
            {agent.rating} ({agent.total_reviews})
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{agent.phone}</span>
        <Link to={`/agents/${agent.id}`} className="text-xs font-medium text-mpesa hover:underline">View Details →</Link>
      </div>
    </Card>
  );
};

export default AgentCard;
