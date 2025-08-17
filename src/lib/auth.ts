import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser extends User {
  profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    preferences: any;
  };
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
}

// Sign up with email and password
export const signUp = async (email: string, password: string, fullName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;
  return data;
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Get current user with profile
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return {
    ...user,
    profile,
  };
};

// Update user profile
export const updateProfile = async (updates: {
  full_name?: string;
  avatar_url?: string;
  preferences?: any;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Reset password
export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
};

// Update password
export const updatePassword = async (password: string) => {
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) throw error;
};