INSERT INTO amenities (name) VALUES
  ('Air conditioning'),
  ('Balcony'),
  ('Breakfast included'),
  ('Family rooms'),
  ('Free parking'),
  ('Gym'),
  ('Kitchen'),
  ('Restaurant'),
  ('Room service'),
  ('Spa'),
  ('Swimming pool'),
  ('TV'),
  ('Wi-Fi')
ON CONFLICT (name) DO NOTHING;
