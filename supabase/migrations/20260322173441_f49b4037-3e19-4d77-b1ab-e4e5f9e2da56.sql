
-- Create enum for service types
CREATE TYPE public.service_type AS ENUM ('mpesa', 'telebirr', 'both');

-- Create enum for agent status
CREATE TYPE public.agent_status AS ENUM ('pending', 'approved', 'suspended');

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_agent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Agents table
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  service_type service_type NOT NULL DEFAULT 'both',
  agent_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  address TEXT,
  description TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  status agent_status NOT NULL DEFAULT 'pending',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved agents viewable by everyone" ON public.agents FOR SELECT USING (status = 'approved');
CREATE POLICY "Agents can update own record" ON public.agents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can register as agent" ON public.agents FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id),
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  service_type service_type NOT NULL,
  reference_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view own transactions" ON public.transactions FOR SELECT USING (
  agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid())
);
CREATE POLICY "Customers can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can create transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = customer_id);
