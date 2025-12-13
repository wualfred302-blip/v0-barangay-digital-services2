-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.certificates CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.certificate_counter CASCADE;

-- Create users table (no auth dependency)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT,
  mobile_number TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create certificates table
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  certificate_type TEXT NOT NULL,
  purpose TEXT,
  request_type TEXT, -- 'regular' or 'rush'
  amount DECIMAL(10,2),
  payment_reference TEXT,
  serial_number TEXT UNIQUE,
  status TEXT DEFAULT 'processing', -- 'processing', 'ready'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ready_at TIMESTAMPTZ
);

-- Serial number counter
CREATE TABLE public.certificate_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  current_number INTEGER DEFAULT 0,
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO public.certificate_counter (id, current_number) VALUES (1, 0);

-- Function to generate serial numbers
CREATE OR REPLACE FUNCTION generate_serial_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  UPDATE public.certificate_counter 
  SET current_number = current_number + 1 
  WHERE id = 1 
  RETURNING current_number INTO next_num;
  
  RETURN 'BGRY-MWQ-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate serial number
CREATE OR REPLACE FUNCTION set_serial_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.serial_number IS NULL THEN
    NEW.serial_number := generate_serial_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_certificate_serial ON public.certificates;

CREATE TRIGGER generate_certificate_serial
  BEFORE INSERT ON public.certificates
  FOR EACH ROW
  EXECUTE FUNCTION set_serial_number();

-- Disable RLS for demo (no auth)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates DISABLE ROW LEVEL SECURITY;
