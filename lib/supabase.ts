import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Create placeholder clients if env vars are missing (for build time)
const createSafeClient = (url: string, key: string) => {
  if (!url || !key) {
    // Return dummy client for build time
    return createClient("https://placeholder.supabase.co", "placeholder-key");
  }
  return createClient(url, key);
};

// Client-side Supabase client
export const supabase = createSafeClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role (for admin operations)
export const supabaseAdmin = createSafeClient(supabaseUrl, supabaseServiceRoleKey);

// Auth helper functions
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signInWithGitHub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
}

export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  return { session, error };
}
