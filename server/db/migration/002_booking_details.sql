ALTER TABLE bookings
  ADD COLUMN booking_reference TEXT NOT NULL UNIQUE,
  ADD COLUMN guest_name        TEXT NOT NULL,
  ADD COLUMN guest_email       TEXT NOT NULL,
  ADD COLUMN guest_phone       TEXT NOT NULL,
  ADD COLUMN special_request   TEXT;