import type { RoomType } from '../../types/hotel';
import Text from '../ui/Text';
import Button from '../ui/Button';

type RoomCardProps = {
  room: RoomType;
  actionLabel?: string;
  onSelect?: () => void;
  disabled?: boolean;
  note?: string;
};

export default function RoomCard({
  room,
  actionLabel = 'Select room',
  onSelect,
  disabled = false,
  note,
}: RoomCardProps) {
  return (
    <article className="room-card">
      <div className="room-image">Photo</div>
      <div className="room-info">
        <Text variant="subheading">{room.name}</Text>
        {room.description && <Text variant="caption">{room.description}</Text>}
        <Text variant="caption">Sleeps {room.capacity}</Text>
      </div>
      <div className="room-price">
        <Text variant="caption">per night</Text>
        <strong className="price">R{Number(room.price_per_night).toLocaleString('en-ZA')}</strong>
        <Button onClick={onSelect} disabled={disabled}>{actionLabel}</Button>
        {note && <Text variant="caption">{note}</Text>}
      </div>
    </article>
  );
}