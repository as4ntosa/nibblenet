-- ================================================================
-- NibbleNet — Initial Schema
-- ================================================================

-- ── 1. Profiles (extends auth.users) ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                        UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name                      TEXT NOT NULL DEFAULT '',
  role                      TEXT NOT NULL DEFAULT 'consumer'
                              CHECK (role IN ('consumer', 'provider')),
  current_mode              TEXT NOT NULL DEFAULT 'consumer'
                              CHECK (current_mode IN ('consumer', 'provider')),
  can_provide               BOOLEAN NOT NULL DEFAULT FALSE,
  city                      TEXT,
  zip_code                  TEXT,
  avatar_url                TEXT,
  phone                     TEXT,
  bio                       TEXT,
  allergies                 TEXT[] DEFAULT '{}',
  provider_status           TEXT NOT NULL DEFAULT 'none'
                              CHECK (provider_status IN ('none', 'pending', 'approved', 'rejected')),
  provider_type             TEXT
                              CHECK (provider_type IN ('Restaurant', 'Grocery Store', 'Household')),
  business_name             TEXT,
  business_type             TEXT,
  safety_policy_accepted    BOOLEAN NOT NULL DEFAULT FALSE,
  integrity_policy_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  food_safety_accepted      BOOLEAN NOT NULL DEFAULT FALSE,
  waiver_signed             BOOLEAN NOT NULL DEFAULT FALSE,
  waiver_signed_at          TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on new auth user
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

-- ── 2. Listings ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.listings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id          UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  provider_name        TEXT NOT NULL,
  business_name        TEXT NOT NULL,
  business_type        TEXT,
  title                TEXT NOT NULL,
  description          TEXT NOT NULL,
  category             TEXT NOT NULL
                         CHECK (category IN ('Fruits','Vegetables','Baked Goods','Meals','Drinks','Snacks','Dairy','Pantry Goods')),
  tags                 TEXT[] DEFAULT '{}',
  allergens            TEXT[] DEFAULT '{}',
  price                NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  original_price       NUMERIC(10,2),
  quantity             INTEGER NOT NULL CHECK (quantity > 0),
  quantity_reserved    INTEGER NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  status               TEXT NOT NULL DEFAULT 'available'
                         CHECK (status IN ('available','reserved','sold_out','expired')),
  pickup_address       TEXT NOT NULL,
  pickup_city          TEXT NOT NULL,
  pickup_zip           TEXT NOT NULL,
  pickup_lat           NUMERIC(9,6),
  pickup_lng           NUMERIC(9,6),
  pickup_start_time    TEXT NOT NULL,
  pickup_end_time      TEXT NOT NULL,
  pickup_instructions  TEXT,
  image_url            TEXT NOT NULL,
  is_rescue_bundle     BOOLEAN DEFAULT FALSE,
  is_community_pantry  BOOLEAN DEFAULT FALSE,
  is_surprise_box      BOOLEAN DEFAULT FALSE,
  surprise_box_size    TEXT CHECK (surprise_box_size IN ('small','medium','large')),
  is_donation          BOOLEAN DEFAULT FALSE,
  is_event             BOOLEAN DEFAULT FALSE,
  event_date           TIMESTAMPTZ,
  food_condition       TEXT CHECK (food_condition IN ('cooked','uncooked','packaged','perishable','raw','frozen')),
  freshness_note       TEXT,
  prepared_at          TIMESTAMPTZ,
  handling_notes       TEXT,
  provider_badges      TEXT[] DEFAULT '{}',
  is_sample            BOOLEAN DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at           TIMESTAMPTZ NOT NULL
);

-- ── 3. Reservations ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reservations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id        UUID REFERENCES public.listings ON DELETE RESTRICT NOT NULL,
  listing_snapshot  JSONB,
  consumer_id       UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  consumer_name     TEXT NOT NULL,
  quantity          INTEGER NOT NULL CHECK (quantity > 0),
  total_price       NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  status            TEXT NOT NULL DEFAULT 'confirmed'
                      CHECK (status IN ('confirmed','picked_up','cancelled','cancelled_at_pickup')),
  confirmation_code TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. Row Level Security ──────────────────────────────────────────
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- profiles: public read, self write
DROP POLICY IF EXISTS "profiles_read_all"  ON public.profiles;
CREATE POLICY "profiles_read_all"
  ON public.profiles FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "profiles_write_own" ON public.profiles;
CREATE POLICY "profiles_write_own"
  ON public.profiles FOR ALL USING (auth.uid() = id);

-- listings: public can read available listings; providers manage own
DROP POLICY IF EXISTS "listings_read"   ON public.listings;
CREATE POLICY "listings_read"
  ON public.listings FOR SELECT
  USING (status = 'available' OR provider_id = auth.uid());

DROP POLICY IF EXISTS "listings_insert" ON public.listings;
CREATE POLICY "listings_insert"
  ON public.listings FOR INSERT
  WITH CHECK (provider_id = auth.uid());

DROP POLICY IF EXISTS "listings_update" ON public.listings;
CREATE POLICY "listings_update"
  ON public.listings FOR UPDATE
  USING (provider_id = auth.uid());

DROP POLICY IF EXISTS "listings_delete" ON public.listings;
CREATE POLICY "listings_delete"
  ON public.listings FOR DELETE
  USING (provider_id = auth.uid());

-- reservations: consumers manage own; providers read for their listings
DROP POLICY IF EXISTS "reservations_consumer" ON public.reservations;
CREATE POLICY "reservations_consumer"
  ON public.reservations FOR ALL
  USING (consumer_id = auth.uid());

DROP POLICY IF EXISTS "reservations_provider_read" ON public.reservations;
CREATE POLICY "reservations_provider_read"
  ON public.reservations FOR SELECT
  USING (
    listing_id IN (
      SELECT id FROM public.listings WHERE provider_id = auth.uid()
    )
  );

-- ── 5. Indexes ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS listings_status_idx        ON public.listings (status);
CREATE INDEX IF NOT EXISTS listings_provider_id_idx   ON public.listings (provider_id);
CREATE INDEX IF NOT EXISTS listings_city_idx          ON public.listings (pickup_city);
CREATE INDEX IF NOT EXISTS listings_expires_at_idx    ON public.listings (expires_at);
CREATE INDEX IF NOT EXISTS listings_created_at_idx    ON public.listings (created_at DESC);
CREATE INDEX IF NOT EXISTS reservations_consumer_idx  ON public.reservations (consumer_id);
CREATE INDEX IF NOT EXISTS reservations_listing_idx   ON public.reservations (listing_id);
