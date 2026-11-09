import { useState } from 'react';
import type { RoomType } from '../../types/hotel';
import Text from '../ui/Text';
import Button from '../ui/Button';
import { BedDouble, Check } from 'lucide-react';
import { imageUrl } from '../../utils/imageUrl';

type RoomCardProps = {
  room: RoomType;
  actionLabel?: string;
  onSelect?: () => void;
  disabled?: boolean;
  note?: string;
  selected?: boolean;
};

export default function RoomCard({
  room,
  actionLabel = 'Select room',
  onSelect,
  disabled = false,
  note,
  selected = false,
}: RoomCardProps) {
  const [activeImage, setActiveImage] = useState(0);
  const images = room.images ?? [];

  return (
    <article className={selected ? 'room-card room-card-selected' : 'room-card'}>
      <div className="room-gallery">
        <div className="room-image">
          {images[activeImage] ? <img src={imageUrl(images[activeImage].url)} alt={`${room.name}, photo ${activeImage + 1} of ${images.length}`} loading="lazy" /> : <BedDouble size={28} aria-hidden="true" />}
          {images.length > 1 && <span className="room-image-count">{activeImage + 1} / {images.length}</span>}
        </div>
        {images.length > 1 && <div className="room-image-thumbs" role="group" aria-label={`${room.name} photos`}>
          {images.map((image, index) => <button key={image.id} type="button" aria-label={`Show ${room.name} photo ${index + 1}`} aria-current={activeImage === index} onClick={() => setActiveImage(index)}>
            <img src={imageUrl(image.url)} alt="" loading="lazy" />
          </button>)}
        </div>}
      </div>
      <div className="room-info">
        <Text variant="subheading">{room.name}</Text>
        {room.description && <Text variant="caption">{room.description}</Text>}
        <Text variant="caption">Sleeps {room.capacity}</Text>
      </div>
      <div className="room-price">
        <Text variant="caption">per night</Text>
        <strong className="price">R{Number(room.price_per_night).toLocaleString('en-ZA')}</strong>
        <Button
          variant={selected ? 'dark' : 'primary'}
          onClick={onSelect}
          disabled={disabled}
          aria-pressed={selected}
        >
          {selected ? <><Check size={16} /> Selected</> : actionLabel}
        </Button>
        {note && <Text variant="caption">{note}</Text>}
      </div>
    </article>
  );
}
