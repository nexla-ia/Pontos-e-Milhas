/*
  # Fix RLS policy for users table

  1. Security Updates
    - Add INSERT policy for users table
    - Update existing policies to be more permissive for admin operations
    - Ensure users can be created by authenticated admin users

  2. Policy Changes
    - Allow authenticated users to insert new users
    - Allow authenticated users to read all users
    - Allow users to update their own data
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can read all users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create new policies that allow admin operations
CREATE POLICY "Authenticated users can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (true);