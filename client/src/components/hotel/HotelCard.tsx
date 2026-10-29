import type { Hotel } from '../../types/hotel';
import Text from '../ui/Text';
import Button from '../ui/Button';

export default function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <article className="card">
      <div className="card-image">Photo</div>
      <div className="card-body">
        <Text variant="subheading">{hotel.name}</Text>
        <Text variant="caption">
          {hotel.city} · {'★'.repeat(hotel.star_rating)}
        </Text>
        {hotel.min_price && (
          <Text variant="body">
            <strong>R{Number(hotel.min_price).toFixed(0)}</strong> / night
          </Text>
        )}
        <Button variant="secondary">View stay</Button>
      </div>
    </article>
  );
}