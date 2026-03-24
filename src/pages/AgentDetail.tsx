import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceBadge from "@/components/ServiceBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, BadgeCheck, MapPin, Phone, Star, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const StarRating = ({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-5 h-5 transition-colors ${
          star <= value ? "fill-telebirr text-telebirr" : "text-muted-foreground/30"
        } ${!readonly ? "cursor-pointer hover:text-telebirr" : ""}`}
        onClick={() => !readonly && onChange?.(star)}
      />
    ))}
  </div>
);

const AgentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewableTransactions, setReviewableTransactions] = useState<any[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [selectedTxn, setSelectedTxn] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      const [agentRes, reviewsRes] = await Promise.all([
        supabase.from("agents").select("*").eq("id", id).single(),
        supabase.from("reviews").select("*").eq("agent_id", id).order("created_at", { ascending: false }),
      ]);

      setAgent(agentRes.data);
      setReviews(reviewsRes.data ?? []);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    fetchData();
  }, [id]);

  // Fetch reviewable transactions when user is known
  useEffect(() => {
    if (!user || !id) return;
    const fetchReviewable = async () => {
      // Get transactions for this agent by this customer that don't have a review yet
      const { data: txns } = await supabase
        .from("transactions")
        .select("id, amount, reference_code, created_at")
        .eq("agent_id", id)
        .eq("customer_id", user.id);

      if (!txns || txns.length === 0) {
        setReviewableTransactions([]);
        return;
      }

      const { data: existingReviews } = await supabase
        .from("reviews")
        .select("transaction_id")
        .eq("customer_id", user.id)
        .eq("agent_id", id);

      const reviewedTxnIds = new Set((existingReviews ?? []).map((r: any) => r.transaction_id));
      setReviewableTransactions(txns.filter((t: any) => !reviewedTxnIds.has(t.id)));
    };
    fetchReviewable();
  }, [user, id, reviews]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !agent) return;
    setSubmitting(true);

    const refCode = `AP${Date.now().toString(36).toUpperCase()}`;
    const { error } = await supabase.from("transactions").insert({
      agent_id: agent.id,
      customer_id: user.id,
      amount: parseFloat(amount),
      service_type: "telebirr" as any,
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

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !agent || !selectedTxn) return;
    setSubmittingReview(true);

    const { error } = await supabase.from("reviews").insert({
      agent_id: agent.id,
      customer_id: user.id,
      transaction_id: selectedTxn,
      rating: reviewRating,
      comment: reviewComment.trim() || null,
    } as any);

    setSubmittingReview(false);
    if (error) {
      toast({ title: "Review failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
      setShowReview(false);
      setReviewComment("");
      setReviewRating(5);
      setSelectedTxn("");
      // Refresh reviews and agent data
      const [agentRes, reviewsRes] = await Promise.all([
        supabase.from("agents").select("*").eq("id", id).single(),
        supabase.from("reviews").select("*").eq("agent_id", id).order("created_at", { ascending: false }),
      ]);
      setAgent(agentRes.data);
      setReviews(reviewsRes.data ?? []);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 text-center">
          <p className="text-muted-foreground text-lg">Agent not found.</p>
          <Link to="/agents" className="text-primary hover:underline mt-4 inline-block">← Back to agents</Link>
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
                  {agent.is_verified && <BadgeCheck className="w-5 h-5 text-primary" />}
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
              <span className={`w-2 h-2 rounded-full ${agent.status === "approved" ? "bg-primary" : "bg-telebirr"}`} />
              <span className="capitalize">{agent.status}</span>
            </div>

            {/* Action buttons */}
            {user ? (
              <div className="flex flex-wrap gap-3">
                <Button className="gap-2" onClick={() => setShowTransfer(true)}>
                  <Send className="w-4 h-4" /> Send Money to Agent
                </Button>
                {reviewableTransactions.length > 0 && (
                  <Button variant="outline" className="gap-2" onClick={() => {
                    setSelectedTxn(reviewableTransactions[0].id);
                    setShowReview(true);
                  }}>
                    <Star className="w-4 h-4" /> Rate This Agent
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button>Login to Send Money</Button>
                </Link>
                <span className="text-xs text-muted-foreground">Sign in to initiate a transfer</span>
              </div>
            )}
          </Card>

          {/* Reviews Section */}
          <div className="mt-8">
            <h2 className="font-display font-bold text-xl text-foreground mb-4">
              Reviews {reviews.length > 0 && `(${reviews.length})`}
            </h2>
            {reviews.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground text-sm">No reviews yet. Be the first to rate this agent!</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {reviews.map((review: any) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <StarRating value={review.rating} readonly />
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString("en-ET", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Dialog */}
      <Dialog open={showTransfer} onOpenChange={setShowTransfer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Money to {agent.business_name}</DialogTitle>
            <DialogDescription>Enter the amount to initiate a Telebirr transfer.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTransfer} className="space-y-4 mt-2">
            <div>
              <Label>Amount (ETB)</Label>
              <Input type="number" min="1" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm Transfer
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate {agent.business_name}</DialogTitle>
            <DialogDescription>Share your experience with this agent.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReview} className="space-y-4 mt-2">
            {reviewableTransactions.length > 1 && (
              <div>
                <Label>Transaction</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedTxn}
                  onChange={(e) => setSelectedTxn(e.target.value)}
                >
                  {reviewableTransactions.map((txn: any) => (
                    <option key={txn.id} value={txn.id}>
                      {txn.reference_code} — {txn.amount} ETB
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <Label className="mb-2 block">Rating</Label>
              <StarRating value={reviewRating} onChange={setReviewRating} />
            </div>
            <div>
              <Label>Comment (optional)</Label>
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="How was your experience?"
                maxLength={500}
              />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={submittingReview}>
              {submittingReview && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Review
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AgentDetail;
