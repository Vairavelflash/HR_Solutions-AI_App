import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  throw new Error('Missing Supabase environment variables. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid VITE_SUPABASE_URL format:', supabaseUrl);
  throw new Error('Invalid VITE_SUPABASE_URL format. Please ensure it starts with https://');
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