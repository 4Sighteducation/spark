-- ============================================================================
-- SPARK Marketing Leads Table
-- For capturing waitlist signups and demo requests
-- ============================================================================

-- Leads table for marketing website
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Lead information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  school TEXT,
  role TEXT,
  
  -- Lead source
  source TEXT NOT NULL, -- 'waitlist' or 'demo'
  
  -- Demo data (if they completed demo)
  demo_completed BOOLEAN DEFAULT false,
  demo_answers JSONB, -- Store questionnaire answers
  demo_scores JSONB, -- Store calculated scores
  demo_completed_at TIMESTAMPTZ,
  
  -- Lead status
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'converted', 'not_interested'
  contacted_at TIMESTAMPTZ,
  contacted_by TEXT,
  notes TEXT,
  
  -- Marketing metadata
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT leads_email_unique UNIQUE(email, source)
);

-- Indexes for lead management
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_leads_demo_completed ON leads(demo_completed) WHERE demo_completed = true;

-- Trigger for updated_at
CREATE TRIGGER update_leads_updated_at 
  BEFORE UPDATE ON leads
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Anyone can insert leads (public form)
CREATE POLICY "Anyone can submit leads"
  ON leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated staff can view leads
CREATE POLICY "Staff can view all leads"
  ON leads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND primary_role IN ('super_admin', 'org_admin')
    )
  );

-- Only authenticated staff can update leads
CREATE POLICY "Staff can update leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND primary_role IN ('super_admin', 'org_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND primary_role IN ('super_admin', 'org_admin')
    )
  );

COMMENT ON TABLE leads IS 'Marketing leads from website waitlist and demo forms';
COMMENT ON COLUMN leads.source IS 'Where the lead came from: waitlist or demo';
COMMENT ON COLUMN leads.demo_answers IS 'Full questionnaire responses if they completed demo';
COMMENT ON COLUMN leads.demo_scores IS 'Calculated SPARK scores if they completed demo';

