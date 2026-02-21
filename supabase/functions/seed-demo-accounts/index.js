import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const demoAccounts = [
    { email: "demo.admin@foodsaver.app", password: "demo1234", role: "admin", full_name: "Demo Admin", organization_name: null },
    { email: "demo.donor@foodsaver.app", password: "demo1234", role: "donor", full_name: "Demo Donor", organization_name: null },
    { email: "demo.recipient@foodsaver.app", password: "demo1234", role: "recipient", full_name: "Demo Recipient", organization_name: "City Food Bank" },
    { email: "demo.analyst@foodsaver.app", password: "demo1234", role: "analyst", full_name: "Demo Analyst", organization_name: "FoodSaver Analytics" },
  ];

  const results = [];

  for (const account of demoAccounts) {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const exists = existingUsers?.users?.some((u: any) => u.email === account.email);

    if (exists) {
      results.push({ email: account.email, status: "already_exists" });
      continue;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        full_name: account.full_name,
        organization_name: account.organization_name,
        role: account.role,
      },
    });

    if (error) {
      results.push({ email: account.email, status: "error", error: error.message });
    } else {
      results.push({ email: account.email, status: "created", id: data.user.id });
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
