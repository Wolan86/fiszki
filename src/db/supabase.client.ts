import { createClient } from '@supabase/supabase-js';

import type { Database } from '../db/database.types.ts';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey); 

export type SupabaseClient = typeof supabaseClient;

export const DEFAULT_USER_ID = '90a80b86-8672-4560-aa02-6db9c6934fa5';
