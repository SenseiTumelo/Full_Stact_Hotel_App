CREATE TABLE IF NOT EXISTS room_type_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  position     SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_room_type_images_room_position ON room_type_images (room_type_id, position);
