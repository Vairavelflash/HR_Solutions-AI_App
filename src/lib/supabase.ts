import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface CandidateData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  total_experience: number;
  current_company: string;
  primary_skills: string;
  college_marks: string;
  year_passed_out: number;
  created_at?: string;
  updated_at?: string;
}