
-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid NOT NULL,
  transaction_id uuid REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL UNIQUE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can read reviews
CREATE POLICY "Reviews viewable by everyone" ON public.reviews
  FOR SELECT USING (true);

-- Customers can create reviews for their own transactions
CREATE POLICY "Customers can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id
    AND EXISTS (
      SELECT 1 FROM public.transactions
      WHERE transactions.id = transaction_id
        AND transactions.customer_id = auth.uid()
    )
  );

-- Function to update agent rating after review
CREATE OR REPLACE FUNCTION public.update_agent_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.agents
  SET rating = (SELECT ROUND(AVG(r.rating)::numeric, 1) FROM public.reviews r WHERE r.agent_id = NEW.agent_id),
      total_reviews = (SELECT COUNT(*) FROM public.reviews r WHERE r.agent_id = NEW.agent_id)
  WHERE id = NEW.agent_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agent_rating();
