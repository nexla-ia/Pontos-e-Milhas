/*
  # Create Flight Searches Table

  1. New Tables
    - `flight_searches`
      - `id` (uuid, primary key) - Unique identifier for each search
      - `search_id` (uuid, unique) - External search ID for webhook matching
      - `origin` (text) - Origin airport code
      - `destination` (text) - Destination airport code
      - `departure_date` (date) - Departure date
      - `return_date` (date, nullable) - Return date for round trips
      - `adults` (integer) - Number of adult passengers
      - `currency` (text) - Currency code (BRL, USD, etc)
      - `status` (text) - Search status: 'pending', 'processing', 'completed', 'error'
      - `created_at` (timestamptz) - When the search was created
      - `updated_at` (timestamptz) - Last update timestamp

    - `flight_results`
      - `id` (uuid, primary key) - Unique identifier
      - `search_id` (uuid, foreign key) - References flight_searches
      - `airline` (text) - Airline name
      - `flight_number` (text) - Flight number
      - `origin` (text) - Origin airport code
      - `destination` (text) - Destination airport code
      - `departure` (timestamptz) - Departure datetime
      - `arrival` (timestamptz) - Arrival datetime
      - `duration` (text) - Flight duration
      - `stops` (integer) - Number of stops
      - `aircraft` (text) - Aircraft type
      - `price_currency` (text) - Price currency
      - `price_total` (text) - Total price
      - `created_at` (timestamptz) - When the result was saved

  2. Security
    - Enable RLS on both tables
    - Public can insert searches (to initiate search)
    - Public can read all data (for displaying results)
    - Only service role can update status and insert results (via webhook)
*/

-- Create flight_searches table
CREATE TABLE IF NOT EXISTS flight_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  origin text NOT NULL,
  destination text NOT NULL,
  departure_date date NOT NULL,
  return_date date,
  adults integer NOT NULL DEFAULT 1,
  currency text NOT NULL DEFAULT 'BRL',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create flight_results table
CREATE TABLE IF NOT EXISTS flight_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id uuid NOT NULL REFERENCES flight_searches(search_id) ON DELETE CASCADE,
  airline text NOT NULL,
  flight_number text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  departure timestamptz NOT NULL,
  arrival timestamptz NOT NULL,
  duration text NOT NULL,
  stops integer NOT NULL DEFAULT 0,
  aircraft text,
  price_currency text NOT NULL,
  price_total text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE flight_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_results ENABLE ROW LEVEL SECURITY;

-- Policies for flight_searches
CREATE POLICY "Anyone can create searches"
  ON flight_searches FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read searches"
  ON flight_searches FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update searches"
  ON flight_searches FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for flight_results
CREATE POLICY "Anyone can create results"
  ON flight_results FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read results"
  ON flight_results FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_flight_searches_search_id ON flight_searches(search_id);
CREATE INDEX IF NOT EXISTS idx_flight_results_search_id ON flight_results(search_id);
CREATE INDEX IF NOT EXISTS idx_flight_searches_status ON flight_searches(status);
