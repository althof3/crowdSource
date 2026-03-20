import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Report = {
  id: string;
  reporter_wallet: string;
  category: 'pothole' | 'crime';
  provinsi_id: number;
  lat: number;
  lng: number;
  photo_url: string;
  upvote_count: number;
  status: 'pending' | 'confirmed' | 'rejected';
  solana_tx?: string;
  created_at: string;
};

export type Sayembara = {
  id: string;
  author_wallet: string;
  title: string;
  category: 'pothole' | 'crime' | 'both';
  provinsi_id: number;
  total_deposit: number;
  deadline: string;
  status: 'active' | 'distributed';
  confirmed_count: number;
  reward_per_report?: number;
  distribute_tx?: string;
  solana_escrow_pda: string;
  created_at: string;
};

export type Profile = {
  id: string;
  wallet: string;
  is_verified_org: boolean;
  reputation: number;
  created_at: string;
};
