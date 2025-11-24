/*
  # FarmExchange Database Schema

  ## Overview
  This migration creates the complete database schema for the FarmExchange platform,
  connecting farmers and gardeners with their local communities.

  ## New Tables

  ### 1. profiles
  Extends Supabase auth.users with additional user information
  - `id` (uuid, primary key, references auth.users)
  - `full_name` (text) - User's full name
  - `user_type` (text) - Either 'farmer' or 'buyer'
  - `location` (text) - User's location/address
  - `phone` (text) - Contact phone number
  - `bio` (text) - User description
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. harvests
  Stores harvest listings created by farmers/gardeners
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles) - Owner of the harvest
  - `title` (text) - Harvest title/name
  - `description` (text) - Detailed description
  - `category` (text) - Type of produce (vegetables, fruits, herbs, etc.)
  - `price` (numeric) - Price per unit
  - `unit` (text) - Unit of measurement (kg, lbs, bunch, etc.)
  - `quantity_available` (numeric) - Available quantity
  - `image_url` (text) - Product image URL
  - `status` (text) - 'available', 'sold_out', or 'archived'
  - `harvest_date` (date) - When the produce was harvested
  - `created_at` (timestamptz) - Listing creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. messages
  Enables direct communication between buyers and sellers
  - `id` (uuid, primary key)
  - `sender_id` (uuid, references profiles) - Message sender
  - `recipient_id` (uuid, references profiles) - Message recipient
  - `harvest_id` (uuid, references harvests, optional) - Related harvest
  - `subject` (text) - Message subject
  - `content` (text) - Message body
  - `is_read` (boolean) - Read status
  - `created_at` (timestamptz) - Message timestamp

  ### 4. transactions
  Tracks purchase transactions between buyers and sellers
  - `id` (uuid, primary key)
  - `harvest_id` (uuid, references harvests) - Purchased harvest
  - `buyer_id` (uuid, references profiles) - Buyer user
  - `seller_id` (uuid, references profiles) - Seller user
  - `quantity` (numeric) - Quantity purchased
  - `total_price` (numeric) - Total transaction amount
  - `status` (text) - 'pending', 'completed', or 'cancelled'
  - `transaction_date` (timestamptz) - Transaction timestamp
  - `notes` (text) - Additional notes

  ## Security

  All tables have Row Level Security (RLS) enabled with policies that:
  - Allow users to read their own data
  - Allow users to create their own records
  - Allow users to update/delete only their own records
  - Enable public browsing of available harvests
  - Allow message participants to view their conversations

  ## Important Notes

  1. Data Safety: All operations use IF NOT EXISTS to prevent errors
  2. Default Values: Timestamps default to now(), booleans to false
  3. Cascading: Foreign keys cascade on delete where appropriate
  4. Indexes: Added on frequently queried columns for performance
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  user_type text NOT NULL DEFAULT 'buyer' CHECK (user_type IN ('farmer', 'buyer')),
  location text,
  phone text,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create harvests table
CREATE TABLE IF NOT EXISTS harvests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  price numeric(10, 2) NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'kg',
  quantity_available numeric(10, 2) NOT NULL DEFAULT 0,
  image_url text,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold_out', 'archived')),
  harvest_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  harvest_id uuid REFERENCES harvests(id) ON DELETE SET NULL,
  subject text NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  harvest_id uuid NOT NULL REFERENCES harvests(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quantity numeric(10, 2) NOT NULL,
  total_price numeric(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  transaction_date timestamptz DEFAULT now(),
  notes text
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Harvests policies
CREATE POLICY "Anyone can view available harvests"
  ON harvests FOR SELECT
  TO authenticated
  USING (status = 'available' OR user_id = auth.uid());

CREATE POLICY "Users can insert own harvests"
  ON harvests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own harvests"
  ON harvests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own harvests"
  ON harvests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages they sent or received"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- Transactions policies
CREATE POLICY "Users can view their transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Transaction participants can update status"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id)
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_harvests_user_id ON harvests(user_id);
CREATE INDEX IF NOT EXISTS idx_harvests_status ON harvests(status);
CREATE INDEX IF NOT EXISTS idx_harvests_category ON harvests(category);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_harvests_updated_at
  BEFORE UPDATE ON harvests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();