-- Verification logs to track when IDs are scanned/verified
CREATE TABLE IF NOT EXISTS public.qrt_verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qrt_id UUID REFERENCES public.qrt_ids(id) ON DELETE CASCADE,
  qrt_code TEXT NOT NULL,
  verified_by TEXT,
  action TEXT NOT NULL DEFAULT 'qrt_verification',
  verification_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_verification_logs_qrt_code ON public.qrt_verification_logs(qrt_code);
CREATE INDEX IF NOT EXISTS idx_verification_logs_qrt_id ON public.qrt_verification_logs(qrt_id);

-- Enable Row Level Security
ALTER TABLE public.qrt_verification_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert verification logs
CREATE POLICY "Allow public insert" ON public.qrt_verification_logs
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow anyone to read verification logs
CREATE POLICY "Allow public read" ON public.qrt_verification_logs
  FOR SELECT
  USING (true);
