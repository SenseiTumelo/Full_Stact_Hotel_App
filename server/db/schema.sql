

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT NOT NULL,
  phone         TEXT,
  avatar_url    TEXT,
  role          user_role NOT NULL DEFAULT 'guest',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);

CREATE TABLE oauth_accounts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider         TEXT NOT NULL,                  
  provider_user_id TEXT NOT NULL,
  UNIQUE (provider, provider_user_id)
);

CREATE TABLE hotels (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  address      TEXT NOT NULL,
  city         TEXT NOT NULL,
  country      TEXT NOT NULL,
  latitude     NUMERIC(9,6) NOT NULL,
  longitude    NUMERIC(9,6) NOT NULL,
  star_rating  SMALLINT CHECK (star_rating BETWEEN 1 AND 5),
  policies     TEXT,                               -- check-in/out times, cancellation, pets
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE hotel_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id   UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  position   SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE room_types (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id        UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,                   -- 'Deluxe King'
  capacity        SMALLINT NOT NULL CHECK (capacity > 0),
  price_per_night NUMERIC(10,2) NOT NULL CHECK (price_per_night >= 0),
  currency        CHAR(3) NOT NULL DEFAULT 'ZAR',
  total_rooms     SMALLINT NOT NULL CHECK (total_rooms >= 0),
  description     TEXT
);