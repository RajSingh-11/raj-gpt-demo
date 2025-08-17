/*
  # Create user_settings table

  1. New Tables
    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `web_search` (boolean, default false)
      - `voice` (boolean, default false)
      - `persona` (text, nullable)
      - `music` (text, nullable)
      - `game_mode` (boolean, default false)
      - `languages` (text array, default ['EN'])
      - `theme` (text, default 'ironMan')
      - `personalised_panel_open` (boolean, default true)
      - `updated_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `user_settings` table
    - Add policies for users to manage their own settings
*/

CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  web_search boolean DEFAULT FALSE NOT NULL,
  voice boolean DEFAULT FALSE NOT NULL,
  persona text,
  music text,
  game_mode boolean DEFAULT FALSE NOT NULL,
  languages text[] DEFAULT ARRAY['EN']::text[] NOT NULL,
  theme text DEFAULT 'ironMan' NOT NULL,
  personalised_panel_open boolean DEFAULT TRUE NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);