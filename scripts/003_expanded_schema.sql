-- =====================================================
-- BARANGAY MAWAQUE EXPANDED SCHEMA
-- Version: 3.0 - Staff, Blotter, Announcements, Reports
-- =====================================================

-- 1. STAFF/ROLES TABLE (Demo mode - localStorage based auth)
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('captain', 'secretary', 'treasurer')),
  pin_hash TEXT, -- For future real auth
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Insert default staff members (demo mode)
INSERT INTO public.staff (full_name, email, role) VALUES
  ('Hon. Roberto Santos', 'captain@mawaque.gov.ph', 'captain'),
  ('Maria Cruz', 'secretary@mawaque.gov.ph', 'secretary'),
  ('Juan Dela Cruz', 'treasurer@mawaque.gov.ph', 'treasurer')
ON CONFLICT (email) DO NOTHING;

-- 2. BLOTTER/COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.blotters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blotter_number TEXT UNIQUE,
  complainant_name TEXT NOT NULL,
  complainant_contact TEXT,
  complainant_address TEXT,
  respondent_name TEXT,
  respondent_address TEXT,
  incident_type TEXT NOT NULL,
  incident_date DATE NOT NULL,
  incident_time TIME,
  incident_location TEXT NOT NULL,
  narrative TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'filed' CHECK (status IN ('filed', 'under_investigation', 'scheduled_mediation', 'resolved', 'escalated', 'dismissed')),
  assigned_to UUID REFERENCES public.staff(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Blotter counter for sequential numbering
CREATE TABLE IF NOT EXISTS public.blotter_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  current_number INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT blotter_single_row CHECK (id = 1)
);

INSERT INTO public.blotter_counter (id, current_number)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- Function to generate blotter number
CREATE OR REPLACE FUNCTION generate_blotter_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  blotter_num TEXT;
BEGIN
  UPDATE blotter_counter
  SET current_number = current_number + 1
  WHERE id = 1
  RETURNING current_number INTO next_number;
  
  -- Format: BLT-2025-000001
  blotter_num := 'BLT-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(next_number::TEXT, 6, '0');
  
  RETURN blotter_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate blotter number
CREATE OR REPLACE FUNCTION set_blotter_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.blotter_number IS NULL THEN
    NEW.blotter_number := generate_blotter_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_blotter_serial ON blotters;
CREATE TRIGGER generate_blotter_serial
  BEFORE INSERT ON blotters
  FOR EACH ROW
  EXECUTE FUNCTION set_blotter_number();

-- 3. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('general', 'health', 'emergency', 'event', 'notice')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  author_id UUID REFERENCES public.staff(id),
  approved_by UUID REFERENCES public.staff(id),
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DILG REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.dilg_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL CHECK (report_type IN ('certificate_summary', 'blotter_summary', 'financial_summary', 'population_summary')),
  report_period TEXT NOT NULL, -- e.g., '2025-01', '2025-Q1', '2025'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  generated_by UUID REFERENCES public.staff(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type TEXT NOT NULL CHECK (actor_type IN ('resident', 'staff', 'system')),
  actor_id TEXT, -- Can be user ID or staff ID
  actor_name TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- certificate, blotter, announcement, report
  entity_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Update certificates table with additional fields
ALTER TABLE public.certificates 
  ADD COLUMN IF NOT EXISTS age INTEGER,
  ADD COLUMN IF NOT EXISTS purok TEXT,
  ADD COLUMN IF NOT EXISTS years_of_residency INTEGER,
  ADD COLUMN IF NOT EXISTS processed_by UUID REFERENCES public.staff(id),
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.staff(id);

-- 7. INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_blotters_status ON blotters(status);
CREATE INDEX IF NOT EXISTS idx_blotters_created_at ON blotters(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- 8. Views for common queries
CREATE OR REPLACE VIEW public.pending_certificates AS
SELECT * FROM certificates WHERE status IN ('pending', 'processing') ORDER BY created_at ASC;

CREATE OR REPLACE VIEW public.active_blotters AS
SELECT * FROM blotters WHERE status NOT IN ('resolved', 'dismissed') ORDER BY created_at DESC;

CREATE OR REPLACE VIEW public.published_announcements AS
SELECT a.*, s.full_name as author_name
FROM announcements a
LEFT JOIN staff s ON a.author_id = s.id
WHERE a.is_published = true 
  AND (a.expires_at IS NULL OR a.expires_at > NOW())
ORDER BY a.is_pinned DESC, a.published_at DESC;
