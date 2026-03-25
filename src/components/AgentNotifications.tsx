import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  amount: number;
  reference_code: string;
  created_at: string;
  read: boolean;
}

const AgentNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [agentId, setAgentId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: agent } = await supabase
        .from("agents")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!agent) return;
      setAgentId(agent.id);

      // Load recent transactions as initial notifications
      const { data: recent } = await supabase
        .from("transactions")
        .select("id, amount, reference_code, created_at")
        .eq("agent_id", agent.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setNotifications(
        (recent ?? []).map((t) => ({ ...t, read: true }))
      );

      // Subscribe to new transactions for this agent
      const channel = supabase
        .channel(`agent-txns-${agent.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "transactions",
            filter: `agent_id=eq.${agent.id}`,
          },
          (payload) => {
            const newTxn = payload.new as any;
            const notif: Notification = {
              id: newTxn.id,
              amount: newTxn.amount,
              reference_code: newTxn.reference_code,
              created_at: newTxn.created_at,
              read: false,
            };
            setNotifications((prev) => [notif, ...prev].slice(0, 20));
            toast({
              title: "New Transfer Received!",
              description: `${newTxn.amount} ETB — Ref: ${newTxn.reference_code}`,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    init();
  }, [toast]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (!agentId) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" onClick={markAllRead}>
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="px-4 py-3 border-b border-border">
          <h4 className="font-display font-semibold text-sm text-foreground">Notifications</h4>
        </div>
        <ScrollArea className="max-h-72">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No notifications yet</p>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 text-sm ${!n.read ? "bg-accent/40" : ""}`}
                >
                  <p className="font-medium text-foreground">
                    Transfer received: {n.amount} ETB
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ref: {n.reference_code} •{" "}
                    {new Date(n.created_at).toLocaleDateString("en-ET", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default AgentNotifications;
