-- ============================================================
-- NibbleNet — Supabase Database Schema
-- Run this in the Supabase SQL editor to set up your database.
-- ============================================================

-- ── 1. Profiles table (extends Supabase auth.users) ─────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id                       UUID REFERENCES auth.users PRIMARY KEY,
  name                     TEXT NOT NULL DEFAULT '',
  role                     TEXT NOT NULL DEFAULT 'consumer',
  current_mode             TEXT NOT NULL DEFAULT 'consumer',
  can_provide              BOOLEAN NOT NULL DEFAULT FALSE,
  city                     TEXT,
  zip_code                 TEXT,
  avatar_url               TEXT,
  phone                    TEXT,
  bio                      TEXT,
  allergies                TEXT[] DEFAULT '{}',
  provider_status          TEXT NOT NULL DEFAULT 'none',  -- 'none' | 'pending' | 'approved' | 'rejected'
  provider_type            TEXT,                          -- 'Restaurant' | 'Grocery Store' | 'Household'
  business_name            TEXT,
  business_type            TEXT,
  safety_policy_accepted   BOOLEAN NOT NULL DEFAULT FALSE,
  integrity_policy_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  food_safety_accepted     BOOLEAN NOT NULL DEFAULT FALSE,
  waiver_signed            BOOLEAN NOT NULL DEFAULT FALSE,
  waiver_signed_at         TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create a profile row whenever a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ── 2. Listings table ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.listings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id          UUID REFERENCES auth.users NOT NULL,
  provider_name        TEXT NOT NULL,
  business_name        TEXT NOT NULL,
  business_type        TEXT,
  title                TEXT NOT NULL,
  description          TEXT NOT NULL,
  category             TEXT NOT NULL,
  tags                 TEXT[] DEFAULT '{}',
  allergens            TEXT[] DEFAULT '{}',
  price                NUMERIC(10, 2) NOT NULL,
  original_price       NUMERIC(10, 2),
  quantity             INTEGER NOT NULL,
  quantity_reserved    INTEGER NOT NULL DEFAULT 0,
  status               TEXT NOT NULL DEFAULT 'available',  -- 'available' | 'reserved' | 'sold_out' | 'expired'
  pickup_address       TEXT NOT NULL,
  pickup_city          TEXT NOT NULL,
  pickup_zip           TEXT NOT NULL,
  pickup_lat           NUMERIC(9, 6),
  pickup_lng           NUMERIC(9, 6),
  pickup_start_time    TEXT NOT NULL,
  pickup_end_time      TEXT NOT NULL,
  pickup_instructions  TEXT,
  image_url            TEXT NOT NULL,
  is_rescue_bundle     BOOLEAN DEFAULT FALSE,
  is_community_pantry  BOOLEAN DEFAULT FALSE,
  is_surprise_box      BOOLEAN DEFAULT FALSE,
  surprise_box_size    TEXT,                              -- 'small' | 'medium' | 'large'
  food_condition       TEXT,                              -- 'cooked' | 'uncooked' | 'packaged' | 'perishable' | 'raw' | 'frozen'
  freshness_note       TEXT,
  prepared_at          TIMESTAMPTZ,
  handling_notes       TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at           TIMESTAMPTZ NOT NULL
);

-- ── 3. Reservations table ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reservations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id        UUID REFERENCES public.listings NOT NULL,
  consumer_id       UUID REFERENCES auth.users NOT NULL,
  consumer_name     TEXT NOT NULL,
  quantity          INTEGER NOT NULL,
  total_price       NUMERIC(10, 2) NOT NULL,
  status            TEXT NOT NULL DEFAULT 'confirmed',    -- 'confirmed' | 'picked_up' | 'cancelled' | 'cancelled_at_pickup'
  confirmation_code TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. Row Level Security ────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, self-write
DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;
CREATE POLICY "profiles_read_all"
  ON public.profiles FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "profiles_write_own" ON public.profiles;
CREATE POLICY "profiles_write_own"
  ON public.profiles FOR ALL USING (auth.uid() = id);

-- Listings: public read for available listings, provider manages own
DROP POLICY IF EXISTS "listings_read_available" ON public.listings;
CREATE POLICY "listings_read_available"
  ON public.listings FOR SELECT
  USING (status = 'available' OR provider_id = auth.uid());

DROP POLICY IF EXISTS "listings_insert_provider" ON public.listings;
CREATE POLICY "listings_insert_provider"
  ON public.listings FOR INSERT
  WITH CHECK (provider_id = auth.uid());

DROP POLICY IF EXISTS "listings_update_provider" ON public.listings;
CREATE POLICY "listings_update_provider"
  ON public.listings FOR UPDATE
  USING (provider_id = auth.uid());

DROP POLICY IF EXISTS "listings_delete_provider" ON public.listings;
CREATE POLICY "listings_delete_provider"
  ON public.listings FOR DELETE
  USING (provider_id = auth.uid());

-- Reservations: consumers manage their own
DROP POLICY IF EXISTS "reservations_own" ON public.reservations;
CREATE POLICY "reservations_own"
  ON public.reservations FOR ALL
  USING (consumer_id = auth.uid());

-- Providers can read reservations on their listings
DROP POLICY IF EXISTS "reservations_provider_read" ON public.reservations;
CREATE POLICY "reservations_provider_read"
  ON public.reservations FOR SELECT
  USING (
    listing_id IN (
      SELECT id FROM public.listings WHERE provider_id = auth.uid()
    )
  );

-- ── 5. Helper indexes ─────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS listings_status_idx ON public.listings (status);
CREATE INDEX IF NOT EXISTS listings_provider_id_idx ON public.listings (provider_id);
CREATE INDEX IF NOT EXISTS listings_created_at_idx ON public.listings (created_at DESC);
CREATE INDEX IF NOT EXISTS reservations_consumer_id_idx ON public.reservations (consumer_id);
