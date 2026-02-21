
-- Create food category enum
CREATE TYPE public.food_category AS ENUM ('produce', 'bakery', 'dairy', 'prepared', 'pantry', 'beverages', 'other');

-- Create donation status enum
CREATE TYPE public.donation_status AS ENUM ('available', 'claimed', 'picked_up', 'expired', 'cancelled');

-- Create donations table
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_id UUID NOT NULL,
  food_name TEXT NOT NULL,
  category food_category NOT NULL DEFAULT 'other',
  quantity TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  pickup_location TEXT NOT NULL,
  description TEXT,
  status donation_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Donors can view their own donations
CREATE POLICY "Donors can view their own donations"
ON public.donations FOR SELECT
TO authenticated
USING (auth.uid() = donor_id);

-- Donors can insert their own donations
CREATE POLICY "Donors can insert their own donations"
ON public.donations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = donor_id AND public.has_role(auth.uid(), 'donor'));

-- Donors can update their own donations
CREATE POLICY "Donors can update their own donations"
ON public.donations FOR UPDATE
TO authenticated
USING (auth.uid() = donor_id);

-- Donors can delete their own donations
CREATE POLICY "Donors can delete their own donations"
ON public.donations FOR DELETE
TO authenticated
USING (auth.uid() = donor_id);

-- Admins can view all donations
CREATE POLICY "Admins can view all donations"
ON public.donations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Recipients can view available donations
CREATE POLICY "Recipients can view available donations"
ON public.donations FOR SELECT
TO authenticated
USING (status = 'available' AND public.has_role(auth.uid(), 'recipient'));

-- Analysts can view all donations
CREATE POLICY "Analysts can view all donations"
ON public.donations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'analyst'));

-- Trigger for updated_at
CREATE TRIGGER update_donations_updated_at
BEFORE UPDATE ON public.donations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
