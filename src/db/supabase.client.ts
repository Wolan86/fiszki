import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptionsWithName, type CookieOptions } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import type { Database } from '../db/database.types.ts';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const cookieOptions: CookieOptionsWithName = {
  path: '/',
  secure: true,
  httpOnly: true,
  sameSite: 'lax',
};

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey); 

export type SupabaseClient = typeof supabaseClient;

export const DEFAULT_USER_ID = '90a80b86-8672-4560-aa02-6db9c6934fa5';

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(';').map((cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    return { name, value: rest.join('=') };
  });
}

type Cookie = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export const createSupabaseServerInstance = (context: {
  headers: Headers;
  cookies: AstroCookies;
}) => {
  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookieOptions,
      cookies: {
        getAll() {
          return parseCookieHeader(context.headers.get('Cookie') ?? '');
        },
        setAll(cookiesToSet: Array<Cookie>) {
          cookiesToSet.forEach(({ name, value, options }: { 
            name: string;
            value: string;
            options?: CookieOptions;
          }) =>
            context.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  return supabase;
};
