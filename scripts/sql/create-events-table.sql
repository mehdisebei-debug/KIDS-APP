-- Crée cette table dans Supabase SQL Editor avant de lancer le script d'import

-- Active PostGIS (nécessaire pour le type GEOGRAPHY)
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS events (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  openagenda_uid   BIGINT UNIQUE,           -- clé d'upsert OpenAgenda
  name             TEXT NOT NULL,
  description      TEXT,
  image_url        TEXT,
  address          TEXT,
  city             TEXT,
  postal_code      TEXT,
  venue_name       TEXT,
  lat              DOUBLE PRECISION,
  lng              DOUBLE PRECISION,
  location         GEOGRAPHY(POINT, 4326),  -- PostGIS (généré automatiquement)
  date_start       TIMESTAMPTZ NOT NULL,
  date_end         TIMESTAMPTZ,
  all_timings      JSONB,
  category         TEXT DEFAULT 'EVENEMENT',
  age_min          INTEGER DEFAULT 0,
  age_max          INTEGER DEFAULT 72,
  price_min        NUMERIC DEFAULT 0,
  price_max        NUMERIC DEFAULT 0,
  source           TEXT DEFAULT 'openagenda',
  verified         BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- Index géospatial pour les requêtes "autour de moi"
CREATE INDEX IF NOT EXISTS events_location_idx ON events USING GIST(location);

-- Index sur les dates pour les requêtes "événements à venir"
CREATE INDEX IF NOT EXISTS events_date_start_idx ON events(date_start);

-- Trigger pour générer automatiquement le champ PostGIS depuis lat/lng
CREATE OR REPLACE FUNCTION update_event_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_event_location
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_event_location();

-- RLS : lecture publique, écriture via service_role uniquement
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events lisibles publiquement"
  ON events FOR SELECT USING (true);

CREATE POLICY "Events modifiables par service_role"
  ON events FOR ALL USING (auth.role() = 'service_role');
