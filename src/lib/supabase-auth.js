import { supabase } from "@/integrations/supabase/client";

// App role enum
export const AppRole = {
  ADMIN: "admin",
  DONOR: "donor",
  RECIPIENT: "recipient",
  ANALYST: "analyst",
};

export async function getUserRole(userId) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return data.role;
}

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return data;
}

export async function signUp(
  email,
  password,
  role,
  fullName,
  organizationName
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        full_name: fullName,
        role: role,
        organization_name: organizationName,
      },
    },
  });

  return { data, error };
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

