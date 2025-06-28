/*
  # Create hr_solns_app table for candidate data

  1. New Tables
    - `hr_solns_app`
      - `id` (uuid, primary key)
      - `name` (text, candidate name)
      - `email` (text, candidate email)
      - `phone` (text, candidate phone)
      - `total_experience` (integer, years of experience)
      - `current_company` (text, current company name)
      - `primary_skills` (text, comma-separated skills)
      - `college_marks` (text, marks/grades in original format)
      - `year_passed_out` (integer, graduation year)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `hr_solns_app` table
    - Add policy for authenticated users to manage candidate data
*/

CREATE TABLE IF NOT EXISTS hr_solns_app (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  total_experience integer NOT NULL DEFAULT 0,
  current_company text NOT NULL DEFAULT '',
  primary_skills text NOT NULL DEFAULT '',
  college_marks text NOT NULL DEFAULT '',
  year_passed_out integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hr_solns_app ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage candidate data"
  ON hr_solns_app
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_hr_solns_app_updated_at
  BEFORE UPDATE ON hr_solns_app
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();