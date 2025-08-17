import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';
import type { AuthState, AuthUser } from '../lib/auth';

export function useAuth(): AuthState & {
  signOut: () => Promise<void>;
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setState({
            user: null,
            session: null,
            loading: false,
          });
          return;
        }
      
        if (session?.user) {
          const user = await getCurrentUser();
          setState({
            user,
            session,
            loading: false,
          });
        } else {
          setState({
            user: null,
            session: null,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        setState({
          user: null,
          session: null,
          loading: false,
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            const user = await getCurrentUser();
            setState({
              user,
              session,
              loading: false,
            });
          } else {
            setState({
              user: null,
              session: null,
              loading: false,
            });
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setState({
            user: null,
            session: null,
            loading: false,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    ...state,
    signOut,
  };
}