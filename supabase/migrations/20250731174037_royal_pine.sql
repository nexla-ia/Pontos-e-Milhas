/*
  # Fix user role constraint to include client role

  1. Changes
    - Update users_role_check constraint to include 'client' role
    - Allow client users to be created through manual registration

  2. Security
    - Maintain existing RLS policies
    - Keep role validation but expand allowed values
*/

-- Drop existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint with client role included
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role = ANY (ARRAY['admin'::text, 'emissor'::text, 'proprietario'::text, 'client'::text]));