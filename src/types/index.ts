export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalExperience: number;
  currentCompany: string;
  primarySkills: string;
  collegeMarks: number;
  yearPassedOut: number;
  resumeText?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export type Theme = 'light' | 'dark';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}