import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppRole, getUserRole } from "@/lib/supabase-auth";

export function useAuth() {
  const [state, setState] = useState({
    user: null,
    session: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        let role = null;

        if (session?.user) {
          // Defer Supabase calls with setTimeout to avoid deadlock
          setTimeout(async () => {
            role = await getUserRole(session.user.id);
            // fallback to role stored in user metadata (set during signUp)
            if (!role) role = session.user.user_metadata?.role || null;
            setState({
              user: session.user,
              session: session,
              role: role,
              loading: false,
            });
          }, 0);
        } else {
          setState({
            user: null,
            session: null,
            role: null,
            loading: false,
          });
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        let role = await getUserRole(session.user.id);
        // fallback to role stored in user metadata (set during signUp)
        if (!role) role = session.user.user_metadata?.role || null;
        setState({
          user: session.user,
          session: session,
          role: role,
          loading: false,
        });
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}

