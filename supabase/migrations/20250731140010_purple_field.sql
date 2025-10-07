/*
  # Create missing tables for Pontos & Milhas system

  1. New Tables
    - `companies` - Airline companies with detailed configuration
    - `agency_profiles` - Agency profile templates
    - `contacts` - Support contacts
    - `order_items` - Items within orders (passengers, routes, etc.)
    - `user_profiles` - Extended user profile data
    - `search_logs` - System search tracking

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users

  3. Indexes
    - Add performance indexes for frequently queried columns
*/

-- Companies table (airline companies)
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  service_fee numeric DEFAULT 0,
  colo_fee numeric DEFAULT 0,
  refund_fine numeric DEFAULT 0,
  refund_fine_intl numeric DEFAULT 0,
  hours_to_emission integer DEFAULT 0,
  hours_exhausted_message text,
  cancellation_fine numeric DEFAULT 0,
  cancellation_fine_intl numeric DEFAULT 0,
  boarding_fee_national numeric DEFAULT 0,
  boarding_fee_international numeric DEFAULT 0,
  nationality text NOT NULL,
  currency text NOT NULL,
  currency_rate numeric,
  auto_update_rate boolean DEFAULT false,
  conversion_rate text,
  disable_search boolean DEFAULT false,
  exclude_from_report boolean DEFAULT false,
  company_agreement boolean DEFAULT false,
  mandatory_attachment boolean DEFAULT false,
  miles_rates jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Agency profiles table
CREATE TABLE IF NOT EXISTS agency_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  charge_methods text[] DEFAULT '{}',
  markup_allowed text[] DEFAULT '{}',
  issue_methods jsonb DEFAULT '{}'::jsonb,
  visibility jsonb DEFAULT '{}'::jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  department text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Order items table (passengers, routes, etc.)
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('passenger', 'route', 'service')),
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- User profiles table (extended user data)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  birth_date date,
  cpf text,
  rg text,
  gender text,
  position text,
  address jsonb,
  contacts jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Search logs table
CREATE TABLE IF NOT EXISTS search_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  agency_id uuid REFERENCES agencies(id),
  search_params jsonb NOT NULL,
  results_count integer DEFAULT 0,
  search_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage companies"
  ON companies
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage agency profiles"
  ON agency_profiles
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage contacts"
  ON contacts
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage order items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage user profiles"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage search logs"
  ON search_logs
  FOR ALL
  TO authenticated
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS companies_code_idx ON companies(code);
CREATE INDEX IF NOT EXISTS companies_nationality_idx ON companies(nationality);
CREATE INDEX IF NOT EXISTS agency_profiles_active_idx ON agency_profiles(active);
CREATE INDEX IF NOT EXISTS contacts_email_idx ON contacts(email);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_type_idx ON order_items(type);
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS search_logs_date_idx ON search_logs(search_date);
CREATE INDEX IF NOT EXISTS search_logs_agency_idx ON search_logs(agency_id);

-- Add missing columns to existing tables
DO $$
BEGIN
  -- Add missing columns to agencies table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agencies' AND column_name = 'is_blocked'
  ) THEN
    ALTER TABLE agencies ADD COLUMN is_blocked boolean DEFAULT false;
  END IF;

  -- Add missing columns to users table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'active'
  ) THEN
    ALTER TABLE users ADD COLUMN active boolean DEFAULT true;
  END IF;

  -- Add missing columns to operators table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'operators' AND column_name = 'active'
  ) THEN
    ALTER TABLE operators ADD COLUMN active boolean DEFAULT true;
  END IF;
END $$;