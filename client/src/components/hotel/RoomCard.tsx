import type { RoomType } from '../../types/hotel';
import Text from '../ui/Text';
import Button from '../ui/Button';

export default function RoomCard({ room }: { room: RoomType }) {
  return (
    <article className="room-card">
      <div className="room-image">Photo</div>
      <div className="room-info">
        <Text variant="subheading">{room.name}</Text>
        {room.description && <Text variant="caption">{room.description}</Text>}
        <Text variant="caption">Sleeps {room.capacity}</Text>
      </div>
      <div className="room-price">
        <Text variant="caption">1 night</Text>
        <strong className="price">R{Number(room.price_per_night).toLocaleString('en-ZA')}</strong>
        <Button>Select room</Button>
      </div>
    </article>
  );
}