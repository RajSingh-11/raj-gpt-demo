import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Message {
  id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: any[];
  images?: string[];
  persona?: string;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  web_search: boolean;
  voice: boolean;
  persona?: string;
  music?: string;
  game_mode: boolean;
  languages: string[];
  theme: string;
  personalised_panel_open: boolean;
  updated_at: string;
}

// Database functions
export const saveMessage = async (message: Omit<Message, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([message])
    .select()
    .single();
  
  if (error) {
    console.error('Error saving message:', error);
    return null;
  }
  
  return data;
};

export const getMessages = async (userId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  
  return data;
};

export const saveUserSettings = async (settings: Omit<UserSettings, 'id' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert([settings], { onConflict: 'user_id' })
    .select()
    .single();
  
  if (error) {
    console.error('Error saving settings:', error);
    return null;
  }
  
  return data;
};

export const getUserSettings = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
  
  return data;
};