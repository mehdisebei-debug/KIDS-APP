-- Crée les tables activities (publiées) et activities_drafts (brouillons d'ingestion)
-- dans Supabase SQL Editor (issue #13). Exécution manuelle, dans l'ordre du fichier :
-- activities d'abord, puis activities_drafts (clé étrangère published_activity_id).
-- Âges en mois (age_min / age_max), point PostGIS `location` généré par trigger.
-- Ré-exécutable : le script peut être relancé sans erreur (IF NOT EXISTS,
-- CREATE OR REPLACE, DROP TRIGGER/POLICY IF EXISTS avant chaque création).

-- À exécuter dans le SQL Editor Supabase
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigger partagé : génère le point PostGIS depuis lat/lng + met à jour updated_at
CREATE OR REPLACE FUNCTION update_activity_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  ELSE
    -- lat ou lng absent : on efface le point pour ne pas garder une position obsolète
    NEW.location = NULL;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, extensions;

-- =====================================================================
-- 1. activities : activités PUBLIÉES (visibles par les parents)
--    Champs obligatoires = garde-fou : on ne publie pas une fiche incomplète
-- =====================================================================
CREATE TABLE IF NOT EXISTS activities (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name             TEXT NOT NULL,
  description      TEXT,
  category         TEXT NOT NULL
                   CHECK (category IN ('PARC','SPECTACLE','ATELIER','AIRE_JEUX','RESTAURANT','EVENEMENT')),
  age_min          INTEGER NOT NULL CHECK (age_min >= 0),     -- en mois
  age_max          INTEGER NOT NULL CHECK (age_max >= 0 AND age_max <= 216),   -- en mois
  price_min        NUMERIC NOT NULL CHECK (price_min >= 0),   -- 0 = gratuit
  price_max        NUMERIC NOT NULL CHECK (price_max >= 0),
  address          TEXT NOT NULL,
  city             TEXT,
  postal_code      TEXT,
  venue_name       TEXT,
  lat              DOUBLE PRECISION NOT NULL,
  lng              DOUBLE PRECISION NOT NULL,
  location         GEOGRAPHY(POINT, 4326),                    -- rempli par trigger
  opening_hours    JSONB NOT NULL DEFAULT '{}',
  date_start       TIMESTAMPTZ,                               -- événements ponctuels uniquement
  date_end         TIMESTAMPTZ,
  tags             TEXT[] NOT NULL DEFAULT '{}',
  images           TEXT[] NOT NULL DEFAULT '{}',
  avg_rating       NUMERIC NOT NULL DEFAULT 0,
  reviews_count    INTEGER NOT NULL DEFAULT 0,
  verified         BOOLEAN NOT NULL DEFAULT false,
  source           TEXT NOT NULL DEFAULT 'manuel',
  source_url       TEXT UNIQUE,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now(),
  CHECK (age_min <= age_max),
  CHECK (price_min <= price_max)
);

CREATE INDEX IF NOT EXISTS activities_location_idx  ON activities USING GIST(location);
CREATE INDEX IF NOT EXISTS activities_category_idx  ON activities(category);
CREATE INDEX IF NOT EXISTS activities_name_trgm_idx ON activities USING GIN(name gin_trgm_ops);

DROP TRIGGER IF EXISTS set_activity_location ON activities;
CREATE TRIGGER set_activity_location
  BEFORE INSERT OR UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_activity_location();

-- RLS : lecture publique, écriture via service_role uniquement (bypass RLS)
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Activities lisibles publiquement" ON activities;
CREATE POLICY "Activities lisibles publiquement"
  ON activities FOR SELECT USING (true);

-- =====================================================================
-- 2. activities_drafts : BROUILLONS issus de l'ingestion (jamais publics)
--    Mêmes colonnes que activities, mais tout est nullable : un champ
--    inconnu reste NULL (règle « ne jamais inventer »)
-- =====================================================================
CREATE TABLE IF NOT EXISTS activities_drafts (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Champs miroir de activities
  name             TEXT NOT NULL,
  description      TEXT,
  category         TEXT CHECK (category IN ('PARC','SPECTACLE','ATELIER','AIRE_JEUX','RESTAURANT','EVENEMENT')),
  age_min          INTEGER CHECK (age_min >= 0),              -- en mois
  age_max          INTEGER CHECK (age_max >= 0 AND age_max <= 216),            -- en mois
  price_min        NUMERIC CHECK (price_min >= 0),            -- NULL = inconnu, 0 = gratuit
  price_max        NUMERIC CHECK (price_max >= 0),
  address          TEXT,
  city             TEXT,
  postal_code      TEXT,
  venue_name       TEXT,
  lat              DOUBLE PRECISION,
  lng              DOUBLE PRECISION,
  location         GEOGRAPHY(POINT, 4326),
  opening_hours    JSONB,
  date_start       TIMESTAMPTZ,
  date_end         TIMESTAMPTZ,
  tags             TEXT[] NOT NULL DEFAULT '{}',
  images           TEXT[] NOT NULL DEFAULT '{}',
  source           TEXT NOT NULL DEFAULT 'claude_projet',
  source_url       TEXT UNIQUE,                               -- anti-doublon (NULL autorisé : captures sans lien)
  -- Champs propres au brouillon
  status           TEXT NOT NULL DEFAULT 'a_valider'
                   CHECK (status IN ('a_valider','publie','rejete')),
  input_type       TEXT CHECK (input_type IN ('lien','capture','legende')),
  raw_text         TEXT,                                      -- texte brut extrait, pour audit
  missing_fields   TEXT[] NOT NULL DEFAULT '{}',
  review_notes     TEXT,
  published_activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now(),
  CHECK (age_min IS NULL OR age_max IS NULL OR age_min <= age_max),
  CHECK (price_min IS NULL OR price_max IS NULL OR price_min <= price_max)
);

CREATE INDEX IF NOT EXISTS activities_drafts_status_idx    ON activities_drafts(status);
CREATE INDEX IF NOT EXISTS activities_drafts_location_idx  ON activities_drafts USING GIST(location);
-- Doublons probables sans lien (captures) : similarité sur le nom
CREATE INDEX IF NOT EXISTS activities_drafts_name_trgm_idx ON activities_drafts USING GIN(name gin_trgm_ops);

DROP TRIGGER IF EXISTS set_draft_location ON activities_drafts;
CREATE TRIGGER set_draft_location
  BEFORE INSERT OR UPDATE ON activities_drafts
  FOR EACH ROW EXECUTE FUNCTION update_activity_location();

-- RLS activée SANS AUCUNE policy : ni anon ni authenticated ne peuvent lire/écrire.
-- Seuls service_role et le connecteur Supabase (rôle postgres) y accèdent.
ALTER TABLE activities_drafts ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- Publication d'un brouillon (manuel, Étape 1) — à exécuter à la demande,
-- PAS lors de la création des tables. Décommenter puis remplacer <draft-id>.
-- =====================================================================
-- -- Remplacer <draft-id>. Échoue volontairement si un champ obligatoire manque.
-- WITH published AS (
--   INSERT INTO activities (name, description, category, age_min, age_max, price_min, price_max,
--                           address, city, postal_code, venue_name, lat, lng, opening_hours,
--                           date_start, date_end, tags, images, source, source_url)
--   SELECT name, description, category, age_min, age_max, price_min, price_max,
--          address, city, postal_code, venue_name, lat, lng, COALESCE(opening_hours, '{}'),
--          date_start, date_end, tags, images, source, source_url
--   FROM activities_drafts
--   WHERE id = '<draft-id>' AND status = 'a_valider'
--   RETURNING id
-- )
-- UPDATE activities_drafts d
-- SET status = 'publie', published_activity_id = p.id
-- FROM published p
-- WHERE d.id = '<draft-id>';
